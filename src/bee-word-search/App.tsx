import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Game } from "./pages/Game";
import { audio } from "./utils/audio";
import "./App.css";

function App() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audio.setMuted(isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Home isMuted={isMuted} toggleMute={toggleMute} />}
      />
      <Route
        path="/game"
        element={<Game isMuted={isMuted} toggleMute={toggleMute} />}
      />
    </Routes>
  );
}

export default App;
