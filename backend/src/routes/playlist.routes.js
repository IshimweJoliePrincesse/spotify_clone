import express from "express";
import {
  createPlaylist,
  getPlaylists,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  followPlaylist,
} from "../controllers/playlist.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getPlaylists).post(protect, createPlaylist);

router.get("/user", protect, getUserPlaylists);

router
  .route("/:id")
  .get(protect, getPlaylistById)
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

router.put("/:id/follow", protect, followPlaylist);

router.route("/:id/songs").put(protect, addSongToPlaylist);

router.delete("/:id/songs/:songId", protect, removeSongFromPlaylist);

export default router;
