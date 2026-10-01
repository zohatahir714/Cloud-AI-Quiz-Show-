import { useEffect, useRef } from "react";
import type { Difficulty, Lifelines, Question } from "../types";

const LETTERS = ["A", "B", "C", "D"];

interface Props {
  question: Question;
  topic: string;
  difficulty: Difficulty;
  phase: "playing" | "locked" | "reveal";
  selected: number | null;
  eliminated: number[];
  hint: string | null;
  hintState: "idle" | "loading" | "error";
  used: Lifelines;
  isLast: boolean;
  onAnswer: (i: number) => void;
  onFifty: () => void;
  onSkip: () => void;
  onHint: () => void;
  onNext: () => void;
}

function Lifeline(props: { label: string; used: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.used || props.disabled}
      className={`min-h-[56px] rounded-xl border font-mono text-sm uppercase tracking-wider transition ${
        props.used
          ? "border-navy-700 text-ink/30 line-through"
          : "border-lav/60 text-lav hover:bg-lav/10 disabled:opacity-50"
      }`}
    >
      {props.label}
    </button>
  );
}

export default function Game(p: Props) {
  const q = p.question;
  const isCorrect = p.selected === q.correctIndex;
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (p.phase === "reveal") revealRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [p.phase]);

  const optionStyle = (i: number) => {
    if (p.phase === "reveal") {
      if (i === q.correctIndex) return "border-cy bg-cy/15 shadow-[0_0_28px_-4px_rgba(34,228,255,.55)]";
      if (i === p.selected) return "border-hot bg-hot/15 animate-shake shadow-[0_0_28px_-4px_rgba(255,45,120,.55)]";
      return "border-navy-700 bg-navy-800 opacity-40";
    }
    if (p.eliminated.includes(i)) return "border-navy-700 bg-navy-800 opacity-25";
    if (p.phase === "locked")
      return i === p.selected ? "border-lav bg-lav/20 animate-glow" : "border-navy-700 bg-navy-800 opacity-60";
    return "border-navy-700 bg-navy-800 hover:border-cy hover:bg-navy-700 active:scale-[0.99]";
  };

  const badgeStyle = (i: number) =>
    p.phase === "reveal" && i === q.correctIndex ? "text-cy"
    : p.phase === "reveal" && i === p.selected ? "text-hot"
    : "text-lav";

  return (
    <section className="animate-fadeUp space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip text-lav">{p.topic}</span>
        <span className="chip text-cy">{p.difficulty}</span>
      </div>

      <h1 className="panel px-4 py-5 text-[17px] font-semibold leading-snug sm:px-8 sm:py-8 sm:text-2xl lg:text-[28px]">
        {q.question}
      </h1>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2" role="group" aria-label="Answer options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={p.phase !== "playing" || p.eliminated.includes(i)}
            onClick={() => p.onAnswer(i)}
            className={`flex min-h-[56px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-snug transition disabled:cursor-default sm:min-h-[72px] sm:text-base ${optionStyle(i)}`}
          >
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border border-current font-mono text-sm ${badgeStyle(i)}`}>
              {LETTERS[i]}
            </span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Lifeline label="50:50" used={p.used.fifty} disabled={p.phase !== "playing"} onClick={p.onFifty} />
        <Lifeline label="Skip" used={p.used.skip} disabled={p.phase !== "playing"} onClick={p.onSkip} />
        <Lifeline
          label={p.hintState === "loading" ? "Thinking" : "Hint"}
          used={p.used.hint}
          disabled={p.phase !== "playing" || p.hintState === "loading"}
          onClick={p.onHint}
        />
      </div>

      {p.hint && (
        <div className="panel animate-fadeUp border-lav/40 p-4">
          <p className="label">Hint</p>
          <p className="mt-1 text-sm sm:text-base">{p.hint}</p>
        </div>
      )}
      {p.hintState === "error" && (
        <p className="font-mono text-xs text-hot">Hint unavailable. The lifeline was not used; try again.</p>
      )}

      {p.phase === "reveal" && (
        <div ref={revealRef} className={`panel animate-fadeUp border-l-4 p-4 sm:p-6 ${isCorrect ? "border-l-cy" : "border-l-hot"}`}>
          <p className={`font-mono text-xs uppercase tracking-[0.2em] ${isCorrect ? "text-cy" : "text-hot"}`}>
            {isCorrect ? "Correct" : "Incorrect"}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed sm:text-base">{q.explanation}</p>
          <p className="mt-3 font-mono text-xs text-lav/80">
            Source:{" "}
            <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-4 hover:text-cy">
              {q.sourceTitle}
            </a>
          </p>
          <button className="btn btn-primary mt-4 w-full sm:w-auto" onClick={p.onNext} autoFocus>
            {p.isLast ? "See final score" : "Next question"}
          </button>
        </div>
      )}
    </section>
  );
}