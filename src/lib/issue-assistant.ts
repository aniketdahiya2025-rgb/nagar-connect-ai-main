import type { ComplaintCategory, UrgencyLevel } from "@/lib/sample-data";

export type OutputLanguage = "en" | "hi";

export interface IssueAssistantResult {
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  normalizedTitle: string;
  normalizedDescription: string;
  translatedTitle: string;
  translatedDescription: string;
  detectedLanguage: string;
  confidence: number;
}

const ALLOWED_CATEGORIES: ComplaintCategory[] = [
  "pothole",
  "stray_dogs",
  "gender_violence",
  "food_scarcity",
  "water",
  "sanitation",
  "electricity",
  "other",
];

const ALLOWED_URGENCY: UrgencyLevel[] = ["high", "medium", "low"];

function sanitizeModelJson(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return trimmed;
}

function safeJsonParse(raw: string): Record<string, unknown> | null {
  const cleaned = sanitizeModelJson(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function toConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function toCategory(value: unknown): ComplaintCategory {
  if (typeof value !== "string") return "other";
  return ALLOWED_CATEGORIES.includes(value as ComplaintCategory) ? (value as ComplaintCategory) : "other";
}

function toUrgency(value: unknown): UrgencyLevel {
  if (typeof value !== "string") return "low";
  return ALLOWED_URGENCY.includes(value as UrgencyLevel) ? (value as UrgencyLevel) : "low";
}

async function requestGemini(
  model: string,
  apiKey: string,
  prompt: string,
  useJsonMimeType: boolean
): Promise<Record<string, unknown>> {
  const generationConfig: Record<string, unknown> = {
    temperature: 0.2,
  };
  if (useJsonMimeType) generationConfig.responseMimeType = "application/json";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini ${model} failed (${response.status}): ${errorText.slice(0, 180)}`);
  }

  const payload = await response.json();
  const text =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text ??
    payload?.candidates?.[0]?.output ??
    "";
  const parsed = safeJsonParse(String(text));
  if (!parsed) {
    throw new Error(`Gemini ${model} returned non-JSON content.`);
  }
  return parsed;
}

export async function getIssueAssistantAnalysis(params: {
  title: string;
  description: string;
  outputLanguage: OutputLanguage;
}): Promise<IssueAssistantResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in environment.");
  }

  const prompt = `
You are an assistant for an Indian civic complaint portal.
Analyze the issue text and return STRICT JSON only with this schema:
{
  "category": "pothole|stray_dogs|gender_violence|food_scarcity|water|sanitation|electricity|other",
  "urgency": "high|medium|low",
  "normalizedTitle": "clear short title",
  "normalizedDescription": "cleaned and improved complaint description",
  "translatedTitle": "title translated into requested output language",
  "translatedDescription": "description translated into requested output language",
  "detectedLanguage": "language code like en/hi",
  "confidence": 0.0
}

Rules:
- Keep facts unchanged.
- If text indicates immediate risk/safety/health hazard, set urgency "high".
- Use requested output language "${params.outputLanguage}" for translated fields.
- Return JSON only, no markdown.

Input title: ${params.title}
Input description: ${params.description}
`;

  let parsed: Record<string, unknown> | null = null;
  const attempts: Array<[string, boolean]> = [
    ["gemini-2.0-flash", true],
    ["gemini-2.0-flash", false],
  ];
  let lastError = "Unknown Gemini error";

  for (const [model, useJsonMimeType] of attempts) {
    try {
      parsed = await requestGemini(model, apiKey, prompt, useJsonMimeType);
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown Gemini error";
    }
  }
  if (!parsed) throw new Error(lastError);

  return {
    category: toCategory(parsed.category),
    urgency: toUrgency(parsed.urgency),
    normalizedTitle: toStringValue(parsed.normalizedTitle, params.title),
    normalizedDescription: toStringValue(parsed.normalizedDescription, params.description),
    translatedTitle: toStringValue(parsed.translatedTitle, params.title),
    translatedDescription: toStringValue(parsed.translatedDescription, params.description),
    detectedLanguage: toStringValue(parsed.detectedLanguage, "unknown"),
    confidence: toConfidence(parsed.confidence),
  };
}
