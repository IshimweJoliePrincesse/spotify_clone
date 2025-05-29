import { UserPreferences } from "../models/userPreferences.model.js";

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
export const getUserPreferences = async (req, res, next) => {
  try {
    let preferences = await UserPreferences.findOne({ user: req.user._id });

    if (!preferences) {
      preferences = await UserPreferences.create({ user: req.user._id });
    }

    res.json(preferences);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/preferences
// @access  Private
export const updateUserPreferences = async (req, res, next) => {
  try {
    const preferences = await UserPreferences.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences);
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to recently played
// @route   POST /api/preferences/recently-played
// @access  Private
export const addToRecentlyPlayed = async (req, res, next) => {
  try {
    const { songId } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          recentlyPlayed: {
            song: songId,
            playedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences);
  } catch (error) {
    next(error);
  }
};

// @desc    Update queue
// @route   PUT /api/preferences/queue
// @access  Private
export const updateQueue = async (req, res, next) => {
  try {
    const { queue } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { user: req.user._id },
      { queue },
      { new: true }
    );

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently played songs
// @route   GET /api/preferences/recently-played
// @access  Private
export const getRecentlyPlayed = async (req, res, next) => {
  try {
    const preferences = await UserPreferences.findOne({ user: req.user._id })
      .populate("recentlyPlayed.song")
      .select("recentlyPlayed");

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences.recentlyPlayed);
  } catch (error) {
    next(error);
  }
};

// @desc    Get queue
// @route   GET /api/preferences/queue
// @access  Private
export const getQueue = async (req, res, next) => {
  try {
    const preferences = await UserPreferences.findOne({ user: req.user._id })
      .populate("queue.song")
      .select("queue");

    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    res.json(preferences.queue);
  } catch (error) {
    next(error);
  }
};
