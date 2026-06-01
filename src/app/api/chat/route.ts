import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { getChatProvider } from "@/lib/ai/providers";
import { appendChatMessage, getWorkspace } from "@/lib/db/repository";

export async function POST(request: Request) {
  const body = await request.json() as { message?: string };
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  appendChatMessage("user", message);
  const workspace = getWorkspace();
  const provider = getChatProvider();
  const reply = await provider.generate({
    system: SYSTEM_PROMPT,
    messages: workspace.chatMessages.map((chatMessage) => ({
      role: chatMessage.role,
      content: chatMessage.content
    }))
  });
  appendChatMessage("assistant", reply);

  return NextResponse.json({
    reply,
    provider: {
      id: provider.id,
      model: provider.model,
      configured: provider.isConfigured()
    },
    workspace: getWorkspace()
  });
}
