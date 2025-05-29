import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import PlayerContextProvider from "./context/PlayerContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PlayerContextProvider>
        <App />
      </PlayerContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
