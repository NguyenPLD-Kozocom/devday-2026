import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { audio } from './utils/audio';

function App() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audio.setMuted(isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isMuted={isMuted} toggleMute={toggleMute} />} />
        <Route path="/game" element={<Game isMuted={isMuted} toggleMute={toggleMute} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
