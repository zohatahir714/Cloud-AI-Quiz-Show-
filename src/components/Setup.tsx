import { useState } from "react";
import { TOPICS, TOTAL_QUESTIONS } from "../game";

export default function Setup({ onStart }: { onStart: (topics: string[]) => void }) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(TOPICS.map((t) => t.label)));

  const toggle = (label: string) =>
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(label)) n.delete(label);
      else n.add(label);
      return n;
    });

  return (
    <section className="animate-fadeUp space-y-6 py-6 sm:py-10">
      <div className="space-y-3 text-center">
        <p className="label">Practical engineering quiz</p>
        <h1 className="text-4xl font-extrabold leading-none tracking-tight sm:text-6xl">
          Cloud <span className="text-lav">&amp;</span> AI
          <br />
          <span className="text-cy">Quiz Show</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm text-ink/70 sm:text-base">
          {TOTAL_QUESTIONS} scenario questions that climb from Easy to Expert. Three lifelines: 50:50, Skip, Hint.
        </p>
      </div>

      <div className="panel p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="label">Select topics ({sel.size}/{TOPICS.length})</p>
          <div className="flex gap-2 font-mono text-xs">
            <button className="min-h-[44px] px-2 text-lav hover:text-cy" onClick={() => setSel(new Set(TOPICS.map((t) => t.label)))}>ALL</button>
            <button className="min-h-[44px] px-2 text-lav hover:text-cy" onClick={() => setSel(new Set())}>NONE</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3" role="group" aria-label="Topics">
          {TOPICS.map((t) => {
            const on = sel.has(t.label);
            return (
              <button
                key={t.id}
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(t.label)}
                className={`flex min-h-[64px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  on ? "border-cy bg-cy/10" : "border-navy-700 bg-navy-800 hover:border-lav"
                }`}
              >
                <span>
                  <span className={`block font-mono text-[10px] tracking-[0.18em] ${on ? "text-cy" : "text-lav/70"}`}>{t.tag}</span>
                  <span className="block text-[15px] font-semibold leading-snug">{t.label}</span>
                </span>
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${on ? "border-cy" : "border-navy-600"}`}>
                  {on && <span className="h-2.5 w-2.5 rounded-sm bg-cy" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button className="btn btn-primary w-full sm:mx-auto sm:flex sm:w-72" disabled={sel.size === 0} onClick={() => onStart([...sel])}>
        Start game
      </button>
    </section>
  );
}