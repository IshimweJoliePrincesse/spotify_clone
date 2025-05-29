import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { playlistsAPI, songsAPI } from "../services/api";
import { toast } from "react-toastify";
import SongItem from "../components/SongItem";

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const response = await playlistsAPI.getById(id);
      setPlaylist(response.data);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      toast.error("Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await playlistsAPI.follow(id);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed playlist" : "Following playlist");
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlistsAPI.removeSong(id, songId);
      setPlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((song) => song.id !== songId),
      }));
      toast.success("Song removed from playlist");
    } catch (error) {
      toast.error("Failed to remove song");
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!playlist) {
    return <div className="text-white">Playlist not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
          <p className="text-gray-400">
            {playlist.songs?.length || 0} songs • Created by{" "}
            {playlist.owner?.username}
          </p>
        </div>
        <button
          onClick={handleFollow}
          className={`px-4 py-2 rounded-full ${
            isFollowing
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      <div className="space-y-4">
        {playlist.songs?.map((song) => (
          <div key={song.id} className="flex items-center justify-between">
            <SongItem song={song} />
            <button
              onClick={() => handleRemoveSong(song.id)}
              className="text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {playlist.songs?.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No songs in this playlist yet
        </div>
      )}
    </div>
  );
};

export default Playlist;
