import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Landing from "./components/Landing";
import PracticeGarden from "./components/PracticeGarden";
import Setup from "./components/Setup";
import Hud from "./components/Hud";
import Loading from "./components/Loading";
import ErrorScreen from "./components/ErrorScreen";
import Game from "./components/Game";
import Score from "./components/Score";
import { fetchHint, fetchQuestion } from "./api";
import { TOTAL_QUESTIONS, difficultyFor, shuffle } from "./game";
import type { Difficulty, Lifelines, Question, Result } from "./types";

type Phase = "home" | "practice" | "setup" | "loading" | "error" | "playing" | "locked" | "reveal" | "score";
type HintState = "idle" | "loading" | "error";
const NO_LIFELINES: Lifelines = { fifty: false, skip: false, hint: false };

export default function App() {
  const [phase, setPhase] = useState<Phase>("home");
  const [index, setIndex] = useState(0);
  const [techTarget, setTechTarget] = useState<string>("");
  const [difficultyTarget, setDifficultyTarget] = useState<string>("Adaptive (Ramp Up)");
  const [meta, setMeta] = useState<{ topic: string; difficulty: Difficulty } | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [hintState, setHintState] = useState<HintState>("idle");
  const [used, setUsed] = useState<Lifelines>(NO_LIFELINES);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");

  const plan = useRef<string[]>([]);      // topic per question slot
  const history = useRef<string[]>([]);   // every question shown (anti-repeat)
  const reqId = useRef(0);                // ignore stale responses

  const loadQuestion = useCallback(async (i: number, tech: string, targetDiff: string) => {
    const id = ++reqId.current;
    const m = { topic: plan.current[i], difficulty: difficultyFor(i, targetDiff as any) };
    setIndex(i);
    setMeta(m);
    setError("");
    setPhase("loading");
    try {
      const q = await fetchQuestion({ techTarget: tech, topic: m.topic, difficulty: m.difficulty, previous: history.current });
      if (id !== reqId.current) return;
      history.current.push(q.question);
      setQuestion(q);
      setSelected(null);
      setEliminated([]);
      setHint(null);
      setHintState("idle");
      setPhase("playing");
    } catch (e) {
      if (id !== reqId.current) return;
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("error");
    }
  }, []);

  const start = (selectedTech: string, selectedDifficulty: string, topics: string[]) => {
    setTechTarget(selectedTech);
    setDifficultyTarget(selectedDifficulty);
    let order: string[] = [];
    while (order.length < TOTAL_QUESTIONS) order = order.concat(shuffle(topics));
    plan.current = order.slice(0, TOTAL_QUESTIONS);
    history.current = [];
    setResults([]);
    setUsed(NO_LIFELINES);
    void loadQuestion(0, selectedTech, selectedDifficulty);
  };

  const quit = () => {
    reqId.current++;
    setPhase("home");
  };

  // Lock-in suspense, then reveal.
  useEffect(() => {
    if (phase !== "locked" || selected === null || !question || !meta) return;
    const t = setTimeout(() => {
      setResults((r) => [
        ...r,
        {
          question: question.question,
          picked: question.options[selected],
          correct: question.options[question.correctIndex],
          isCorrect: selected === question.correctIndex,
          topic: meta.topic,
          difficulty: meta.difficulty,
        },
      ]);
      setPhase("reveal");
    }, 1100);
    return () => clearTimeout(t);
  }, [phase, selected, question, meta]);

  const answer = (i: number) => {
    if (phase !== "playing") return;
    setSelected(i);
    setPhase("locked");
  };

  const fifty = () => {
    if (!question || used.fifty || phase !== "playing") return;
    const wrong = shuffle([0, 1, 2, 3].filter((i) => i !== question.correctIndex)).slice(0, 2);
    setEliminated(wrong);
    setUsed((u) => ({ ...u, fifty: true }));
  };

  const skip = () => {
    if (used.skip || phase !== "playing") return;
    setUsed((u) => ({ ...u, skip: true }));
    void loadQuestion(index, techTarget, difficultyTarget);
  };

  const requestHint = async () => {
    if (!question || used.hint || hintState === "loading" || phase !== "playing") return;
    setHintState("loading");
    try {
      const { hint: h } = await fetchHint(question);
      setHint(h);
      setHintState("idle");
      setUsed((u) => ({ ...u, hint: true }));
    } catch {
      setHintState("error");
    }
  };

  const next = () => {
    if (index + 1 >= TOTAL_QUESTIONS) setPhase("score");
    else void loadQuestion(index + 1, techTarget, difficultyTarget);
  };

  const score = results.filter((r) => r.isCorrect).length;
  const inRound = phase !== "home" && phase !== "practice" && phase !== "setup" && phase !== "score";

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 pb-8 sm:px-6">
      {/* Top Header Navigation */}
      <Header onGoHome={() => setPhase("home")} />

      {inRound && <Hud index={index} total={TOTAL_QUESTIONS} score={score} results={results} onQuit={quit} />}

      <main className="flex flex-1 flex-col justify-start gap-4 pt-3 sm:justify-center">
        {phase === "home" && (
          <Landing
            onSelectQuiz={() => setPhase("setup")}
            onSelectPractice={() => setPhase("practice")}
          />
        )}
        {phase === "practice" && <PracticeGarden onBack={() => setPhase("home")} />}
        {phase === "setup" && <Setup onStart={start} />}
        {phase === "loading" && meta && <Loading topic={`${techTarget} • ${meta.topic}`} difficulty={meta.difficulty} />}
        {phase === "error" && (
          <ErrorScreen message={error} onRetry={() => void loadQuestion(index, techTarget, difficultyTarget)} onQuit={quit} />
        )}
        {(phase === "playing" || phase === "locked" || phase === "reveal") && question && meta && (
          <Game
            question={question}
            techTarget={techTarget}
            domainTopic={meta.topic}
            difficulty={meta.difficulty}
            phase={phase}
            selected={selected}
            eliminated={eliminated}
            hint={hint}
            hintState={hintState}
            used={used}
            isLast={index + 1 >= TOTAL_QUESTIONS}
            onAnswer={answer}
            onFifty={fifty}
            onSkip={skip}
            onHint={() => void requestHint()}
            onNext={next}
          />
        )}
        {phase === "score" && <Score results={results} onRestart={() => setPhase("setup")} />}
      </main>
    </div>
  );
}