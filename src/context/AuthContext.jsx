import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem("token", token);
      setUser(userData);
      return userData;
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await authAPI.register({ username, email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem("token", token);
      setUser(userData);
      return userData;
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Profile update failed");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
