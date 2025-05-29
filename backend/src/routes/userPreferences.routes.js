import express from "express";
import {
  getUserPreferences,
  updateUserPreferences,
  addToRecentlyPlayed,
  updateQueue,
  getRecentlyPlayed,
  getQueue,
} from "../controllers/userPreferences.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getUserPreferences)
  .put(protect, updateUserPreferences);

router
  .route("/recently-played")
  .get(protect, getRecentlyPlayed)
  .post(protect, addToRecentlyPlayed);

router.route("/queue").get(protect, getQueue).put(protect, updateQueue);

export default router;
