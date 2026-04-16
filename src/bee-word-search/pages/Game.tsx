import { useState, useEffect, useCallback, useRef } from "react";
import { Layout } from "../components/Layout";
import { Header } from "../components/Header";
import { HexagonGrid } from "../components/HexagonGrid";
import { CollectionTray } from "../components/CollectionTray";
import {
  GiftModal,
  LoseModal,
  WinModal,
  GiftWinModal,
} from "../components/Modals";
import { RulesModal } from "../components/RulesModal";
import { MergeAnimation } from "../components/MergeAnimation";
import { audio } from "../utils/audio";
import type { CellData, TileData } from "../types/game";
import buttonHelp from "../assets/button_help.png";
import buttonSoundOff from "../assets/button_sound_off.png";
import buttonSoundOn from "../assets/button_sound_on.png";

const MAX_TURNS = 4;

let sessionGamesPlayed = 0;

function generateInitialCells(canShowKozocom: boolean): CellData[] {
  const showKozocom = canShowKozocom && Math.random() < 0.7;

  const allLetters = ["Ko", "Zo", "Com"];
  const rareIndex = Math.floor(Math.random() * 3);
  const rareLetter = allLetters[rareIndex];
  const commonLetters = allLetters.filter((l) => l !== rareLetter);

  // 50/50 chance for rare letter to appear
  const showRare = Math.random() < 0.5;
  const rareCount = showRare ? 1 : 0;

  const contents: { type: string; content: string }[] = [];

  // Special slot (Kozocom or a common letter)
  contents.push({
    type: "letter",
    content: showKozocom ? "Kozocom" : commonLetters[0],
  });

  // Rare letter (0 or 1)
  if (rareCount > 0) {
    contents.push({ type: "letter", content: rareLetter });
  }

  // Fill remaining slots (20 - rareCount) with common letters evenly
  const remainingLetterSlots = 20 - rareCount;
  const half = Math.floor(remainingLetterSlots / 2);
  for (let i = 0; i < half; i++) {
    contents.push({ type: "letter", content: commonLetters[0] });
  }
  for (let i = 0; i < remainingLetterSlots - half; i++) {
    contents.push({ type: "letter", content: commonLetters[1] });
  }

  // Fixed items (4 gifts, 4 bombs)
  contents.push({ type: "gift", content: "gift-1" });
  contents.push({ type: "gift", content: "gift-2" });
  contents.push({ type: "gift", content: "gift-3" });
  contents.push({ type: "gift", content: "gift-4" });
  for (let i = 0; i < 4; i++) {
    contents.push({ type: "boom", content: "💣" });
  }

  const shuffled = [...contents].sort(() => Math.random() - 0.5);

  const COLS = [1, 4, 3, 4, 5, 4, 3, 4, 1];
  let cellIndex = 0;
  const cells: CellData[] = [];

  for (let c = 0; c < COLS.length; c++) {
    for (let r = 0; r < COLS[c]; r++) {
      if (cellIndex < shuffled.length) {
        cells.push({
          id: `cell-${c}-${r}`,
          row: r,
          col: c,
          type: shuffled[cellIndex].type as "letter" | "gift" | "boom",
          content: shuffled[cellIndex].content,
          isRevealed: false,
        });
        cellIndex++;
      }
    }
  }

  return cells;
}

interface GameProps {
  isMuted: boolean;
  toggleMute: () => void;
}

export function Game({ isMuted, toggleMute }: GameProps) {
  const [cells, setCells] = useState<CellData[]>([]);
  const [collectedTiles, setCollectedTiles] = useState<TileData[]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [shake, setShake] = useState(false);
  const [activeGiftTile, setActiveGiftTile] = useState<TileData | null>(null);
  const [loseType, setLoseType] = useState<"boom" | "outOfTurns" | null>(null);
  const [flippingCellId, setFlippingCellId] = useState<string | null>(null);
  const [winningTiles, setWinningTiles] = useState<TileData[]>([]);
  const [winType, setWinType] = useState<"word" | "gift" | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const hasWonRef = useRef(false);

  const initGame = useCallback(() => {
    const canShowKozocom = sessionGamesPlayed >= 20;

    setCells(generateInitialCells(canShowKozocom));
    setCollectedTiles([]);
    setGameStatus("playing");
    setShake(false);
    setActiveGiftTile(null);
    setLoseType(null);
    setFlippingCellId(null);
    setWinningTiles([]);
    setWinType(null);
    setIsBusy(false);
    setIsMerging(false);
    hasWonRef.current = false;

    // Update stats for the NEXT game
    sessionGamesPlayed++;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const actualTurnsLeft = MAX_TURNS - collectedTiles.length;

  useEffect(() => {
    const extractedWords = collectedTiles
      .filter((t) => !t.isDisabled)
      .map((t) => t.content);

    const winningWords = ["Ko", "Zo", "Com"];
    const hasKozocom = extractedWords.includes("Kozocom");
    const hasAllParts = winningWords.every((word) =>
      extractedWords.includes(word),
    );

    if (hasKozocom || hasAllParts) {
      if (!hasWonRef.current) {
        if (hasKozocom) {
          const kt = collectedTiles.find(
            (t) => t.content === "Kozocom" && !t.isDisabled,
          );
          if (kt) setWinningTiles([kt]);
        } else {
          const parts = winningWords
            .map((word) =>
              collectedTiles.find((t) => t.content === word && !t.isDisabled),
            )
            .filter(Boolean) as TileData[];
          setWinningTiles(parts);
        }
        setWinType("word");
        if (hasKozocom) {
          setGameStatus("won");
          sessionGamesPlayed = 10;
          audio.playWin();
        } else {
          setIsMerging(true);
        }
        hasWonRef.current = true;
      }
    }
  }, [collectedTiles, gameStatus]);

  const handleCellClick = useCallback(
    (cell: CellData) => {
      if (
        gameStatus !== "playing" ||
        actualTurnsLeft <= 0 ||
        flippingCellId ||
        isBusy ||
        showRules ||
        isMerging ||
        !!activeGiftTile
      )
        return;

      audio.playBgMusic();
      audio.playClick();
      setIsBusy(true);

      // Mark as revealed in grid
      setCells((prev) =>
        prev.map((c) => (c.id === cell.id ? { ...c, isRevealed: true } : c)),
      );
      setFlippingCellId(cell.id);

      // Wait for flip animation
      setTimeout(() => {
        setFlippingCellId(null);

        const newTile: TileData = {
          ...cell,
          isDisabled: false,
        };

        setCollectedTiles((prev) => {
          const newTiles = [...prev, newTile];
          const isLastTurn = MAX_TURNS - newTiles.length <= 0;

          if (cell.type === "boom") {
            setTimeout(() => setShake(true), 100);
            setTimeout(() => {
              setLoseType("boom");
              setGameStatus((status) =>
                status === "playing" ? "lost" : status,
              );
              audio.playBoom();
            }, 500);
          } else if (cell.type === "gift") {
            setTimeout(() => {
              if (isLastTurn) {
                setWinType("gift");
                setGameStatus("won");
                audio.playClaimGift();
              } else {
                setActiveGiftTile(newTile);
                audio.playGift();
              }
            }, 400);
          } else {
            if (isLastTurn) {
              const prevExtracted = prev
                .filter((t) => !t.isDisabled)
                .map((t) => t.content);
              const extractedWords = [...prevExtracted, newTile.content];
              const isKozocomWin = newTile.content === "Kozocom";
              const isWordWin =
                extractedWords.includes("Ko") &&
                extractedWords.includes("Zo") &&
                extractedWords.includes("Com");
              const isWin = isKozocomWin || isWordWin;

              if (isWin) {
                if (isKozocomWin) {
                  setWinningTiles([newTile]);
                  setWinType("word");
                }
              } else {
                setTimeout(() => {
                  setLoseType("outOfTurns");
                  setGameStatus((status) =>
                    status === "playing" ? "lost" : status,
                  );
                  audio.playGameOver();
                }, 400);
              }
            } else if (cell.content === "Kozocom") {
              setWinningTiles([newTile]);
              setWinType("word");
            } else {
              setIsBusy(false);
            }
          }
          return newTiles;
        });
      }, 400);
    },
    [
      gameStatus,
      actualTurnsLeft,
      flippingCellId,
      isBusy,
      showRules,
      isMerging,
      activeGiftTile,
      setCells,
      setFlippingCellId,
      setCollectedTiles,
      setIsBusy,
    ],
  );

  const handleClaimGift = () => {
    setWinType("gift");
    setGameStatus("won");
    audio.playClaimGift();
    setActiveGiftTile(null);
  };

  const handleContinue = () => {
    setActiveGiftTile(null);
    setIsBusy(false);
    if (activeGiftTile) {
      setCollectedTiles((prev) => {
        const newTiles = prev.map((t) =>
          t.id === activeGiftTile.id ? { ...t, isDisabled: true } : t,
        );
        const isLastTurn = MAX_TURNS - newTiles.length <= 0;
        if (isLastTurn) {
          setTimeout(() => {
            setLoseType("outOfTurns");
            setGameStatus((prevStatus) =>
              prevStatus === "playing" ? "lost" : prevStatus,
            );
            audio.playGameOver();
          }, 300);
        }
        return newTiles;
      });
    }
  };

  return (
    <Layout shake={shake}>
      <Header />

      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-20 -translate-y-[68px]">
        <HexagonGrid
          cells={cells}
          collectedTiles={collectedTiles}
          onCellClick={handleCellClick}
          flippingCellId={flippingCellId}
        />
        <CollectionTray
          tiles={collectedTiles}
          maxSlots={MAX_TURNS}
          isGameOver={gameStatus === "lost"}
        />
      </div>

      {/* Bottom Corner Buttons */}
      <div className="fixed bottom-19 left-21 z-50">
        <button
          onClick={() => {
            audio.playClick();
            setShowRules(true);
          }}
          className="transition-transform active:scale-90 hover:brightness-110"
        >
          <img
            src={buttonHelp}
            alt="Help"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </button>
      </div>

      <div className="fixed bottom-19 right-21 z-50">
        <button
          onClick={() => {
            audio.playClick();
            toggleMute();
          }}
          className="transition-transform active:scale-90 hover:brightness-110"
        >
          <img
            src={isMuted ? buttonSoundOff : buttonSoundOn}
            alt="Sound"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </button>
      </div>

      <GiftModal
        isOpen={!!activeGiftTile && gameStatus === "playing"}
        onClaim={handleClaimGift}
        onContinue={handleContinue}
      />

      <LoseModal
        isOpen={gameStatus === "lost"}
        type={loseType}
        onRestart={initGame}
      />

      <WinModal
        isOpen={gameStatus === "won" && winType === "word"}
        onRestart={initGame}
        winningTiles={winningTiles}
      />

      <GiftWinModal
        isOpen={gameStatus === "won" && winType === "gift"}
        onRestart={initGame}
        giftContent={
          collectedTiles.find((t) => t.type === "gift" && !t.isDisabled)
            ?.content
        }
        isLastTurn={collectedTiles.length === MAX_TURNS}
      />

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {isMerging && (
        <MergeAnimation
          onComplete={() => {
            setIsMerging(false);
            setGameStatus("won");
            sessionGamesPlayed = 10;
            audio.playWin();
          }}
        />
      )}
    </Layout>
  );
}
