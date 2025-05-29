import express from "express";
import {
  createSong,
  getSongs,
  getSongById,
  updateSong,
  deleteSong,
  likeSong,
} from "../controllers/song.controller.js";
import { protect, artist } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getSongs).post(protect, artist, createSong);

router
  .route("/:id")
  .get(getSongById)
  .put(protect, artist, updateSong)
  .delete(protect, artist, deleteSong);

router.put("/:id/like", protect, likeSong);

export default router;
