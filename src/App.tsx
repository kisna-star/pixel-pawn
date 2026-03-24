import { useState, useEffect } from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import ChessBoard from '@/components/chess/ChessBoard';
import MoveHistory from '@/components/chess/MoveHistory';
import CapturedPieces from '@/components/chess/CapturedPieces';
import PromotionDialog from '@/components/chess/PromotionDialog';
import GameControls from '@/components/chess/GameControls';
import ChessTimer from '@/components/chess/ChessTimer';
import { Crown, X, Sun, Moon, ArrowLeft, Play, Swords, Bot } from 'lucide-react';
import { GameMode, AIDifficulty, BoardTheme, BOARD_THEMES, TimeControl } from '@/lib/chess/types';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const TIME_PRESETS: { label: string; value: TimeControl | null }[] = [
  { label: 'No Timer', value: null },
  { label: '3+2 Blitz', value: { initial: 180, increment: 2 } },
  { label: '5+0 Blitz', value: { initial: 300, increment: 0 } },
  { label: '10+0 Rapid', value: { initial: 600, increment: 0 } },
  { label: '15+10 Rapid', value: { initial: 900, increment: 10 } },
];

type Page = 'start' | 'play';

const App = () => {
  const [page, setPage] = useState<Page>('start');
  const [dark, setDark] = useState(() => localStorage.getItem('chess-theme') === 'dark');

  // Start page settings
  const [mode, setMode] = useState<GameMode>(() => {
    try { return JSON.parse(localStorage.getItem('chess-settings') || '{}').mode || 'local'; } catch { return 'local'; }
  });
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(() => {
    try { return JSON.parse(localStorage.getItem('chess-settings') || '{}').aiDifficulty || 2; } catch { return 2; }
  });
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => {
    try { return JSON.parse(localStorage.getItem('chess-settings') || '{}').boardTheme || 'gray'; } catch { return 'gray'; }
  });
  const [timeControl, setTimeControl] = useState<TimeControl | null>(() => {
    try { return JSON.parse(localStorage.getItem('chess-settings') || '{}').timeControl || null; } catch { return null; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('chess-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const saveAndPlay = () => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem('chess-settings') || '{}'); } catch { return {}; } })();
    localStorage.setItem('chess-settings', JSON.stringify({ ...existing, mode, aiDifficulty, boardTheme, timeControl }));
    setPage('play');
  };

  if (page === 'play') {
    return (
      <>
        <Toaster />
        <Sonner />
        <GamePage dark={dark} setDark={setDark} onBack={() => setPage('start')} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-border bg-card transition-colors duration-300">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Crown size={22} className="text-primary" />
              <h1 className="text-lg font-bold tracking-tight">Chess</h1>
            </div>
            <button onClick={() => setDark(d => !d)} className="chess-btn p-2" aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md flex flex-col gap-6">
            {/* Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
                <Crown size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Ready to Play?</h2>
              <p className="text-sm text-muted-foreground">Configure your game and jump in.</p>
            </div>

            {/* Settings Card */}
            <div className="rounded-xl bg-card border border-border p-5 flex flex-col gap-5 transition-colors duration-300">
              {/* Game Mode */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Game Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'local' as GameMode, label: 'Local 2P', icon: Swords },
                    { value: 'ai' as GameMode, label: 'vs AI', icon: Bot },
                  ]).map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setMode(value)}
                      className={`chess-btn flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        mode === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'
                      }`}>
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Difficulty */}
              {mode === 'ai' && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 1 as AIDifficulty, label: 'Easy' },
                      { value: 2 as AIDifficulty, label: 'Medium' },
                      { value: 3 as AIDifficulty, label: 'Hard' },
                    ]).map(({ value, label }) => (
                      <button key={value} onClick={() => setAiDifficulty(value)}
                        className={`chess-btn py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          aiDifficulty === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Control */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Control</label>
                <select
                  value={timeControl ? `${timeControl.initial}-${timeControl.increment}` : 'none'}
                  onChange={e => {
                    const preset = TIME_PRESETS.find(p =>
                      p.value ? `${p.value.initial}-${p.value.increment}` === e.target.value : e.target.value === 'none'
                    );
                    setTimeControl(preset?.value || null);
                  }}
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                  aria-label="Time control"
                >
                  {TIME_PRESETS.map(p => (
                    <option key={p.label} value={p.value ? `${p.value.initial}-${p.value.increment}` : 'none'}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Board Theme */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Board Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['gray', 'wood', 'green', 'blue'] as BoardTheme[]).map(t => {
                    const colors = BOARD_THEMES[t];
                    return (
                      <button key={t} onClick={() => setBoardTheme(t)}
                        className={`rounded-lg p-2 border-2 transition-all active:scale-[0.96] ${
                          boardTheme === t ? 'border-primary shadow-sm' : 'border-transparent hover:border-border'
                        }`}
                        aria-label={`${t} theme`}>
                        <div className="flex rounded overflow-hidden h-8">
                          <div className="flex-1" style={{ backgroundColor: colors.light }} />
                          <div className="flex-1" style={{ backgroundColor: colors.dark }} />
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-1 block capitalize font-medium">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Dark Mode</span>
                <button onClick={() => setDark(d => !d)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-border'}`}
                  aria-label="Toggle dark mode">
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${
                    dark ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Play Button */}
            <button onClick={saveAndPlay}
              className="chess-primary-btn w-full rounded-xl bg-primary text-primary-foreground py-4 text-base font-bold
                hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200">
              <Play size={20} fill="currentColor" />
              Play Chess
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

function GamePage({ dark, setDark, onBack }: { dark: boolean; setDark: (fn: (d: boolean) => boolean) => void; onBack: () => void }) {
  const game = useChessGame();
  const [showTip, setShowTip] = useState(() => !localStorage.getItem('chess-onboarded'));

  useEffect(() => {
    if (!showTip) localStorage.setItem('chess-onboarded', '1');
  }, [showTip]);

  const topColor = game.settings.boardFlipped ? 'white' : 'black';
  const bottomColor = game.settings.boardFlipped ? 'black' : 'white';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border bg-card transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className="chess-btn p-2" aria-label="Back to start">
              <ArrowLeft size={16} />
            </button>
            <Crown size={22} className="text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Chess</h1>
          </div>
          <div className="flex items-center gap-3">
            {game.aiThinking && (
              <span className="text-xs text-muted-foreground animate-pulse">AI thinking…</span>
            )}
            <button onClick={() => setDark(d => !d)} className="chess-btn p-2" aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
          <div className="flex flex-col items-center gap-1.5 relative">
            {showTip && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-40
                bg-foreground text-background text-xs rounded-lg px-4 py-2.5 shadow-lg max-w-[260px]
                animate-in fade-in slide-in-from-bottom-2">
                <button onClick={() => setShowTip(false)} className="absolute top-1 right-1 p-0.5 rounded hover:bg-background/20">
                  <X size={12} />
                </button>
                <p>Click a piece to see its moves, then click a highlighted square to move.</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-foreground" />
              </div>
            )}

            <div className="w-full max-w-[min(90vw,560px)] flex items-center justify-between px-1">
              <CapturedPieces moves={game.gameState.moveHistory} color={topColor} />
              {game.settings.timeControl && (
                <ChessTimer time={topColor === 'white' ? game.whiteTime : game.blackTime}
                  isActive={game.gameState.currentPlayer === topColor && game.timerStarted} color={topColor} />
              )}
            </div>

            <ChessBoard board={game.gameState.board} flipped={game.settings.boardFlipped}
              selectedSquare={game.selectedSquare} legalMoves={game.legalMoves}
              moveHistory={game.gameState.moveHistory} currentPlayer={game.gameState.currentPlayer}
              boardTheme={game.settings.boardTheme} onSquareClick={game.handleSquareClick} />

            <div className="w-full max-w-[min(90vw,560px)] flex items-center justify-between px-1">
              <CapturedPieces moves={game.gameState.moveHistory} color={bottomColor} />
              {game.settings.timeControl && (
                <ChessTimer time={bottomColor === 'white' ? game.whiteTime : game.blackTime}
                  isActive={game.gameState.currentPlayer === bottomColor && game.timerStarted} color={bottomColor} />
              )}
            </div>
          </div>

          <div className="w-full lg:w-72 flex flex-col gap-4">
            <GameControls soundEnabled={game.settings.soundEnabled} status={game.gameState.status}
              winner={game.gameState.winner} currentPlayer={game.gameState.currentPlayer}
              canUndo={game.canUndo} canRedo={game.canRedo}
              onSoundToggle={() => game.updateSettings({ soundEnabled: !game.settings.soundEnabled })}
              onUndo={game.undo} onRedo={game.redo} onNewGame={game.newGame} onFlip={game.flipBoard} />
            <MoveHistory moves={game.gameState.moveHistory} />
          </div>
        </div>
      </main>

      {game.promotionPending && (
        <PromotionDialog color={game.promotionPending.piece.color}
          onSelect={game.handlePromotion} onCancel={game.cancelPromotion} />
      )}
    </div>
  );
}

export default App;
