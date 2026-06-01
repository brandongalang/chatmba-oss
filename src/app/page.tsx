"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type School = {
  id: string;
  name: string;
  program: string;
  location: string;
  round_deadline: string;
  notes: string;
};

type SelectedSchool = {
  school_id: string;
  status: string;
  checklist_json: string;
  updated_at: string;
};

type Material = {
  id: string;
  title: string;
  kind: string;
  body: string;
  updated_at: string;
};

type EssayDraft = {
  id: string;
  school_id: string;
  prompt: string;
  title: string;
  body: string;
  status: string;
  updated_at: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

type Workspace = {
  schools: School[];
  selectedSchools: SelectedSchool[];
  materials: Material[];
  essayDrafts: EssayDraft[];
  chatMessages: ChatMessage[];
  samplePrompts: string[];
  provider: {
    id: string;
    model: string;
    configured: boolean;
  };
};

const emptyWorkspace: Workspace = {
  schools: [],
  selectedSchools: [],
  materials: [],
  essayDrafts: [],
  chatMessages: [],
  samplePrompts: [],
  provider: { id: "openai", model: "", configured: false }
};

async function postAction(action: string, payload: Record<string, unknown> = {}) {
  const response = await fetch("/api/data", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...payload })
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<Workspace>;
}

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialBody, setMaterialBody] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bootstrap")
      .then((response) => response.json())
      .then((data) => {
        setWorkspace(data);
        setSelectedSchoolId(data.selectedSchools?.[0]?.school_id ?? data.schools?.[0]?.id ?? "");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load workspace"))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedIds = useMemo(
    () => new Set(workspace.selectedSchools.map((school) => school.school_id)),
    [workspace.selectedSchools]
  );

  const selectedSchools = workspace.selectedSchools
    .map((selected) => ({
      ...selected,
      school: workspace.schools.find((school) => school.id === selected.school_id)
    }))
    .filter((selected) => selected.school);

  const currentSchool = workspace.schools.find((school) => school.id === selectedSchoolId) ?? workspace.schools[0];
  const currentDraft = workspace.essayDrafts.find((draft) => draft.school_id === currentSchool?.id);

  async function refreshWith(action: string, payload: Record<string, unknown>) {
    setError(null);
    try {
      setWorkspace(await postAction(action, payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function submitMaterial(event: FormEvent) {
    event.preventDefault();
    await refreshWith("createMaterial", {
      title: materialTitle || "Application note",
      body: materialBody,
      kind: "note"
    });
    setMaterialTitle("");
    setMaterialBody("");
  }

  async function createDraft(body = "") {
    if (!currentSchool) return;
    await refreshWith("createEssayDraft", {
      schoolId: currentSchool.id,
      prompt: workspace.samplePrompts[0] ?? "Draft an application essay.",
      title: `${currentSchool.name} essay draft`,
      body
    });
  }

  async function saveDraft(body: string) {
    if (!currentDraft) return;
    await refreshWith("updateEssayDraft", {
      id: currentDraft.id,
      body,
      status: "drafting"
    });
  }

  async function sendChat(event: FormEvent) {
    event.preventDefault();
    if (!chatInput.trim()) return;
    setIsChatting(true);
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setWorkspace(data.workspace);
      setChatInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setIsChatting(false);
    }
  }

  if (isLoading) {
    return <main className="shell">Loading local workspace...</main>;
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">AGPL-3.0 self-hosted edition</p>
          <h1>ChatMBA OSS</h1>
          <p className="lede">
            A local-first MBA application workspace for schools, profile material, essays, and
            AI-assisted planning. SQLite stores the work. You bring the model key.
          </p>
        </div>
        <div className="status-panel">
          <span>Provider</span>
          <strong>{workspace.provider.id} / {workspace.provider.model}</strong>
          <small>{workspace.provider.configured ? "API key configured" : "Fallback mode: no API key set"}</small>
        </div>
      </section>

      {error ? <div className="error">{error}</div> : null}

      <section className="grid two">
        <div className="panel">
          <div className="panel-heading">
            <h2>Schools</h2>
            <span>{selectedSchools.length} selected</span>
          </div>
          <div className="school-list">
            {workspace.schools.map((school) => (
              <button
                className={school.id === currentSchool?.id ? "school active" : "school"}
                key={school.id}
                onClick={() => setSelectedSchoolId(school.id)}
              >
                <strong>{school.name}</strong>
                <span>{school.program} · {school.location}</span>
                <small>Round target: {school.round_deadline}</small>
              </button>
            ))}
          </div>
          {currentSchool ? (
            <div className="actions">
              <button
                disabled={selectedIds.has(currentSchool.id)}
                onClick={() => refreshWith("selectSchool", { schoolId: currentSchool.id })}
              >
                {selectedIds.has(currentSchool.id) ? "Selected" : "Add to plan"}
              </button>
              <button onClick={() => createDraft()}>Create essay draft</button>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Application Plan</h2>
            <span>{workspace.essayDrafts.length} drafts</span>
          </div>
          {selectedSchools.length ? (
            <div className="stack">
              {selectedSchools.map(({ school, status }) => (
                <article className="compact-card" key={school!.id}>
                  <strong>{school!.name}</strong>
                  <select
                    value={status}
                    onChange={(event) =>
                      refreshWith("updateSchoolStatus", { schoolId: school!.id, status: event.target.value })
                    }
                  >
                    <option value="researching">Researching</option>
                    <option value="drafting">Drafting essays</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">Add a school to start a local application plan.</p>
          )}
        </div>
      </section>

      <section className="grid two">
        <form className="panel" onSubmit={submitMaterial}>
          <div className="panel-heading">
            <h2>Profile Material</h2>
            <span>{workspace.materials.length} saved</span>
          </div>
          <input
            value={materialTitle}
            onChange={(event) => setMaterialTitle(event.target.value)}
            placeholder="Material title"
          />
          <textarea
            value={materialBody}
            onChange={(event) => setMaterialBody(event.target.value)}
            placeholder="Paste resume bullets, career notes, story fragments, recommender notes, or interview prep."
          />
          <button type="submit">Save material</button>
          <div className="stack">
            {workspace.materials.slice(0, 3).map((material) => (
              <article className="compact-card" key={material.id}>
                <strong>{material.title}</strong>
                <p>{material.body.slice(0, 180)}</p>
              </article>
            ))}
          </div>
        </form>

        <div className="panel">
          <div className="panel-heading">
            <h2>Essay Draft</h2>
            <span>{currentSchool?.name ?? "No school"}</span>
          </div>
          <EssayDraftEditor
            key={`${currentSchool?.id ?? "none"}:${currentDraft?.id ?? "new"}`}
            draft={currentDraft}
            prompt={currentDraft?.prompt ?? workspace.samplePrompts[0]}
            onCreate={createDraft}
            onSave={saveDraft}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Generic Assistant</h2>
          <span>Non-proprietary prompt</span>
        </div>
        <div className="messages">
          {workspace.chatMessages.length ? workspace.chatMessages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <strong>{message.role}</strong>
              <p>{message.content}</p>
            </article>
          )) : <p className="muted">Ask for help organizing tasks, materials, or drafts. No expert guidance prompts are included.</p>}
        </div>
        <form className="chat-form" onSubmit={sendChat}>
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Ask what to work on next..."
          />
          <button disabled={isChatting} type="submit">{isChatting ? "Thinking..." : "Send"}</button>
        </form>
      </section>
    </main>
  );
}

function EssayDraftEditor({
  draft,
  prompt,
  onCreate,
  onSave
}: {
  draft?: EssayDraft;
  prompt?: string;
  onCreate(body: string): Promise<void>;
  onSave(body: string): Promise<void>;
}) {
  const [body, setBody] = useState(draft?.body ?? "");

  return (
    <>
      <p className="prompt">{prompt}</p>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Start a draft or paste rough notes."
      />
      <div className="actions">
        {draft ? (
          <button onClick={() => onSave(body)}>Save draft</button>
        ) : (
          <button onClick={() => onCreate(body)}>Create draft</button>
        )}
      </div>
    </>
  );
}
