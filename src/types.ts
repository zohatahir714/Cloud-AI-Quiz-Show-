export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceTitle: string;
  sourceUrl: string;
}

export interface Lifelines { fifty: boolean; skip: boolean; hint: boolean } // true = used

export interface Result {
  question: string;
  picked: string;
  correct: string;
  isCorrect: boolean;
  topic: string;
  difficulty: Difficulty;
}