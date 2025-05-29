import { Playlist } from "../models/playlist.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

// @desc    Create a new playlist
// @route   POST /api/playlists
// @access  Private
export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, coverImage, isPublic, tags } = req.body;

    const playlist = await Playlist.create({
      title,
      description,
      owner: req.user._id,
      coverImage,
      isPublic,
      tags,
    });

    // Add playlist to user's playlists
    await User.findByIdAndUpdate(req.user._id, {
      $push: { playlists: playlist._id },
    });

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all playlists
// @route   GET /api/playlists
// @access  Public
export const getPlaylists = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    const playlists = await Playlist.find(query)
      .populate("owner", "username profilePicture")
      .populate("songs")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Playlist.countDocuments(query);

    res.json({
      playlists,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's playlists
// @route   GET /api/playlists/user
// @access  Private
export const getUserPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate("songs")
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Public/Private
export const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("owner", "username profilePicture")
      .populate("songs");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if playlist is private and user is not the owner
    if (
      !playlist.isPublic &&
      playlist.owner._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
export const updatePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user is the owner
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("owner", "username profilePicture")
      .populate("songs");

    res.json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
export const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user is the owner
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove playlist from user's playlists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { playlists: playlist._id },
    });

    // Remove playlist from followers' playlists
    await User.updateMany(
      { following: playlist._id },
      { $pull: { following: playlist._id } }
    );

    await playlist.deleteOne();
    res.json({ message: "Playlist removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to playlist
// @route   PUT /api/playlists/:id/songs
// @access  Private
export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    const song = await Song.findById(songId);

    if (!playlist || !song) {
      return res.status(404).json({ message: "Playlist or song not found" });
    }

    // Check if user is the owner
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add song to playlist if not already present
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if user is the owner
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove song from playlist
    playlist.songs = playlist.songs.filter(
      (id) => id.toString() !== req.params.songId
    );
    await playlist.save();

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Follow/Unfollow playlist
// @route   PUT /api/playlists/:id/follow
// @access  Private
export const followPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    const isFollowing = playlist.followers.includes(req.user._id);

    if (isFollowing) {
      // Unfollow
      playlist.followers = playlist.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      user.following = user.following.filter(
        (id) => id.toString() !== playlist._id.toString()
      );
    } else {
      // Follow
      playlist.followers.push(req.user._id);
      user.following.push(playlist._id);
    }

    await Promise.all([playlist.save(), user.save()]);
    res.json({ following: !isFollowing });
  } catch (error) {
    next(error);
  }
};
