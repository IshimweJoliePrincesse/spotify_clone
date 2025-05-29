import { User } from "../models/user.model.js";
import { Album } from "../models/album.model.js";
import { Song } from "../models/song.model.js";
import { Playlist } from "../models/playlist.model.js";
import { UserPreferences } from "../models/userPreferences.model.js";
import { validationResult } from "express-validator";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userModel = new User();
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profile_picture,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Error getting user profile" });
  }
};

// Get user's playlists
export const getUserPlaylists = async (req, res) => {
  try {
    const playlistModel = new Playlist();
    const playlists = await playlistModel.findByUser(req.params.id);
    res.json(playlists);
  } catch (error) {
    console.error("Get user playlists error:", error);
    res.status(500).json({ message: "Error getting user playlists" });
  }
};

// Get user's favorite songs
export const getUserFavoriteSongs = async (req, res) => {
  try {
    const userModel = new User();
    const songs = await userModel.getFavoriteSongs(req.params.id);
    res.json(songs);
  } catch (error) {
    console.error("Get user favorite songs error:", error);
    res.status(500).json({ message: "Error getting user favorite songs" });
  }
};

// Get user's favorite albums
export const getUserFavoriteAlbums = async (req, res) => {
  try {
    const userModel = new User();
    const albums = await userModel.getUserFavoriteAlbums(req.params.id);
    res.json(albums);
  } catch (error) {
    console.error("Get user favorite albums error:", error);
    res.status(500).json({ message: "Error getting user favorite albums" });
  }
};

// Get user's recently played songs
export const getUserRecentlyPlayed = async (req, res) => {
  try {
    const userModel = new User();
    const songs = await userModel.getRecentlyPlayed(req.params.id);
    res.json(songs);
  } catch (error) {
    console.error("Get user recently played error:", error);
    res.status(500).json({ message: "Error getting user recently played" });
  }
};

// Get user's following
export const getUserFollowing = async (req, res) => {
  try {
    const userModel = new User();
    const following = await userModel.getFollowing(req.params.id);
    res.json(following);
  } catch (error) {
    console.error("Get user following error:", error);
    res.status(500).json({ message: "Error getting user following" });
  }
};

// Get user's followers
export const getUserFollowers = async (req, res) => {
  try {
    const userModel = new User();
    const followers = await userModel.getFollowers(req.params.id);
    res.json(followers);
  } catch (error) {
    console.error("Get user followers error:", error);
    res.status(500).json({ message: "Error getting user followers" });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const userModel = new User();
    const followerId = req.user.id;
    const followingId = req.params.id;

    if (followerId === followingId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const query = `
      INSERT INTO user_following (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
      RETURNING *
    `;

    const result = await userModel.pool.query(query, [followerId, followingId]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Already following this user" });
    }

    res.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Error following user" });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const userModel = new User();
    const followerId = req.user.id;
    const followingId = req.params.id;

    const query = `
      DELETE FROM user_following
      WHERE follower_id = $1 AND following_id = $2
      RETURNING *
    `;

    const result = await userModel.pool.query(query, [followerId, followingId]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Not following this user" });
    }

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Error unfollowing user" });
  }
};

// Add song to recently played
export const addToRecentlyPlayed = async (req, res) => {
  try {
    const userModel = new User();
    const { songId } = req.params;
    const userId = req.user.id;

    // First, remove the song if it exists in the recently_played table
    const deleteQuery = `
      DELETE FROM recently_played
      WHERE user_id = $1 AND song_id = $2
    `;
    await userModel.pool.query(deleteQuery, [userId, songId]);

    // Then insert the song at the beginning
    const insertQuery = `
      INSERT INTO recently_played (user_id, song_id, played_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `;
    await userModel.pool.query(insertQuery, [userId, songId]);

    // Keep only the last 50 songs
    const cleanupQuery = `
      DELETE FROM recently_played
      WHERE user_id = $1
      AND id NOT IN (
        SELECT id
        FROM recently_played
        WHERE user_id = $1
        ORDER BY played_at DESC
        LIMIT 50
      )
    `;
    await userModel.pool.query(cleanupQuery, [userId]);

    res.json({ message: "Song added to recently played" });
  } catch (error) {
    console.error("Add to recently played error:", error);
    res.status(500).json({ message: "Error adding song to recently played" });
  }
};

// Get user's favorite playlists
export const getFavoritePlaylists = async (req, res) => {
  try {
    const userModel = new User();
    const playlists = await userModel.getFavoritePlaylists(req.user.id);
    res.json(playlists);
  } catch (error) {
    console.error("Get favorite playlists error:", error);
    res.status(500).json({ message: "Error getting favorite playlists" });
  }
};

// Get current user's profile
export const getProfile = async (req, res) => {
  try {
    const userModel = new User();
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profile_picture,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error getting profile" });
  }
};

// Update current user's profile
export const updateProfile = async (req, res) => {
  try {
    const userModel = new User();
    const { username, email } = req.body;

    const updatedUser = await userModel.update(req.user.id, {
      username,
      email,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const preferencesModel = new UserPreferences();
    const preferences = await preferencesModel.update(req.user.id, req.body);
    res.json(preferences);
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Error updating preferences" });
  }
};

// Get current user's recently played songs
export const getRecentlyPlayed = async (req, res) => {
  try {
    const userModel = new User();
    const songs = await userModel.getRecentlyPlayed(req.user.id);
    res.json(songs);
  } catch (error) {
    console.error("Get recently played error:", error);
    res.status(500).json({ message: "Error getting recently played" });
  }
};

// Get current user's favorite songs
export const getFavoriteSongs = async (req, res) => {
  try {
    const userModel = new User();
    const songs = await userModel.getFavoriteSongs(req.user.id);
    res.json(songs);
  } catch (error) {
    console.error("Get favorite songs error:", error);
    res.status(500).json({ message: "Error getting favorite songs" });
  }
};

// Toggle favorite song
export const toggleFavoriteSong = async (req, res) => {
  try {
    const userModel = new User();
    const { songId } = req.params;
    const userId = req.user.id;

    const query = `
      INSERT INTO user_favorite_songs (user_id, song_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, song_id) DO DELETE
      RETURNING *
    `;

    const result = await userModel.pool.query(query, [userId, songId]);
    const isFavorite = result.rows.length > 0;

    res.json({ isFavorite });
  } catch (error) {
    console.error("Toggle favorite song error:", error);
    res.status(500).json({ message: "Error toggling favorite song" });
  }
};

// Toggle favorite album
export const toggleFavoriteAlbum = async (req, res) => {
  try {
    const userModel = new User();
    const { albumId } = req.params;
    const userId = req.user.id;

    const query = `
      INSERT INTO user_favorite_albums (user_id, album_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, album_id) DO DELETE
      RETURNING *
    `;

    const result = await userModel.pool.query(query, [userId, albumId]);
    const isFavorite = result.rows.length > 0;

    res.json({ isFavorite });
  } catch (error) {
    console.error("Toggle favorite album error:", error);
    res.status(500).json({ message: "Error toggling favorite album" });
  }
};

// Toggle favorite playlist
export const toggleFavoritePlaylist = async (req, res) => {
  try {
    const userModel = new User();
    const { playlistId } = req.params;
    const userId = req.user.id;

    const query = `
      INSERT INTO user_favorite_playlists (user_id, playlist_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, playlist_id) DO DELETE
      RETURNING *
    `;

    const result = await userModel.pool.query(query, [userId, playlistId]);
    const isFavorite = result.rows.length > 0;

    res.json({ isFavorite });
  } catch (error) {
    console.error("Toggle favorite playlist error:", error);
    res.status(500).json({ message: "Error toggling favorite playlist" });
  }
};
