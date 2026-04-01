import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StartScreen } from '../components/StartScreen';
import { RulesModal } from '../components/RulesModal';

interface HomeProps {
  isMuted: boolean;
  toggleMute: () => void;
}

export function Home({ isMuted, toggleMute }: HomeProps) {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handleStart = () => {
    navigate('/game');
  };

  return (
    <>
      <StartScreen
        onStart={handleStart}
        onShowRules={() => setShowRules(true)}
        isMuted={isMuted}
        toggleMute={toggleMute}
      />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </>
  );
}
