import { NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/repository";
import { getChatProvider } from "@/lib/ai/providers";

export async function GET() {
  const provider = getChatProvider();
  return NextResponse.json({
    ...getWorkspace(),
    provider: {
      id: provider.id,
      model: provider.model,
      configured: provider.isConfigured()
    }
  });
}
