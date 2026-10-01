import type { Result } from "../types";

interface Props { index: number; total: number; score: number; results: Result[]; onQuit: () => void }

export default function Hud({ index, total, score, results, onQuit }: Props) {
  return (
    <header className="sticky top-0 z-10 -mx-4 bg-navy-950/90 px-4 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex h-14 items-center justify-between">
        <span className="font-mono text-xs tracking-widest text-lav">CLOUD / AI QUIZ SHOW</span>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span>Q {String(index + 1).padStart(2, "0")}/{total}</span>
          <span className="text-cy">SCORE {score}</span>
          <button
            className="min-h-[56px] px-2 text-hot/90 hover:text-hot"
            onClick={() => { if (window.confirm("Quit this game?")) onQuit(); }}
          >
            QUIT
          </button>
        </div>
      </div>
      <div className="flex gap-1 pb-2" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              results[i] ? (results[i].isCorrect ? "bg-cy" : "bg-hot") : i === index ? "animate-pulse bg-lav" : "bg-navy-700"
            }`}
          />
        ))}
      </div>
    </header>
  );
}