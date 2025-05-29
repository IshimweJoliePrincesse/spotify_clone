import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-gray-900 h-full p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Spotify Clone</h1>
      </div>

      <nav className="space-y-2">
        <Link
          to="/"
          className={`block px-4 py-2 rounded-lg ${
            isActive("/")
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Home
        </Link>

        <Link
          to="/profile"
          className={`block px-4 py-2 rounded-lg ${
            isActive("/profile")
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Profile
        </Link>

        {user?.role === "artist" && (
          <>
            <div className="pt-4 border-t border-gray-700">
              <h2 className="px-4 text-sm font-semibold text-gray-400 uppercase">
                Artist Tools
              </h2>
            </div>

            <Link
              to="/upload"
              className={`block px-4 py-2 rounded-lg ${
                isActive("/upload")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Upload Song
            </Link>

            <Link
              to="/create-playlist"
              className={`block px-4 py-2 rounded-lg ${
                isActive("/create-playlist")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Create Playlist
            </Link>
          </>
        )}

        <div className="pt-4 border-t border-gray-700">
          <h2 className="px-4 text-sm font-semibold text-gray-400 uppercase">
            Library
          </h2>
        </div>

        <Link
          to="/favorites"
          className={`block px-4 py-2 rounded-lg ${
            isActive("/favorites")
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Favorites
        </Link>

        <Link
          to="/recently-played"
          className={`block px-4 py-2 rounded-lg ${
            isActive("/recently-played")
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          Recently Played
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
