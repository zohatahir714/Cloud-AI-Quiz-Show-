import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 5000;
// Change via the GEMINI_MODEL secret if this name is retired or not on your key.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const MAX_ATTEMPTS = 3;
const MAX_OPTION_CHARS = 70;

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/* ---------- Approved source registry ---------- */
const SOURCES = [
  { title: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" },
  { title: "Azure Well-Architected Framework", url: "https://learn.microsoft.com/en-us/azure/well-architected/" },
  { title: "Google Cloud Architecture Framework", url: "https://cloud.google.com/architecture/framework" },
  { title: "The Twelve-Factor App", url: "https://12factor.net/" },
  { title: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/" },
  { title: "Kubernetes Concepts", url: "https://kubernetes.io/docs/concepts/" },
  { title: "Anthropic: Building Effective Agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
  { title: "Anthropic: Tool Use Overview", url: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview" },
  { title: "Anthropic: Prompt Engineering Overview", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" },
  { title: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/" },
  { title: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
  { title: "Google Rules of Machine Learning", url: "https://developers.google.com/machine-learning/guides/rules-of-ml" },
];
const SOURCE_BY_URL = new Map(SOURCES.map((s) => [s.url, s]));

const DIFFICULTY_GUIDE = {
  Easy: "One core principle, one clear failure mode. Wrong options are tempting but clearly weaker on reflection.",
  Medium: "Two competing concerns (e.g. cost vs reliability). Wrong options are reasonable in other contexts.",
  Hard: "A trade-off under constraints. Two options look defensible; only one fits the stated constraint.",
  Expert: "A subtle system-level interaction (failure cascades, consistency, feedback loops). All options sound senior-level.",
};

/* ---------- Prompts ---------- */
const QUESTION_SYSTEM = `You write questions for "Cloud & AI Quiz Show", a Millionaire-style quiz for working engineers.
Return ONE JSON object and nothing else (no markdown fences, no commentary) with exactly these keys:
{"question": string, "options": [string, string, string, string], "correctIndex": 0|1|2|3, "explanation": string, "sourceTitle": string, "sourceUrl": string}

Rules:
- Scenario-based: describe a concrete engineering situation, then ask what to do or what will happen. No trivia, no service limits, no pricing, no version numbers, no "which service does X".
- Test durable architecture principles that will still be true in five years.
- "question": at most 18 words AND at most 105 characters.
- Exactly 4 options, each at most ${MAX_OPTION_CHARS} characters, all plausible to a mid-level engineer, exactly one clearly best. No "all of the above". Keep option lengths similar so length does not give away the answer.
- "explanation": 2 to 3 sentences, at most 60 words. Name the principle, why the correct option follows from it, and why the most tempting wrong option fails.
- Source: pick the single best-fitting entry from APPROVED SOURCES. Copy sourceTitle and sourceUrl exactly. Never invent URLs.

APPROVED SOURCES:
${SOURCES.map((s) => `- ${s.title} | ${s.url}`).join("\n")}`;

const HINT_SYSTEM = `You give hints for a quiz question. Reply with ONE sentence, at most 25 words, that nudges the player toward the underlying principle.
Never state, quote, or paraphrase the correct option. Never mention option letters or numbers. Plain text only.`;

/* ---------- Helpers ---------- */
const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tokens = (s) =>
  new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3));

function similar(a, b) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return false;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / (A.size + B.size - shared) >= 0.5; // Jaccard
}

function extractJson(text) {
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s < 0 || e <= s) throw new Error("No JSON object in response");
  return JSON.parse(text.slice(s, e + 1));
}

function validate(q, previous) {
  if (!q || typeof q !== "object") return "Response was not a JSON object";
  const { question, options, correctIndex, explanation, sourceUrl } = q;
  if (typeof question !== "string" || !question.trim()) return "Missing question";
  if (!Array.isArray(options) || options.length !== 4 ||
      options.some((o) => typeof o !== "string" || !o.trim()))
    return "options must be exactly 4 non-empty strings";
  if (new Set(options.map((o) => o.trim().toLowerCase())).size !== 4) return "options must be distinct";
  if (options.some((o) => o.trim().length > MAX_OPTION_CHARS))
    return `each option must be at most ${MAX_OPTION_CHARS} characters`;
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3)
    return "correctIndex must be an integer 0-3";
  const text = question.trim();
  const words = text.split(/\s+/).length;
  if (words > 18) return `question has ${words} words (max 18)`;
  if (text.length > 105) return `question has ${text.length} characters (max 105)`;
  if (typeof explanation !== "string" || explanation.trim().length < 20)
    return "explanation missing or too short";
  if (!SOURCE_BY_URL.has(sourceUrl)) return "sourceUrl is not in the approved registry";
  if (previous.some((p) => similar(p, text))) return "question repeats or rephrases a previous question";
  return null;
}

function finalize(q) {
  const order = [0, 1, 2, 3];
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    question: q.question.trim(),
    options: order.map((i) => q.options[i].trim()),
    correctIndex: order.indexOf(q.correctIndex),
    explanation: q.explanation.trim(),
    sourceTitle: SOURCE_BY_URL.get(q.sourceUrl).title,
    sourceUrl: q.sourceUrl,
  };
}

// Maps provider errors to messages a player can act on.
function describeError(e) {
  const status = e?.status;
  const msg = String(e?.message || "");
  if (status === 429) return { rate: true, text: "The free Gemini quota is used up for now. Wait a minute and retry, or try again tomorrow." };
  if (status === 404) return { fatal: true, text: `Model "${MODEL}" was not found for this key. Set the GEMINI_MODEL secret to a model listed in AI Studio.` };
  if (status === 401 || status === 403 || /API key not valid|API_KEY_INVALID|permission/i.test(msg))
    return { fatal: true, text: "Gemini rejected the server API key." };
  return { text: msg || "unknown error" };
}

async function generateQuestion({ topic, difficulty, previous }) {
  let lastError = "";
  let sawRateLimit = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const prompt = [
      `Topic: ${topic}`,
      `Difficulty: ${difficulty}. ${DIFFICULTY_GUIDE[difficulty]}`,
      previous.length
        ? `Already asked (do NOT repeat or rephrase, even with a different technology):\n${previous.map((p) => `- ${p}`).join("\n")}`
        : "No previous questions.",
      lastError ? `Your previous attempt was rejected: ${lastError}. Fix this.` : "",
      "Return only the JSON object.",
    ].filter(Boolean).join("\n\n");

    try {
      const resp = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          systemInstruction: QUESTION_SYSTEM,
          temperature: 0.8,
          maxOutputTokens: 2048, // headroom in case the model spends tokens on thinking
          responseMimeType: "application/json",
        },
      });
      const parsed = extractJson(resp.text ?? "");
      const err = validate(parsed, previous);
      if (!err) return finalize(parsed);
      lastError = err;
    } catch (e) {
      const d = describeError(e);
      if (d.fatal) throw Object.assign(new Error(d.text), { fatal: true });
      lastError = d.text;
      if (d.rate) {
        sawRateLimit = true;
        if (attempt < MAX_ATTEMPTS) await sleep(4000 * attempt); // back off, do not burn quota
      }
    }
    console.warn(`[question] attempt ${attempt} failed: ${lastError}`);
  }
  throw new Error(sawRateLimit ? lastError : `Could not generate a valid question after ${MAX_ATTEMPTS} attempts.`);
}

/* ---------- App ---------- */
const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));

const hits = new Map();
function limiter(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 40)
    return res.status(429).json({ error: "rate_limited", message: "Too many requests. Wait a moment." });
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}
setInterval(() => hits.clear(), 10 * 60_000).unref();

app.get("/api/health", (_req, res) => res.json({ ok: true, model: MODEL, configured: !!ai }));

app.post("/api/question", limiter, async (req, res) => {
  if (!ai)
    return res.status(503).json({ error: "not_configured", message: "Server has no Gemini API key configured." });
  const topic = clean(req.body?.topic, 80);
  const difficulty = req.body?.difficulty;
  if (!topic || typeof difficulty !== "string" || !Object.hasOwn(DIFFICULTY_GUIDE, difficulty))
    return res.status(400).json({ error: "bad_request", message: "Invalid topic or difficulty." });
  const previous = (Array.isArray(req.body?.previous) ? req.body.previous : [])
    .slice(-40).map((p) => clean(p, 200)).filter(Boolean);
  try {
    res.json(await generateQuestion({ topic, difficulty, previous }));
  } catch (e) {
    console.error("[question] failed:", e.message);
    res.status(502).json({ error: "generation_failed", message: e.message });
  }
});

app.post("/api/hint", limiter, async (req, res) => {
  if (!ai)
    return res.status(503).json({ error: "not_configured", message: "Server has no Gemini API key configured." });
  const { question, options, correctIndex, explanation } = req.body || {};
  if (typeof question !== "string" || !Array.isArray(options) || options.length !== 4 ||
      !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3)
    return res.status(400).json({ error: "bad_request", message: "Invalid hint request." });
  try {
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: `Question: ${clean(question, 300)}\nOptions: ${options.map((o, i) => `${i + 1}. ${clean(o, 100)}`).join(" | ")}\nCorrect: ${correctIndex + 1}\nPrinciple: ${clean(explanation, 500)}`,
      config: { systemInstruction: HINT_SYSTEM, temperature: 0.5, maxOutputTokens: 1024 },
    });
    const hint = (resp.text ?? "").trim().slice(0, 220);
    if (!hint) throw new Error("empty hint");
    res.json({ hint });
  } catch (e) {
    console.error("[hint] failed:", e.message);
    res.status(502).json({ error: "hint_failed", message: "Could not generate a hint." });
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

const server = http.createServer(app);

if (isProd) {
  const dist = path.join(__dirname, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Quiz Show on :${PORT} (${isProd ? "production" : "dev"}) model=${MODEL} ai=${ai ? "ready" : "NOT CONFIGURED"}`);
});