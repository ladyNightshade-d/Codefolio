import { useEffect, useRef, useState } from 'react';
import './upload-shot.css';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB
const PENDING_UPLOAD_KEY = 'codefolio.pending-upload-shot';
let allowUploadDetailsEntry = false;
let pendingUploadEntry = null;

const acceptedImageTypes = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']);
const uploadRules = [
  'High resolution images (png, jpg, gif, webp)',
  'Upload one or multiple images per project',
  'Up to 10MB per image',
  'Only upload media you own the rights to',
];
const suggestedTags = ['Climate', 'Environment', 'Education', 'Health', 'Finance', 'Agriculture'];
const projectStatusOptions = ['Active', 'Completed', 'Archived', 'In Review'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createInitialFormState() {
  return {
    title: '',
    summary: '',
    problemText: '',
    solutionText: '',
    innovationsText: '',
    techStack: [],
    tags: [],
    teamMembers: [],
    year: String(new Date().getFullYear()),
    event: '',
    repositoryUrl: '',
    liveDemoUrl: '',
    status: 'Active',
    feedbackRequested: false,
    collections: [],
  };
}

function buildFeatureList(value = '') {
  const lines = value
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
  if (lines.length > 1) return lines.slice(0, 4);
  return value.split(/[.!?]\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
}

function buildSubmission(files, formState) {
  // Parse innovations from the dedicated field, fall back to parsing solutionText
  const innovationLines = (formState.innovationsText || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);

  const innovations = innovationLines.length
    ? innovationLines.slice(0, 6)
    : buildFeatureList(formState.solutionText);

  return {
    files,
    formData: {
      title: formState.title.trim(),
      summary: formState.summary.trim(),
      techStack: formState.techStack,
      status: formState.status,
      year: formState.year.trim(),
      event: formState.event.trim(),
      problemText: formState.problemText.trim(),
      solutionText: formState.solutionText.trim(),
      innovations,
      teamMembers: formState.teamMembers,
      repositoryUrl: formState.repositoryUrl.trim(),
      liveDemoUrl: formState.liveDemoUrl.trim(),
      feedbackRequested: formState.feedbackRequested,
      collections: formState.collections,
      tags: formState.tags,
    },
  };
}

function navigateToHash(path) {
  if (typeof window !== 'undefined') window.location.hash = path;
}

function grantUploadDetailsEntry() { allowUploadDetailsEntry = true; }
function clearUploadDetailsEntry() { allowUploadDetailsEntry = false; }
function hasUploadDetailsEntry() { return allowUploadDetailsEntry; }

function persistPendingUpload(files) {
  clearPendingUpload();
  const nextFiles = Array.from(files).filter(Boolean);
  if (!nextFiles.length) return null;
  const previewUrl = typeof window !== 'undefined' ? window.URL.createObjectURL(nextFiles[0]) : '';
  pendingUploadEntry = { files: nextFiles, previewUrl };
  return pendingUploadEntry;
}

function readPendingUpload() {
  return pendingUploadEntry;
}

function clearPendingUpload() {
  if (pendingUploadEntry?.previewUrl?.startsWith('blob:') && typeof window !== 'undefined') {
    window.URL.revokeObjectURL(pendingUploadEntry.previewUrl);
  }
  pendingUploadEntry = null;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ImageIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__drop-icon" viewBox="0 0 24 24" fill="none">
      <rect x="4.5" y="5.5" width="15" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8.5 15 2.6-2.9 2.3 2.2 2.1-2.3 2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.2" cy="9.4" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__rule-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.8 12.2 2.2 2.3 4.4-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__button-icon" viewBox="0 0 20 20" fill="none">
      <path d="M4.5 10h10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m10.8 5.2 4.7 4.8-4.7 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="4.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m12.6 12.6 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none">
      <path d="M8.5 11.5a4 4 0 0 0 5.6.1l2-2a4 4 0 0 0-5.7-5.6l-1.1 1.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.5 8.5a4 4 0 0 0-5.6-.1l-2 2a4 4 0 0 0 5.7 5.6l1.1-1.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 14.5c.5-2.2 2-3.3 4-3.3s3.5 1.1 4 3.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.5 14c.3-1.5 1.3-2.3 2.8-2.3 1 0 1.8.3 2.3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__toolbar-icon" viewBox="0 0 20 20" fill="none">
      <circle cx="4.25" cy="5.25" r="1.1" fill="currentColor" />
      <circle cx="4.25" cy="10" r="1.1" fill="currentColor" />
      <circle cx="4.25" cy="14.75" r="1.1" fill="currentColor" />
      <path d="M8 5.25h7.75M8 10h7.75M8 14.75h7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CodefolioMark() {
  return (
    <svg aria-hidden="true" className="upload-shot-page__brand-icon" viewBox="0 0 24 24" fill="none">
      <path d="M6.2 7.1 2.3 12l3.9 4.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2 4.1 10 19.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m17.8 7.1 3.9 4.9-3.9 4.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Token input (tech stack / tags) ─────────────────────────────────────────

function TokenInput({ tokens, onAdd, onRemove, placeholder, inputValue, onInputChange, onKeyDown }) {
  return (
    <div className="upload-shot-page__token-row">
      {tokens.map((token) => (
        <span key={token} className="upload-shot-page__token">
          {token}
          <button
            className="upload-shot-page__token-remove"
            type="button"
            aria-label={`Remove ${token}`}
            onClick={() => onRemove(token)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="upload-shot-page__shell-input"
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
            e.preventDefault();
            onAdd(inputValue.trim());
            onInputChange('');
          }
          if (onKeyDown) onKeyDown(e);
        }}
        style={{ minWidth: 120, border: 'none', background: 'transparent', font: 'inherit', fontSize: 16 }}
      />
    </div>
  );
}

// ─── Step 1: Upload ────────────────────────────────────────────────────────────

function UploadStep({ toAppHref, onFilesReady }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  function validateAndSetFiles(fileList) {
    const files = Array.from(fileList);
    const invalid = files.find((f) => !acceptedImageTypes.has(f.type));
    if (invalid) {
      setValidationMessage(`"${invalid.name}" is not a supported image type.`);
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_UPLOAD_SIZE);
    if (tooBig) {
      setValidationMessage(`"${tooBig.name}" exceeds the 10 MB limit.`);
      return;
    }
    setValidationMessage('');
    setSelectedFiles(files);
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(files.length ? URL.createObjectURL(files[0]) : '');
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) validateAndSetFiles(e.dataTransfer.files);
  }

  function handleFileChange(e) {
    if (e.target.files.length) validateAndSetFiles(e.target.files);
    e.target.value = '';
  }

  function handleContinue() {
    if (!selectedFiles.length) {
      setValidationMessage('Please select at least one image before continuing.');
      return;
    }
    const pending = persistPendingUpload(selectedFiles);
    if (pending) {
      grantUploadDetailsEntry();
      onFilesReady();
    }
  }

  return (
    <div className="upload-shot-page">
      <div className="upload-shot-page__inner">
        {/* Top bar */}
        <div className="upload-shot-page__topbar">
          <a className="upload-shot-page__brand" href={toAppHref('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
            <CodefolioMark />
            <span>Codefolio</span>
          </a>
          <div className="upload-shot-page__topbar-actions">
            <a className="upload-shot-page__secondary-button" href={toAppHref('/profile')}>
              Cancel
            </a>
            <button
              className="upload-shot-page__primary-button"
              type="button"
              disabled={selectedFiles.length === 0}
              onClick={handleContinue}
            >
              Continue
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="upload-shot-page__hero">
          <h1 className="upload-shot-page__title">Upload your project</h1>
          <p className="upload-shot-page__copy">
            Share screenshots, mockups, or diagrams that show your work at its best.
          </p>
        </div>

        {/* Drop zone */}
        <input
          ref={fileInputRef}
          className="upload-shot-page__input"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
        />

        <div
          className={`upload-shot-page__dropzone ${isDragging ? 'upload-shot-page__dropzone--active' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="upload-shot-page__dropzone-surface">
            {selectedFiles.length === 0 ? (
              <>
                <div className="upload-shot-page__drop-icon-badge">
                  <ImageIcon />
                </div>
                <h2 className="upload-shot-page__drop-title">
                  Drag and drop or{' '}
                  <button
                    className="upload-shot-page__browse-button"
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    browse
                  </button>
                </h2>
                <p className="upload-shot-page__drop-copy">
                  Upload project screenshots, mockups, or diagrams
                </p>
                <p className="upload-shot-page__drop-meta">
                  PNG, JPG, GIF or WebP — up to 10 MB each
                </p>
              </>
            ) : (
              <div className="upload-shot-page__drop-selection">
                <div className="upload-shot-page__drop-preview">
                  <div className="upload-shot-page__drop-preview-frame">
                    <img
                      className="upload-shot-page__drop-preview-image"
                      src={previewUrl}
                      alt="Preview"
                    />
                  </div>
                  <div className="upload-shot-page__drop-preview-copy">
                    <h2 className="upload-shot-page__drop-title">
                      {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} ready
                    </h2>
                    <button
                      className="upload-shot-page__thumbnail-action"
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Choose different images
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {validationMessage && (
          <p className="upload-shot-page__validation" role="alert">{validationMessage}</p>
        )}

        {/* Rules */}
        <ul className="upload-shot-page__rules" aria-label="Upload guidelines">
          {uploadRules.map((rule) => (
            <li key={rule} className="upload-shot-page__rule">
              <CheckCircleIcon />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────

function DetailsStep({ toAppHref, contributorDirectory, onSaveDraft, onPublishProject }) {
  const pending = readPendingUpload();
  const previewUrl = pending?.previewUrl || '';

  const [formState, setFormState] = useState(() => createInitialFormState());
  const [techStackInput, setTechStackInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [contributorInput, setContributorInput] = useState('');
  const [contributorResults, setContributorResults] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // contributor search
  function handleContributorInput(value) {
    setContributorInput(value);
    if (!value.trim()) { setContributorResults([]); return; }
    const q = value.toLowerCase();
    const results = (contributorDirectory || [])
      .filter((c) =>
        (c.name.toLowerCase().includes(q) || c.username?.toLowerCase().includes(q)) &&
        !formState.teamMembers.some((m) => m.slug === c.slug)
      )
      .slice(0, 5);
    setContributorResults(results);
  }

  function addTeamMember(contributor) {
    setFormState((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { slug: contributor.slug, name: contributor.name, role: '', avatar: contributor.image }],
    }));
    setContributorInput('');
    setContributorResults([]);
  }

  function removeTeamMember(slug) {
    setFormState((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m.slug !== slug),
    }));
  }

  function updateMemberRole(slug, role) {
    setFormState((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((m) => m.slug === slug ? { ...m, role } : m),
    }));
  }

  function set(field, value) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function addToken(field, value) {
    const trimmed = value.trim();
    if (trimmed && !formState[field].includes(trimmed)) {
      set(field, [...formState[field], trimmed]);
    }
  }

  function removeToken(field, value) {
    set(field, formState[field].filter((t) => t !== value));
  }

  function getFiles() {
    return pending?.files || [];
  }

  function handleSaveDraft() {
    const submission = buildSubmission(getFiles(), formState);
    clearPendingUpload();
    clearUploadDetailsEntry();
    onSaveDraft(submission);
  }

  async function handlePublish() {
    if (!formState.title.trim()) {
      alert('Please add a project title before publishing.');
      return;
    }
    setIsPublishing(true);
    try {
      const submission = buildSubmission(getFiles(), formState);
      clearPendingUpload();
      clearUploadDetailsEntry();
      await onPublishProject(submission);
    } catch {
      setIsPublishing(false);
    }
  }

  return (
    <div className="upload-shot-page upload-shot-page--details">
      <div className="upload-shot-page__inner upload-shot-page__inner--details">

        {/* Top bar */}
        <div className="upload-shot-page__topbar upload-shot-page__topbar--details">
          <a
            className="upload-shot-page__brand"
            href={toAppHref('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
          >
            <CodefolioMark />
            <span>Codefolio</span>
          </a>
          <div className="upload-shot-page__topbar-actions">
            <button
              className="upload-shot-page__secondary-button upload-shot-page__secondary-button--soft"
              type="button"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </button>
            <button
              className="upload-shot-page__primary-button upload-shot-page__primary-button--publish"
              type="button"
              disabled={isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Page title */}
        <div className="upload-shot-page__details-hero">
          <h1 className="upload-shot-page__details-title">Project details</h1>
        </div>

        <div className="upload-shot-page__details-shell">
          <div className="upload-shot-page__details-form">

            {/* ── Basic info ── */}
            <section className="upload-shot-page__details-section">
              <h2 className="upload-shot-page__section-title">Project info</h2>

              <div className="upload-shot-page__field">
                <label className="upload-shot-page__field-label" htmlFor="proj-title">
                  Title <span className="upload-shot-page__field-helper">(required)</span>
                </label>
                <input
                  id="proj-title"
                  className="upload-shot-page__text-input"
                  type="text"
                  placeholder="e.g. Community Loop"
                  value={formState.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div className="upload-shot-page__field">
                <label className="upload-shot-page__field-label" htmlFor="proj-summary">
                  Summary
                </label>
                <textarea
                  id="proj-summary"
                  className="upload-shot-page__text-area"
                  placeholder="A short sentence describing what your project does."
                  value={formState.summary}
                  onChange={(e) => set('summary', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="upload-shot-page__field-grid">
                <div className="upload-shot-page__field">
                  <label className="upload-shot-page__field-label" htmlFor="proj-year">Year</label>
                  <input
                    id="proj-year"
                    className="upload-shot-page__text-input"
                    type="text"
                    placeholder="2026"
                    value={formState.year}
                    onChange={(e) => set('year', e.target.value)}
                  />
                </div>
                <div className="upload-shot-page__field">
                  <label className="upload-shot-page__field-label" htmlFor="proj-event">Event / Course</label>
                  <input
                    id="proj-event"
                    className="upload-shot-page__text-input"
                    type="text"
                    placeholder="e.g. RCA Hackathon 2026"
                    value={formState.event}
                    onChange={(e) => set('event', e.target.value)}
                  />
                </div>
              </div>

              <div className="upload-shot-page__field">
                <p className="upload-shot-page__field-label">Tech Stack</p>
                <div className="upload-shot-page__input-shell upload-shot-page__input-shell--plain">
                  <TokenInput
                    tokens={formState.techStack}
                    onAdd={(v) => addToken('techStack', v)}
                    onRemove={(v) => removeToken('techStack', v)}
                    placeholder="React, Node.js…"
                    inputValue={techStackInput}
                    onInputChange={setTechStackInput}
                  />
                </div>
              </div>

              <div className="upload-shot-page__field">
                <p className="upload-shot-page__field-label">Tags</p>
                <div className="upload-shot-page__input-shell upload-shot-page__input-shell--plain">
                  <TokenInput
                    tokens={formState.tags}
                    onAdd={(v) => addToken('tags', v)}
                    onRemove={(v) => removeToken('tags', v)}
                    placeholder="Add a tag…"
                    inputValue={tagInput}
                    onInputChange={setTagInput}
                  />
                </div>
                <div className="upload-shot-page__suggestion-list" style={{ marginTop: 10 }}>
                  {suggestedTags.filter((t) => !formState.tags.includes(t)).map((tag) => (
                    <button
                      key={tag}
                      className="upload-shot-page__suggestion-button"
                      type="button"
                      onClick={() => addToken('tags', tag)}
                    >
                      <span>{tag}</span>
                      <span>+ Add</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Problem & Solution ── */}
            <section className="upload-shot-page__details-section">
              <h2 className="upload-shot-page__section-title">Problem &amp; Solution</h2>

              <div className="upload-shot-page__field">
                <label className="upload-shot-page__field-label" htmlFor="proj-problem">The Problem</label>
                <textarea
                  id="proj-problem"
                  className="upload-shot-page__text-area upload-shot-page__text-area--problem"
                  placeholder="What pain point or gap does this project address?"
                  value={formState.problemText}
                  onChange={(e) => set('problemText', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="upload-shot-page__field">
                <label className="upload-shot-page__field-label" htmlFor="proj-solution">The Solution</label>
                <p className="upload-shot-page__support-copy" style={{ marginBottom: 10 }}>
                  Describe your approach. List key innovations one per line for best results.
                </p>
                <div className="upload-shot-page__editor">
                  <div className="upload-shot-page__editor-toolbar" aria-hidden="true">
                    <button className="upload-shot-page__toolbar-button upload-shot-page__toolbar-button--bold" type="button" title="Bold">B</button>
                    <button className="upload-shot-page__toolbar-button upload-shot-page__toolbar-button--italic" type="button" title="Italic">I</button>
                    <button className="upload-shot-page__toolbar-button" type="button" title="Bullet list"><ListIcon /></button>
                  </div>
                  <textarea
                    id="proj-solution"
                    className="upload-shot-page__editor-input"
                    placeholder={"How did you solve it? Describe your approach here."}
                    value={formState.solutionText}
                    onChange={(e) => set('solutionText', e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              <div className="upload-shot-page__field">
                <label className="upload-shot-page__field-label" htmlFor="proj-innovations">
                  Key Innovations
                  <span className="upload-shot-page__field-helper"> (one per line)</span>
                </label>
                <textarea
                  id="proj-innovations"
                  className="upload-shot-page__text-area"
                  placeholder={"- Real-time collaboration\n- AI-powered search\n- Mobile-first design"}
                  value={formState.innovationsText || ''}
                  onChange={(e) => set('innovationsText', e.target.value)}
                  rows={4}
                />
              </div>
            </section>

            {/* ── Team ── */}
            <section className="upload-shot-page__details-section">
              <h2 className="upload-shot-page__section-title">Team members</h2>

              <div className="upload-shot-page__field">
                <label className="upload-shot-page__field-label" htmlFor="proj-contributors">
                  Add contributors
                </label>
                <div className="upload-shot-page__input-shell" style={{ position: 'relative' }}>
                  <UsersIcon />
                  <input
                    id="proj-contributors"
                    className="upload-shot-page__shell-input"
                    type="text"
                    placeholder="Search by name or username…"
                    value={contributorInput}
                    onChange={(e) => handleContributorInput(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                {contributorResults.length > 0 && (
                  <div className="upload-shot-page__suggestion-list" style={{ marginTop: 8 }}>
                    {contributorResults.map((c) => (
                      <button
                        key={c.slug}
                        className="upload-shot-page__suggestion-button"
                        type="button"
                        onClick={() => addTeamMember(c)}
                      >
                        <span>{c.name}</span>
                        <span>{c.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formState.teamMembers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  {formState.teamMembers.map((member) => (
                    <div
                      key={member.slug}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: '1px solid #e5e0d8', borderRadius: 16 }}
                    >
                      {member.avatar && (
                        <img src={member.avatar} alt={member.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <span style={{ flex: 1, fontWeight: 500 }}>{member.name}</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        placeholder="Role (e.g. Backend Lead)"
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.slug, e.target.value)}
                        style={{ width: 180, minHeight: 36, fontSize: 14 }}
                      />
                      <button
                        className="upload-shot-page__token-remove"
                        type="button"
                        aria-label={`Remove ${member.name}`}
                        onClick={() => removeTeamMember(member.slug)}
                        style={{ fontSize: 18, padding: '0 4px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Links + final settings ── */}
            <section className="upload-shot-page__details-section upload-shot-page__details-section--final">
              <h2 className="upload-shot-page__section-title">Links &amp; settings</h2>

              <div className="upload-shot-page__final-grid">
                {/* Thumbnail */}
                <div className="upload-shot-page__thumbnail-column">
                  <div className="upload-shot-page__thumbnail-card">
                    {previewUrl ? (
                      <img className="upload-shot-page__thumbnail-image" src={previewUrl} alt="Project thumbnail" />
                    ) : (
                      <div className="upload-shot-page__thumbnail-empty">No image selected</div>
                    )}
                  </div>
                  <button
                    className="upload-shot-page__thumbnail-action"
                    type="button"
                    onClick={() => { clearUploadDetailsEntry(); navigateToHash('/profile/upload'); }}
                  >
                    Change images
                  </button>
                </div>

                {/* Settings */}
                <div className="upload-shot-page__final-settings">
                  <div className="upload-shot-page__field">
                    <label className="upload-shot-page__field-label" htmlFor="proj-repo">
                      Repository URL
                    </label>
                    <div className="upload-shot-page__input-shell">
                      <LinkIcon />
                      <input
                        id="proj-repo"
                        className="upload-shot-page__shell-input"
                        type="url"
                        placeholder="https://github.com/…"
                        value={formState.repositoryUrl}
                        onChange={(e) => set('repositoryUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="upload-shot-page__field">
                    <label className="upload-shot-page__field-label" htmlFor="proj-demo">
                      Live Demo URL
                    </label>
                    <div className="upload-shot-page__input-shell">
                      <LinkIcon />
                      <input
                        id="proj-demo"
                        className="upload-shot-page__shell-input"
                        type="url"
                        placeholder="https://…"
                        value={formState.liveDemoUrl}
                        onChange={(e) => set('liveDemoUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="upload-shot-page__setting-block">
                    <p className="upload-shot-page__setting-title">Project status</p>
                    <div className="upload-shot-page__radio-group" role="radiogroup" aria-label="Project status">
                      {projectStatusOptions.map((option) => (
                        <label key={option} className="upload-shot-page__radio-option">
                          <input
                            type="radio"
                            name="proj-status"
                            value={option}
                            checked={formState.status === option}
                            onChange={() => set('status', option)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Feedback toggle */}
                  <div className="upload-shot-page__setting-row">
                    <div>
                      <p className="upload-shot-page__setting-title">Request feedback</p>
                      <p className="upload-shot-page__support-copy">
                        Let other contributors leave reviews on this project.
                      </p>
                    </div>
                    <button
                      className={`upload-shot-page__toggle ${formState.feedbackRequested ? 'upload-shot-page__toggle--active' : ''}`}
                      type="button"
                      role="switch"
                      aria-checked={formState.feedbackRequested}
                      onClick={() => set('feedbackRequested', !formState.feedbackRequested)}
                    >
                      <span className="upload-shot-page__toggle-handle" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

function UploadShotPage({ mode = 'upload', toAppHref, contributorDirectory = [], onSaveDraft, onPublishProject }) {
  const isDetailsMode = mode === 'details';

  // Guard: if someone navigates directly to /profile/upload/details without
  // going through the upload step first, redirect them back.
  useEffect(() => {
    if (isDetailsMode && !hasUploadDetailsEntry()) {
      navigateToHash('/profile/upload');
    }
  }, [isDetailsMode]);

  function handleFilesReady() {
    navigateToHash('/profile/upload/details');
  }

  if (isDetailsMode) {
    return (
      <DetailsStep
        toAppHref={toAppHref}
        contributorDirectory={contributorDirectory}
        onSaveDraft={onSaveDraft}
        onPublishProject={onPublishProject}
      />
    );
  }

  return (
    <UploadStep
      toAppHref={toAppHref}
      onFilesReady={handleFilesReady}
    />
  );
}

export default UploadShotPage;
