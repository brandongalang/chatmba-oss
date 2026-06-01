export type ChatProviderId = "openai" | "anthropic" | "google" | "openrouter";

export interface ChatTurn {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateParams {
  messages: ChatTurn[];
  system?: string;
}

export interface ChatProvider {
  id: ChatProviderId;
  model: string;
  isConfigured(): boolean;
  generate(params: GenerateParams): Promise<string>;
}
