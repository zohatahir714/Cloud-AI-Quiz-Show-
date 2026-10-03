import type { Difficulty } from "./types";

export const TOTAL_QUESTIONS = 10;

export interface Topic { id: string; label: string; tag: string }

export const TOPICS: Topic[] = [
  { id: "reliability", label: "Reliability & Failure Design", tag: "RELIABILITY" },
  { id: "scaling", label: "Scalability & Load Handling", tag: "SCALING" },
  { id: "cost", label: "Cost Control & FinOps", tag: "COST" },
  { id: "security", label: "Security & Identity", tag: "SECURITY" },
  { id: "data", label: "Data & Storage Trade-offs", tag: "DATA" },
  { id: "network", label: "Networking & Latency", tag: "NETWORK" },
  { id: "observability", label: "Observability & SRE", tag: "OBSERVABILITY" },
  { id: "delivery", label: "CI/CD & Containers", tag: "DELIVERY" },
  { id: "llmapps", label: "LLM Application Design", tag: "LLM-APPS" },
  { id: "rag", label: "RAG & Retrieval Design", tag: "RAG" },
  { id: "agents", label: "Agents & Tool Use", tag: "AGENTS" },
  { id: "evals", label: "LLM Evaluation & Safety", tag: "EVALS" },
];

export const TECH_STACKS = [
  "General Cloud & AI",
  "AWS Architecture",
  "Microsoft Azure",
  "Google Cloud (GCP)",
  "DevOps & Kubernetes",
  "LLM & Agentic AI",
] as const;

export type TechStack = typeof TECH_STACKS[number];

export const DIFFICULTY_LEVELS = [
  "Adaptive (Ramp Up)",
  "Practitioner",
  "Professional",
  "Expert",
] as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export function difficultyFor(
  index: number,
  chosenDifficulty: DifficultyLevel = "Adaptive (Ramp Up)"
): Difficulty {
  if (chosenDifficulty === "Practitioner") return "Easy";
  if (chosenDifficulty === "Professional") return "Medium";
  if (chosenDifficulty === "Expert") return "Expert";

  // Adaptive Mode: Ramps up across 10 questions
  return index < 3 ? "Easy" : index < 6 ? "Medium" : index < 8 ? "Hard" : "Expert";
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}