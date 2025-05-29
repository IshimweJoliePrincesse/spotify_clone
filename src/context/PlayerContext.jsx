import { createContext, useRef, useState, useEffect } from "react";
import { songsAPI, preferencesAPI } from "../services/api";

export const PlayerContext = createContext();
const PlayerContextProvider = (props) => {
  const audioRef = useRef();

  const seekBg = useRef();
  const seekBar = useRef();

  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: {
      second: 0,
      minute: 0,
    },
    totalTime: {
      second: 0,
      minute: 0,
    },
  });

  const play = () => {
    if (audioRef.current && track) {
      audioRef.current.play();
      setPlayStatus(true);
    }
  };
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayStatus(false);
    }
  };
  const playWithId = async (id) => {
    try {
      const response = await songsAPI.getById(id);
      const song = response.data;
      setTrack(song);
      if (audioRef.current) {
        audioRef.current.src = song.fileUrl;
        await audioRef.current.play();
        setPlayStatus(true);
        // Add to recently played
        await preferencesAPI.addToRecentlyPlayed(id);
      }
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };
  const previous = async () => {
    if (track) {
      try {
        const response = await songsAPI.getAll({
          page: 1,
          limit: 1,
          before: track.id,
        });
        if (response.data.songs.length > 0) {
          await playWithId(response.data.songs[0].id);
        }
      } catch (error) {
        console.error("Error playing previous song:", error);
      }
    }
  };
  const next = async () => {
    if (track) {
      try {
        const response = await songsAPI.getAll({
          page: 1,
          limit: 1,
          after: track.id,
        });
        if (response.data.songs.length > 0) {
          await playWithId(response.data.songs[0].id);
        }
      } catch (error) {
        console.error("Error playing next song:", error);
      }
    }
  };

  const seekSong = async (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime =
        (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
        audioRef.current.duration;
    }
  };
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        if (seekBar.current) {
          seekBar.current.style.width =
            Math.floor(
              (audioRef.current.currentTime / audioRef.current.duration) * 100
            ) + "%";
        }
        setTime({
          currentTime: {
            second: Math.floor(audioRef.current.currentTime % 60),
            minute: Math.floor(audioRef.current.currentTime / 60),
          },
          totalTime: {
            second: Math.floor(audioRef.current.duration % 60),
            minute: Math.floor(audioRef.current.duration / 60),
          },
        });
      };
    }
  }, [audioRef.current]);
  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,
  };
  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
