import { SYSTEM_PROMPT } from "../prompt";
import type { ChatProvider, ChatProviderId, ChatTurn, GenerateParams } from "./types";

const DEFAULT_MODELS: Record<ChatProviderId, string> = {
  openai: "gpt-4.1-mini",
  anthropic: "claude-sonnet-4-5",
  google: "gemini-2.5-flash",
  openrouter: "deepseek/deepseek-v4-flash"
};

function providerId(): ChatProviderId {
  const raw = process.env.CHAT_MODEL_PROVIDER?.trim().toLowerCase();
  if (raw === "anthropic" || raw === "google" || raw === "openrouter") return raw;
  return "openai";
}

function modelFor(id: ChatProviderId) {
  return process.env.CHAT_MODEL_PRIMARY?.trim() || DEFAULT_MODELS[id];
}

function latestUserMessage(messages: ChatTurn[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function fallbackReply(messages: ChatTurn[]) {
  const last = latestUserMessage(messages);
  return [
    "Fallback mode: I can help organize this application workspace.",
    last ? `You asked: "${last.slice(0, 240)}"` : "Tell me what school, essay, or profile material you want to work on.",
    "A useful next step is to identify the school, the prompt, the raw material you already have, and what decision you need to make next."
  ].join("\n\n");
}

function requireProviderText(text: string | undefined, messages: ChatTurn[]) {
  const trimmed = text?.trim();
  if (trimmed) return trimmed;
  if (messages.length === 0) return fallbackReply(messages);
  throw new Error("Provider returned an empty response");
}

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Provider request failed (${response.status}): ${text.slice(0, 400)}`);
  }
  return response.json() as Promise<unknown>;
}

function openAiCompatible(id: "openai" | "openrouter", apiKey: string | undefined, baseUrl: string): ChatProvider {
  const model = modelFor(id);
  return {
    id,
    model,
    isConfigured: () => Boolean(apiKey),
    async generate(params: GenerateParams) {
      if (!apiKey) return fallbackReply(params.messages);
      const messages = [
        { role: "system", content: params.system ?? SYSTEM_PROMPT },
        ...params.messages.map((message) => ({ role: message.role, content: message.content }))
      ];
      const json = await postJson(
        `${baseUrl}/chat/completions`,
        { authorization: `Bearer ${apiKey}` },
        { model, messages, temperature: 0.4 }
      ) as { choices?: Array<{ message?: { content?: string } }> };
      return requireProviderText(json.choices?.[0]?.message?.content, params.messages);
    }
  };
}

function anthropicProvider(): ChatProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = modelFor("anthropic");
  return {
    id: "anthropic",
    model,
    isConfigured: () => Boolean(apiKey),
    async generate(params) {
      if (!apiKey) return fallbackReply(params.messages);
      const json = await postJson(
        "https://api.anthropic.com/v1/messages",
        {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        {
          model,
          system: params.system ?? SYSTEM_PROMPT,
          max_tokens: 1200,
          messages: params.messages
            .filter((message) => message.role !== "system")
            .map((message) => ({ role: message.role, content: message.content }))
        }
      ) as { content?: Array<{ text?: string }> };
      return requireProviderText(json.content?.map((part) => part.text).filter(Boolean).join("\n"), params.messages);
    }
  };
}

function googleProvider(): ChatProvider {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const model = modelFor("google");
  return {
    id: "google",
    model,
    isConfigured: () => Boolean(apiKey),
    async generate(params) {
      if (!apiKey) return fallbackReply(params.messages);
      const contents = params.messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }]
        }));
      const json = await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {},
        {
          systemInstruction: { parts: [{ text: params.system ?? SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.4 }
        }
      ) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      return requireProviderText(
        json.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n"),
        params.messages
      );
    }
  };
}

export function getChatProvider(): ChatProvider {
  const id = providerId();
  if (id === "anthropic") return anthropicProvider();
  if (id === "google") return googleProvider();
  if (id === "openrouter") {
    return openAiCompatible("openrouter", process.env.OPENROUTER_API_KEY, "https://openrouter.ai/api/v1");
  }
  return openAiCompatible("openai", process.env.OPENAI_API_KEY, "https://api.openai.com/v1");
}
