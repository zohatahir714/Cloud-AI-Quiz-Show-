import type { Result } from "../types";

function rank(score: number) {
  if (score >= 9) return "Principal Architect";
  if (score >= 7) return "Staff Engineer";
  if (score >= 5) return "Senior Engineer";
  if (score >= 3) return "Engineer";
  return "Apprentice";
}

export default function Score({ results, onRestart }: { results: Result[]; onRestart: () => void }) {
  const score = results.filter((r) => r.isCorrect).length;
  return (
    <section className="animate-fadeUp space-y-6 py-6 sm:py-10">
      <div className="panel space-y-2 p-6 text-center sm:p-10">
        <p className="label">Final score</p>
        <p className="text-6xl font-extrabold text-cy sm:text-8xl">
          {score}<span className="text-ink/30">/{results.length}</span>
        </p>
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-lav">{rank(score)}</p>
      </div>

      <ol className="space-y-2">
        {results.map((r, i) => (
          <li key={i} className={`panel border-l-4 p-4 ${r.isCorrect ? "border-l-cy" : "border-l-hot"}`}>
            <div className="mb-1 flex flex-wrap items-center gap-x-3 font-mono text-[11px] uppercase tracking-wider">
              <span className="text-lav">Q{String(i + 1).padStart(2, "0")}</span>
              <span className="text-ink/50">{r.topic}</span>
              <span className={r.isCorrect ? "text-cy" : "text-hot"}>{r.isCorrect ? "Correct" : "Missed"}</span>
            </div>
            <p className="text-[15px] leading-snug">{r.question}</p>
            {!r.isCorrect && (
              <p className="mt-2 text-sm text-ink/70">
                <span className="text-hot">You: {r.picked}</span>
                <br />
                <span className="text-cy">Answer: {r.correct}</span>
              </p>
            )}
          </li>
        ))}
      </ol>

      <button className="btn btn-primary w-full sm:mx-auto sm:flex sm:w-72" onClick={onRestart}>Play again</button>
    </section>
  );
}