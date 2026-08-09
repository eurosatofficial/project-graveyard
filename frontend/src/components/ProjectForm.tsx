import { useState, type FormEvent } from "react";

import { PROJECT_STATUSES, type ProjectPayload } from "../types";

function localToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export const emptyProject: ProjectPayload = {
  name: "",
  description: "",
  status: "Active",
  category: "",
  technology_tags: [],
  repository_url: null,
  local_project_path: null,
  date_started: localToday(),
  last_worked_on: localToday(),
  reason_paused_abandoned: null,
  next_step: "",
  notes: "",
};

interface ProjectFormProps {
  initialValue?: ProjectPayload;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (value: ProjectPayload) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({ initialValue = emptyProject, submitLabel, busy, error, onSubmit, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<ProjectPayload>(initialValue);
  const [tags, setTags] = useState(initialValue.technology_tags.join(", "));

  function setField<K extends keyof ProjectPayload>(field: K, value: ProjectPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const technologyTags = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    await onSubmit({ ...form, technology_tags: technologyTags });
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <section className="form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div><h2>The project</h2><p>The useful identifying details.</p></div>
        </div>
        <div className="form-grid">
          <label className="field field-wide">
            <span>Project name</span>
            <input required maxLength={160} value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. Tiny Compiler" />
          </label>
          <label className="field field-wide">
            <span>Description</span>
            <textarea required rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="What does this project do?" />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={form.status} onChange={(event) => setField("status", event.target.value as ProjectPayload["status"])}>
              {PROJECT_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <input required maxLength={80} value={form.category} onChange={(event) => setField("category", event.target.value)} placeholder="Developer Tool" />
          </label>
          <label className="field field-wide">
            <span>Technology tags</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="React, TypeScript, SQLite" />
            <small>Separate tags with commas.</small>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>02</span>
          <div><h2>Where & when</h2><p>Enough context to find it again.</p></div>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Date started</span>
            <input required type="date" value={form.date_started} onChange={(event) => setField("date_started", event.target.value)} />
          </label>
          <label className="field">
            <span>Last worked on</span>
            <input required type="date" value={form.last_worked_on} onChange={(event) => setField("last_worked_on", event.target.value)} />
          </label>
          <label className="field field-wide">
            <span>Repository URL <em>optional</em></span>
            <input type="url" maxLength={500} value={form.repository_url ?? ""} onChange={(event) => setField("repository_url", event.target.value || null)} placeholder="https://github.com/you/project" />
          </label>
          <label className="field field-wide">
            <span>Local project path <em>optional</em></span>
            <input maxLength={1000} value={form.local_project_path ?? ""} onChange={(event) => setField("local_project_path", event.target.value || null)} placeholder="~/Code/project" />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>03</span>
          <div><h2>The handoff</h2><p>Leave a clear trail for future you.</p></div>
        </div>
        <div className="form-grid">
          <label className="field field-wide">
            <span>Next step</span>
            <textarea required rows={3} value={form.next_step} onChange={(event) => setField("next_step", event.target.value)} placeholder="The smallest concrete action to take next." />
          </label>
          <label className="field field-wide">
            <span>Reason paused or abandoned <em>optional</em></span>
            <textarea rows={3} value={form.reason_paused_abandoned ?? ""} onChange={(event) => setField("reason_paused_abandoned", event.target.value || null)} placeholder="What got in the way?" />
          </label>
          <label className="field field-wide">
            <span>Notes</span>
            <textarea rows={5} value={form.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Decisions, links, loose thoughts…" />
          </label>
        </div>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="button button-secondary" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : submitLabel}</button>
      </div>
    </form>
  );
}

