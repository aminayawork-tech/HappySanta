// ─────────────────────────────────────────────────────────────
// HappySanta — AI Gift Suggestion Service
// Supports OpenAI GPT-4o and Grok (X.AI) — switchable via env.
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import { uuid } from '@/utils/helpers';
import type { AISuggestion, GiftInterest, Relationship } from '@/types';
import { INTEREST_LABELS, RELATIONSHIP_LABELS } from '@/utils/constants';

// ── Provider config ───────────────────────────────────────────

type AIProvider = 'openai' | 'grok';

const PROVIDER: AIProvider =
  (process.env.EXPO_PUBLIC_AI_PROVIDER as AIProvider) ?? 'openai';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const GROK_BASE_URL =
  process.env.EXPO_PUBLIC_GROK_BASE_URL ?? 'https://api.x.ai/v1';

function getApiKey(): string {
  if (PROVIDER === 'grok') {
    return process.env.EXPO_PUBLIC_GROK_API_KEY ?? '';
  }
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
}

function getBaseUrl(): string {
  return PROVIDER === 'grok' ? GROK_BASE_URL : OPENAI_BASE_URL;
}

function getModel(): string {
  if (PROVIDER === 'grok') return 'grok-3';
  return process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4o';
}

// ── System prompt ─────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are HappySanta, a cheerful and knowledgeable Christmas gift expert. Your job is to suggest perfect, thoughtful, age-appropriate gift ideas that people can find on Amazon. Always be enthusiastic and festive! 🎅🎄`;
}

function buildUserPrompt(
  age: number,
  relationship: Relationship,
  budget: number,
  interests: GiftInterest[],
  gender?: string,
): string {
  const relationshipLabel = RELATIONSHIP_LABELS[relationship].toLowerCase();
  const interestLabels = interests.map((i) => INTEREST_LABELS[i]).join(', ');
  const genderText = gender && gender !== 'prefer-not-to-say' ? ` ${gender}` : '';

  return `Suggest 8–12 perfect Christmas gift ideas for a ${age}-year-old${genderText} ${relationshipLabel} with a $${budget} budget${
    interests.length > 0 ? ` who loves: ${interestLabels}` : ''
  }.

Focus on fun, thoughtful, age-appropriate items available on Amazon.

Respond ONLY with a valid JSON array (no markdown, no extra text). Each element must have:
{
  "title": "Short gift title",
  "reason": "One sentence explaining why this is the perfect gift",
  "estimatedPriceMin": 25,
  "estimatedPriceMax": 45,
  "keywords": ["keyword phrase 1", "keyword phrase 2", "keyword phrase 3"]
}

Rules:
- Keep all prices within the $${budget} budget
- keywords must be specific Amazon search terms (2–4 words each)
- titles should be concise (under 60 chars)
- reasons should be warm, personal, and specific
- Mix price points from cheap-and-fun to the budget ceiling
- Include a variety across the interests provided`;
}

// ── Raw API call ──────────────────────────────────────────────

interface RawSuggestion {
  title: string;
  reason: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  keywords: string[];
}

async function callChatCompletion(messages: { role: string; content: string }[]): Promise<string> {
  const response = await axios.post(
    `${getBaseUrl()}/chat/completions`,
    {
      model:       getModel(),
      messages,
      temperature: 0.8,
      max_tokens:  2000,
    },
    {
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${getApiKey()}`,
      },
      timeout: 30000,
    },
  );
  return response.data.choices[0].message.content as string;
}

// ── Main export ───────────────────────────────────────────────

export interface GetSuggestionsParams {
  age: number;
  relationship: Relationship;
  budget: number;
  interests: GiftInterest[];
  gender?: string;
}

/**
 * Call the AI API and return parsed gift suggestions.
 * Returns an array of AISuggestion objects ready to display.
 */
export async function getAISuggestions(
  params: GetSuggestionsParams,
): Promise<AISuggestion[]> {
  const { age, relationship, budget, interests, gender } = params;

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user',   content: buildUserPrompt(age, relationship, budget, interests, gender) },
  ];

  const rawContent = await callChatCompletion(messages);

  // Strip any markdown fences if the model wraps the JSON
  const jsonText = rawContent
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  let parsed: RawSuggestion[];
  try {
    parsed = JSON.parse(jsonText) as RawSuggestion[];
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawContent.slice(0, 200)}`);
  }

  return parsed.map((s) => ({
    id:                 uuid(),
    title:              s.title,
    reason:             s.reason,
    estimatedPriceMin:  s.estimatedPriceMin,
    estimatedPriceMax:  s.estimatedPriceMax,
    keywords:           s.keywords ?? [],
    isLoading:          true, // Triggers Amazon search skeleton
  }));
}

// ── Refinement prompt (optional) ──────────────────────────────

/**
 * Ask HappySanta to refine a single suggestion.
 * Useful for "Suggest something different" UX.
 */
export async function refineSuggestion(
  originalTitle: string,
  params: GetSuggestionsParams,
  feedback: string,
): Promise<AISuggestion> {
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role:    'user',
      content: `I had a gift idea: "${originalTitle}" for a ${params.age}-year-old ${params.relationship}.
The user's feedback: "${feedback}"
Suggest ONE alternative gift that addresses this feedback. Same format as before:
{ "title": "...", "reason": "...", "estimatedPriceMin": 0, "estimatedPriceMax": 0, "keywords": [] }
Respond with ONLY the JSON object, no markdown.`,
    },
  ];

  const rawContent = await callChatCompletion(messages);
  const jsonText = rawContent
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const s = JSON.parse(jsonText) as RawSuggestion;
  return {
    id:                uuid(),
    title:             s.title,
    reason:            s.reason,
    estimatedPriceMin: s.estimatedPriceMin,
    estimatedPriceMax: s.estimatedPriceMax,
    keywords:          s.keywords ?? [],
    isLoading:         true,
  };
}
