import axios from "axios";

const API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
};

// Songs API calls
export const songsAPI = {
  getAll: (params) => api.get("/songs", { params }),
  getById: (id) => api.get(`/songs/${id}`),
  create: (songData) => api.post("/songs", songData),
  update: (id, songData) => api.put(`/songs/${id}`, songData),
  delete: (id) => api.delete(`/songs/${id}`),
  like: (id) => api.put(`/songs/${id}/like`),
};

// Albums API calls
export const albumsAPI = {
  getAll: (params) => api.get("/albums", { params }),
  getById: (id) => api.get(`/albums/${id}`),
  create: (albumData) => api.post("/albums", albumData),
  update: (id, albumData) => api.put(`/albums/${id}`, albumData),
  delete: (id) => api.delete(`/albums/${id}`),
  like: (id) => api.put(`/albums/${id}/like`),
  addSong: (id, songId) => api.put(`/albums/${id}/songs`, { songId }),
  removeSong: (id, songId) => api.delete(`/albums/${id}/songs/${songId}`),
};

// Playlists API calls
export const playlistsAPI = {
  getAll: (params) => api.get("/playlists", { params }),
  getUserPlaylists: () => api.get("/playlists/user"),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (playlistData) => api.post("/playlists", playlistData),
  update: (id, playlistData) => api.put(`/playlists/${id}`, playlistData),
  delete: (id) => api.delete(`/playlists/${id}`),
  follow: (id) => api.put(`/playlists/${id}/follow`),
  addSong: (id, songId) => api.put(`/playlists/${id}/songs`, { songId }),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`),
};

// User Preferences API calls
export const preferencesAPI = {
  get: () => api.get("/preferences"),
  update: (preferences) => api.put("/preferences", preferences),
  addToRecentlyPlayed: (songId) =>
    api.post("/preferences/recently-played", { songId }),
  getRecentlyPlayed: () => api.get("/preferences/recently-played"),
  updateQueue: (queue) => api.put("/preferences/queue", { queue }),
  getQueue: () => api.get("/preferences/queue"),
};

// User API calls
export const userAPI = {
  // Profile
  getProfile: () => api.get("/user/profile"),
  updateProfile: (userData) => api.put("/user/profile", userData),

  // Preferences
  updatePreferences: (preferences) => api.put("/user/preferences", preferences),

  // Recently played
  getRecentlyPlayed: () => api.get("/user/recently-played"),

  // Favorites
  getFavoriteSongs: () => api.get("/user/favorites/songs"),
  toggleFavoriteSong: (songId) => api.post(`/user/favorites/songs/${songId}`),
  getFavoriteAlbums: (userId) => api.get(`/user/${userId}/favorite-albums`),
  toggleFavoriteAlbum: (albumId) =>
    api.post(`/user/favorites/albums/${albumId}`),
  getFavoritePlaylists: () => api.get("/user/favorites/playlists"),
  toggleFavoritePlaylist: (playlistId) =>
    api.post(`/user/favorites/playlists/${playlistId}`),

  // User profile
  getUserProfile: (userId) => api.get(`/user/${userId}`),
  getUserPlaylists: (userId) => api.get(`/user/${userId}/playlists`),
  getUserFavoriteSongs: (userId) => api.get(`/user/${userId}/favorite-songs`),
  getUserRecentlyPlayed: (userId) => api.get(`/user/${userId}/recently-played`),

  // Following/Followers
  getUserFollowing: (userId) => api.get(`/user/${userId}/following`),
  getUserFollowers: (userId) => api.get(`/user/${userId}/followers`),
  followUser: (userId) => api.post(`/user/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/user/${userId}/follow`),
};

export default api;
