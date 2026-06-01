import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { getChatProvider } from "@/lib/ai/providers";
import { appendChatMessage, getWorkspace } from "@/lib/db/repository";

export async function POST(request: Request) {
  let body: { message?: string };
  try {
    body = await request.json() as { message?: string };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  appendChatMessage("user", message);
  const workspace = getWorkspace();
  const provider = getChatProvider();
  let reply: string;
  let providerError: string | undefined;

  try {
    reply = await provider.generate({
      system: SYSTEM_PROMPT,
      messages: workspace.chatMessages.map((chatMessage) => ({
        role: chatMessage.role,
        content: chatMessage.content
      }))
    });
  } catch (error) {
    providerError = error instanceof Error ? error.message : "Provider request failed";
    console.error(providerError);
    reply = [
      "I could not reach the configured model provider.",
      "Your message was saved locally. Check the provider API key, model name, or network connection, then try again."
    ].join("\n\n");
  }

  appendChatMessage("assistant", reply);

  const providerMetadata = {
    id: provider.id,
    model: provider.model,
    configured: provider.isConfigured()
  };

  return NextResponse.json({
    reply,
    error: providerError,
    provider: providerMetadata,
    workspace: {
      ...getWorkspace(),
      provider: providerMetadata
    }
  });
}
