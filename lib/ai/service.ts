import { Profile } from "@/lib/db/schema";

export type LlmRole = "system" | "user" | "assistant";

export type LlmMessage = {
  role: LlmRole;
  content: string;
};

export type AiCompletionResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
};

const DEFAULT_MODEL = process.env.LLM_MODEL ?? "gpt-4o-mini";
const API_URL = process.env.LLM_API_URL ?? "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.LLM_API_KEY;

export function buildProfileSystemPrompt(profile: Profile): string {
  return [
    "You are the public AI representative for preffer.me.",
    `Bio: ${profile.bio}`,
    `Services: ${JSON.stringify(profile.services)}`,
    `Pricing: ${profile.pricingInfo ?? "Not provided"}`,
    `Tone: ${profile.tone}`,
    `Custom instructions: ${profile.aiInstructions ?? "None"}`,
    "Behavior rules:",
    "- Be concise, trustworthy, and conversion-oriented.",
    "- Ask clarifying questions when details are missing.",
    "- If a visitor shows intent, collect lead details: name, email, budget, project summary.",
    "- Never invent services or pricing.",
  ].join("\n");
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function generateAiReply(messages: LlmMessage[]): Promise<AiCompletionResult> {
  if (!API_KEY) {
    throw new Error("LLM_API_KEY is not configured");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.4,
      stream: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LLM call failed (${response.status})`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
    model?: string;
  };

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("LLM returned an empty completion");
  }

  return {
    content,
    inputTokens: data.usage?.prompt_tokens ?? estimateTokens(messages.map((m) => m.content).join("\n")),
    outputTokens: data.usage?.completion_tokens ?? estimateTokens(content),
    model: data.model ?? DEFAULT_MODEL,
  };
}

// Prepared for future streaming support.
export async function generateAiReplyStream() {
  throw new Error("Streaming is not enabled yet. Use generateAiReply for now.");
}
