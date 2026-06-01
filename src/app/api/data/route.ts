import { NextResponse } from "next/server";
import { getChatProvider } from "@/lib/ai/providers";
import {
  createEssayDraft,
  createMaterial,
  getWorkspace,
  selectSchool,
  updateEssayDraft,
  updateSchoolStatus
} from "@/lib/db/repository";

function workspaceResponse() {
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

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const action = body.action;

  if (action === "selectSchool") {
    selectSchool(String(body.schoolId));
  } else if (action === "updateSchoolStatus") {
    updateSchoolStatus(String(body.schoolId), String(body.status));
  } else if (action === "createMaterial") {
    createMaterial(String(body.title || "Untitled material"), String(body.body || ""), String(body.kind || "note"));
  } else if (action === "createEssayDraft") {
    createEssayDraft(
      String(body.schoolId),
      String(body.prompt || ""),
      String(body.title || "Untitled draft"),
      String(body.body || "")
    );
  } else if (action === "updateEssayDraft") {
    updateEssayDraft(String(body.id), String(body.body || ""), String(body.status || "drafting"));
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return workspaceResponse();
}
