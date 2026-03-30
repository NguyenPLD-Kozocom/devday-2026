import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { HexagonGrid } from './components/HexagonGrid';
import { CollectionTray } from './components/CollectionTray';
import { GiftModal, LoseModal, WinModal, GiftWinModal } from './components/Modals';
import { audio } from './utils/audio';

export interface CellData {
  id: string;
  row: number;
  col: number;
  type: 'letter' | 'gift' | 'boom';
  content: string;
  isRevealed: boolean;
}

export interface TileData extends CellData {
  isDisabled: boolean;
}

const MAX_TURNS = 4;

function generateInitialCells(): CellData[] {
  const contents = [
    { type: 'letter', content: 'Kozocom' },
    ...Array(8).fill({ type: 'letter', content: 'Ko' }),
    ...Array(8).fill({ type: 'letter', content: 'Com' }),
    ...Array(4).fill({ type: 'letter', content: 'Zo' }),
    ...Array(4).fill({ type: 'gift', content: '🎁' }),
    ...Array(4).fill({ type: 'boom', content: '💣' })
  ];

  const shuffled = [...contents].sort(() => Math.random() - 0.5);

  const ROWS = [5, 6, 7, 6, 5];
  let cellIndex = 0;
  const cells: CellData[] = [];

  for (let r = 0; r < ROWS.length; r++) {
    for (let c = 0; c < ROWS[r]; c++) {
      if (cellIndex < shuffled.length) {
        cells.push({
          id: `cell-${r}-${c}`,
          row: r,
          col: c,
          type: shuffled[cellIndex].type as 'letter' | 'gift' | 'boom',
          content: shuffled[cellIndex].content,
          isRevealed: false
        });
        cellIndex++;
      }
    }
  }

  return cells;
}

function App() {
  const [cells, setCells] = useState<CellData[]>([]);
  const [collectedTiles, setCollectedTiles] = useState<TileData[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shake, setShake] = useState(false);
  const [activeGiftTile, setActiveGiftTile] = useState<TileData | null>(null);
  const [loseType, setLoseType] = useState<'boom' | 'outOfTurns' | null>(null);
  const [flippingCellId, setFlippingCellId] = useState<string | null>(null);
  const [winningTiles, setWinningTiles] = useState<TileData[]>([]);
  const [winType, setWinType] = useState<'word' | 'gift' | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const hasWonRef = useRef(false);

  useEffect(() => {
    audio.setMuted(isMuted);
  }, [isMuted]);

  const initGame = useCallback(() => {
    setCells(generateInitialCells());
    setCollectedTiles([]);
    setGameStatus('playing');
    setShake(false);
    setActiveGiftTile(null);
    setLoseType(null);
    setFlippingCellId(null);
    setWinningTiles([]);
    setWinType(null);
    setIsBusy(false);
    hasWonRef.current = false;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const actualTurnsLeft = MAX_TURNS - collectedTiles.length;

  useEffect(() => {
    const extractedWords = collectedTiles.filter(t => !t.isDisabled).map(t => t.content);

    const winningWords = ['Ko', 'Zo', 'Com'];
    const hasKozocom = extractedWords.includes('Kozocom');
    const hasAllParts = winningWords.every(word => extractedWords.includes(word));

    if (hasKozocom || hasAllParts) {
      if (!hasWonRef.current) {
        if (hasKozocom) {
          const kt = collectedTiles.find(t => t.content === 'Kozocom' && !t.isDisabled);
          if (kt) setWinningTiles([kt]);
        } else {
          const parts = winningWords.map(word =>
            collectedTiles.find(t => t.content === word && !t.isDisabled)
          ).filter(Boolean) as TileData[];
          setWinningTiles(parts);
        }
        setWinType('word');
        setGameStatus('won');
        audio.playWin();
        hasWonRef.current = true;
      }
    }
  }, [collectedTiles, gameStatus]);

  const handleCellClick = (cell: CellData) => {
    if (gameStatus !== 'playing' || actualTurnsLeft <= 0 || flippingCellId || isBusy) return;

    audio.playClick();
    setIsBusy(true);

    // Mark as revealed in grid
    setCells(prev => prev.map(c => c.id === cell.id ? { ...c, isRevealed: true } : c));
    setFlippingCellId(cell.id);

    // Wait for flip animation (1s) and additional delay (2s)
    setTimeout(() => {
      setFlippingCellId(null);

      const newTile: TileData = {
        ...cell,
        isDisabled: false
      };

      setCollectedTiles(prev => {
        const newTiles = [...prev, newTile];
        const isLastTurn = MAX_TURNS - newTiles.length <= 0;

        if (cell.type === 'boom') {
          setTimeout(() => setShake(true), 100);
          setTimeout(() => {
            setLoseType('boom');
            setGameStatus(status => status === 'playing' ? 'lost' : status);
            audio.playBoom();
          }, 500);
        } else if (cell.type === 'gift') {
          setTimeout(() => {
            setActiveGiftTile(newTile);
            audio.playGift();
          }, 400);
        } else {
          if (isLastTurn) {
            const prevExtracted = prev.filter(t => !t.isDisabled).map(t => t.content);
            const extractedWords = [...prevExtracted, newTile.content];
            const isKozocomWin = newTile.content === 'Kozocom';
            const isWordWin = extractedWords.includes('Ko') && extractedWords.includes('Zo') && extractedWords.includes('Com');
            const isWin = isKozocomWin || isWordWin;

            if (isWin) {
              if (isKozocomWin) {
                setWinningTiles([newTile]);
                setWinType('word');
              }
            } else {
              setTimeout(() => {
                setLoseType('outOfTurns');
                setGameStatus(status => status === 'playing' ? 'lost' : status);
              }, 400);
            }
          } else if (cell.content === 'Kozocom') {
            setWinningTiles([newTile]);
            setWinType('word');
          } else {
            // Normal letter, not win, not last turn -> allow next click
            setIsBusy(false);
          }
        }
        return newTiles;
      });
    }, 0);
  };

  const handleClaimGift = () => {
    setWinType('gift');
    setGameStatus('won');
    audio.playWin();
    setActiveGiftTile(null);
  };

  const handleContinue = () => {
    setActiveGiftTile(null);
    setIsBusy(false);
    if (activeGiftTile) {
      setCollectedTiles(prev => {
        const newTiles = prev.map(t => t.id === activeGiftTile.id ? { ...t, isDisabled: true } : t);
        const isLastTurn = MAX_TURNS - newTiles.length <= 0;

        if (isLastTurn) {
          setTimeout(() => {
            setLoseType('outOfTurns');
            setGameStatus(prevStatus => prevStatus === 'playing' ? 'lost' : prevStatus);
          }, 300);
        }

        return newTiles;
      });
    }
  };

  return (
    <Layout shake={shake}>
      <Header
        isMuted={isMuted}
        toggleMute={() => setIsMuted(!isMuted)}
        turnsLeft={actualTurnsLeft}
        maxTurns={MAX_TURNS}
      />

      <div className="w-full flex-1 flex flex-col items-center justify-center relative mt-16 z-20">
        <HexagonGrid cells={cells} collectedTiles={collectedTiles} onCellClick={handleCellClick} flippingCellId={flippingCellId} />
        <CollectionTray tiles={collectedTiles} maxSlots={MAX_TURNS} />
      </div>

      <GiftModal
        isOpen={!!activeGiftTile}
        onClaim={handleClaimGift}
        onContinue={handleContinue}
      />

      <LoseModal
        isOpen={gameStatus === 'lost'}
        type={loseType}
        onRestart={initGame}
      />

      <WinModal
        isOpen={gameStatus === 'won' && winType === 'word'}
        onRestart={initGame}
        winningTiles={winningTiles}
      />

      <GiftWinModal
        isOpen={gameStatus === 'won' && winType === 'gift'}
        onRestart={initGame}
        giftTile={activeGiftTile || collectedTiles.find(t => t.type === 'gift' && !t.isDisabled) || null}
      />
    </Layout>
  );
}

export default App;
