import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("SQLite repository seeds and persists local workspace data", async () => {
  const dir = mkdtempSync(join(tmpdir(), "chatmba-oss-"));
  process.env.DATABASE_URL = `file:${join(dir, "test.db")}`;

  const repo = await import("../src/lib/db/repository");
  repo.seedIfEmpty();
  const initial = repo.getWorkspace();
  assert.equal(initial.schools.length, 3);

  repo.selectSchool(initial.schools[0].id);
  repo.createMaterial("Career note", "Led a cross-functional launch with measurable impact.");
  repo.createEssayDraft(initial.schools[0].id, "Why MBA?", "Goals draft", "I want to connect my operating experience to a clearer path.");
  repo.appendChatMessage("user", "What should I do next?");

  const workspace = repo.getWorkspace();
  assert.equal(workspace.selectedSchools.length, 1);
  assert.equal(workspace.materials.length, 1);
  assert.equal(workspace.essayDrafts.length, 1);
  assert.equal(workspace.chatMessages.length, 1);

  rmSync(dir, { recursive: true, force: true });
});
