import { randomUUID } from "node:crypto";
import { getDb } from "./client";
import { samplePrompts, sampleSchools } from "../sample-data/schools";

export interface SchoolRow {
  id: string;
  name: string;
  program: string;
  location: string;
  round_deadline: string;
  notes: string;
}

export interface SelectedSchoolRow {
  school_id: string;
  status: string;
  checklist_json: string;
  updated_at: string;
}

export interface MaterialRow {
  id: string;
  title: string;
  kind: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface EssayDraftRow {
  id: string;
  school_id: string;
  prompt: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export function seedIfEmpty() {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as count FROM schools").get() as { count: number };
  if (count.count > 0) return;
  const insert = db.prepare(
    "INSERT INTO schools (id, name, program, location, round_deadline, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const tx = db.transaction(() => {
    for (const school of sampleSchools) {
      insert.run(school.id, school.name, school.program, school.location, school.roundDeadline, school.notes);
    }
  });
  tx();
}

export function getWorkspace() {
  seedIfEmpty();
  const db = getDb();
  return {
    schools: db.prepare("SELECT * FROM schools ORDER BY name").all() as SchoolRow[],
    selectedSchools: db.prepare("SELECT * FROM selected_schools ORDER BY updated_at DESC").all() as SelectedSchoolRow[],
    materials: db.prepare("SELECT * FROM materials ORDER BY updated_at DESC").all() as MaterialRow[],
    essayDrafts: db.prepare("SELECT * FROM essay_drafts ORDER BY updated_at DESC").all() as EssayDraftRow[],
    chatMessages: db.prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC").all("local") as ChatMessageRow[],
    samplePrompts
  };
}

export function selectSchool(schoolId: string) {
  const checklist = {
    research: false,
    essays: false,
    resume: false,
    recommender: false,
    submitted: false
  };
  getDb()
    .prepare(
      `INSERT INTO selected_schools (school_id, status, checklist_json, updated_at)
       VALUES (?, 'researching', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(school_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`
    )
    .run(schoolId, JSON.stringify(checklist));
}

export function updateSchoolStatus(schoolId: string, status: string) {
  getDb()
    .prepare("UPDATE selected_schools SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE school_id = ?")
    .run(status, schoolId);
}

export function createMaterial(title: string, body: string, kind = "note") {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO materials (id, title, kind, body) VALUES (?, ?, ?, ?)")
    .run(id, title, kind, body);
  return id;
}

export function createEssayDraft(schoolId: string, prompt: string, title: string, body = "") {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO essay_drafts (id, school_id, prompt, title, body) VALUES (?, ?, ?, ?, ?)")
    .run(id, schoolId, prompt, title, body);
  return id;
}

export function updateEssayDraft(id: string, body: string, status: string) {
  getDb()
    .prepare("UPDATE essay_drafts SET body = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(body, status, id);
}

export function appendChatMessage(role: "user" | "assistant" | "system", content: string, sessionId = "local") {
  const db = getDb();
  db.prepare(
    "INSERT INTO chat_sessions (id, title) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP"
  ).run(sessionId, "Local workspace");
  const id = randomUUID();
  db.prepare("INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)")
    .run(id, sessionId, role, content);
  return id;
}
