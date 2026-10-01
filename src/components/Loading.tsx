import { useEffect, useState } from "react";
import type { Difficulty } from "../types";

const STAGES = ["Selecting principle", "Drafting scenario", "Writing distractors", "Validating against rules"];

export default function Loading({ topic, difficulty }: { topic: string; difficulty: Difficulty }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="panel animate-fadeUp space-y-6 p-6 text-center sm:p-12" role="status" aria-live="polite">
      <p className="font-mono text-sm uppercase tracking-[0.25em] text-cy">
        Generating Scenario<span className="animate-blink">_</span>
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="chip text-lav">{topic}</span>
        <span className="chip text-cy">{difficulty}</span>
      </div>
      <div className="relative mx-auto h-1 w-full max-w-md overflow-hidden rounded bg-navy-700">
        <div className="absolute inset-y-0 w-1/3 animate-scan bg-gradient-to-r from-transparent via-cy to-transparent" />
      </div>
      <div className="mx-auto max-w-md space-y-2" aria-hidden>
        <div className="h-4 animate-pulse rounded bg-navy-700" />
        <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-navy-700" />
      </div>
      <p className="font-mono text-xs text-lav/80">{STAGES[stage]}</p>
    </section>
  );
}