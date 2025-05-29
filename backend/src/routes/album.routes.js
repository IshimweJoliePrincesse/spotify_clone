import express from "express";
import {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  likeAlbum,
  addSongToAlbum,
  removeSongFromAlbum,
} from "../controllers/album.controller.js";
import { protect, artist } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getAlbums).post(protect, artist, createAlbum);

router
  .route("/:id")
  .get(getAlbumById)
  .put(protect, artist, updateAlbum)
  .delete(protect, artist, deleteAlbum);

router.put("/:id/like", protect, likeAlbum);

router.route("/:id/songs").put(protect, artist, addSongToAlbum);

router.delete("/:id/songs/:songId", protect, artist, removeSongFromAlbum);

export default router;
