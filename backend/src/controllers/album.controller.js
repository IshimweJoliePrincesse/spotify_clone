import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

// @desc    Create a new album
// @route   POST /api/albums
// @access  Private/Artist
export const createAlbum = async (req, res, next) => {
  try {
    const { title, coverImage, genre, description, releaseDate, isExplicit } =
      req.body;

    const album = await Album.create({
      title,
      artist: req.user._id,
      coverImage,
      genre,
      description,
      releaseDate,
      isExplicit,
    });

    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
export const getAlbums = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, genre, search } = req.query;
    const query = {};

    if (genre) {
      query.genre = genre;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const albums = await Album.find(query)
      .populate("artist", "username profilePicture")
      .populate("songs")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Album.countDocuments(query);

    res.json({
      albums,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get album by ID
// @route   GET /api/albums/:id
// @access  Public
export const getAlbumById = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("artist", "username profilePicture")
      .populate("songs");

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.json(album);
  } catch (error) {
    next(error);
  }
};

// @desc    Update album
// @route   PUT /api/albums/:id
// @access  Private/Artist
export const updateAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Check if user is the artist or admin
    if (
      album.artist.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("artist", "username profilePicture")
      .populate("songs");

    res.json(updatedAlbum);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete album
// @route   DELETE /api/albums/:id
// @access  Private/Artist
export const deleteAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Check if user is the artist or admin
    if (
      album.artist.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove album reference from all songs
    await Song.updateMany({ album: album._id }, { $unset: { album: 1 } });

    // Remove album from users' liked albums
    await User.updateMany(
      { likedAlbums: album._id },
      { $pull: { likedAlbums: album._id } }
    );

    await album.deleteOne();
    res.json({ message: "Album removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike album
// @route   PUT /api/albums/:id/like
// @access  Private
export const likeAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    const isLiked = album.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      album.likes = album.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.likedAlbums = user.likedAlbums.filter(
        (id) => id.toString() !== album._id.toString()
      );
    } else {
      // Like
      album.likes.push(req.user._id);
      user.likedAlbums.push(album._id);
    }

    await Promise.all([album.save(), user.save()]);
    res.json({ liked: !isLiked });
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to album
// @route   PUT /api/albums/:id/songs
// @access  Private/Artist
export const addSongToAlbum = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const album = await Album.findById(req.params.id);
    const song = await Song.findById(songId);

    if (!album || !song) {
      return res.status(404).json({ message: "Album or song not found" });
    }

    // Check if user is the artist or admin
    if (
      album.artist.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add song to album
    if (!album.songs.includes(songId)) {
      album.songs.push(songId);
      song.album = album._id;
      await Promise.all([album.save(), song.save()]);
    }

    res.json(album);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from album
// @route   DELETE /api/albums/:id/songs/:songId
// @access  Private/Artist
export const removeSongFromAlbum = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);
    const song = await Song.findById(req.params.songId);

    if (!album || !song) {
      return res.status(404).json({ message: "Album or song not found" });
    }

    // Check if user is the artist or admin
    if (
      album.artist.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove song from album
    album.songs = album.songs.filter(
      (id) => id.toString() !== req.params.songId
    );
    song.album = undefined;
    await Promise.all([album.save(), song.save()]);

    res.json(album);
  } catch (error) {
    next(error);
  }
};
