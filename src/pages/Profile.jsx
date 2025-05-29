import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    playlists: 0,
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: null,
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [playlistsRes, followersRes, followingRes] = await Promise.all([
        userAPI.getUserPlaylists(user.id),
        userAPI.getUserFollowers(user.id),
        userAPI.getUserFollowing(user.id),
      ]);

      setStats({
        playlists: playlistsRes.data.length,
        followers: followersRes.data.length,
        following: followingRes.data.length,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await updateProfile(formDataToSend);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user.avatar || "https://via.placeholder.com/150"}
            alt={user.username}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.playlists}</p>
            <p className="text-gray-400">Playlists</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.followers}</p>
            <p className="text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.following}</p>
            <p className="text-gray-400">Following</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Profile Picture</label>
          <input
            type="file"
            name="avatar"
            onChange={handleChange}
            accept="image/*"
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
