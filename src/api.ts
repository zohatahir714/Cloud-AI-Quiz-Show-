import type { Difficulty, Question } from "./types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
  return data as T;
}

export const fetchQuestion = (p: { topic: string; difficulty: Difficulty; previous: string[] }) =>
  post<Question>("/api/question", p);

export const fetchHint = (q: Question) =>
  post<{ hint: string }>("/api/hint", {
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  });