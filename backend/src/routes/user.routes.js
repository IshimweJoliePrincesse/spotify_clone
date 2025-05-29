import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  getRecentlyPlayed,
  addToRecentlyPlayed,
  getFavoriteSongs,
  toggleFavoriteSong,
  getUserFavoriteAlbums,
  toggleFavoriteAlbum,
  getFavoritePlaylists,
  toggleFavoritePlaylist,
  getUserProfile,
  getUserPlaylists,
  getUserFavoriteSongs,
  getUserRecentlyPlayed,
  getUserFollowing,
  getUserFollowers,
  followUser,
  unfollowUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Preferences routes
router.put("/preferences", protect, updatePreferences);

// Recently played routes
router.get("/recently-played", protect, getRecentlyPlayed);
router.post("/recently-played/:songId", protect, addToRecentlyPlayed);

// Favorites routes
router.get("/favorites/songs", protect, getFavoriteSongs);
router.post("/favorites/songs/:songId", protect, toggleFavoriteSong);
router.get("/favorites/albums", protect, getUserFavoriteAlbums);
router.post("/favorites/albums/:albumId", protect, toggleFavoriteAlbum);
router.get("/favorites/playlists", protect, getFavoritePlaylists);
router.post(
  "/favorites/playlists/:playlistId",
  protect,
  toggleFavoritePlaylist
);

// Get user's favorite albums
router.get("/:id/favorite-albums", getUserFavoriteAlbums);

export default router;
