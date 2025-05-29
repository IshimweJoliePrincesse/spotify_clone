import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { User } from "../models/user.model.js";

// @desc    Create a new song
// @route   POST /api/songs
// @access  Private/Artist
export const createSong = async (req, res, next) => {
  try {
    const {
      title,
      album,
      duration,
      fileUrl,
      coverImage,
      genre,
      lyrics,
      isExplicit,
    } = req.body;

    const song = await Song.create({
      title,
      artist: req.user._id,
      album,
      duration,
      fileUrl,
      coverImage,
      genre,
      lyrics,
      isExplicit,
    });

    // Add song to album if provided
    if (album) {
      await Album.findByIdAndUpdate(album, {
        $push: { songs: song._id },
      });
    }

    res.status(201).json(song);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
export const getSongs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, genre, search } = req.query;
    const query = {};

    if (genre) {
      query.genre = genre;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const songs = await Song.find(query)
      .populate("artist", "username profilePicture")
      .populate("album", "title coverImage")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Song.countDocuments(query);

    res.json({
      songs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get song by ID
// @route   GET /api/songs/:id
// @access  Public
export const getSongById = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artist", "username profilePicture")
      .populate("album", "title coverImage");

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    res.json(song);
  } catch (error) {
    next(error);
  }
};

// @desc    Update song
// @route   PUT /api/songs/:id
// @access  Private/Artist
export const updateSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Check if user is the artist or admin
    if (
      song.artist.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedSong = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("artist", "username profilePicture")
      .populate("album", "title coverImage");

    res.json(updatedSong);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete song
// @route   DELETE /api/songs/:id
// @access  Private/Artist
export const deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Check if user is the artist or admin
    if (
      song.artist.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove song from album if it exists
    if (song.album) {
      await Album.findByIdAndUpdate(song.album, {
        $pull: { songs: song._id },
      });
    }

    // Remove song from users' liked songs
    await User.updateMany(
      { likedSongs: song._id },
      { $pull: { likedSongs: song._id } }
    );

    await song.deleteOne();
    res.json({ message: "Song removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike song
// @route   PUT /api/songs/:id/like
// @access  Private
export const likeSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const isLiked = song.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      song.likes = song.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.likedSongs = user.likedSongs.filter(
        (id) => id.toString() !== song._id.toString()
      );
    } else {
      // Like
      song.likes.push(req.user._id);
      user.likedSongs.push(song._id);
    }

    await Promise.all([song.save(), user.save()]);
    res.json({ liked: !isLiked });
  } catch (error) {
    next(error);
  }
};
