import { useEffect, useMemo, useRef, useState } from 'react';
import './upload-shot.css';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
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
const suggestedTags = ['Climate', 'Environment', 'Wastes'];
const projectStatusOptions = ['Active', 'Completed', 'Archived'];

function createInitialFormState() {
  return {
    title: '',
    summary: '',
    problemText: '',
    solutionText: '',
    keyFeaturesText: '',
    techStack: [],
    tags: [],
    teamMembers: [],
    year: '',
    event: '',
    repositoryUrl: '',
    liveDemoUrl: '',
    status: 'Active',
    feedbackRequested: false,
  };
}

function normalizeValue(value = '') {
  return value.trim().toLowerCase();
}

function buildFeatureList(value = '') {
  const lines = value.split(/\r?\n/).map((line) => line.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  if (lines.length > 1) return lines.slice(0, 4);
  return value.split(/[.!?]\s+/).map((item) => item.trim()).filter(Boolean).slice(0, 4);
}

function buildSubmission(files, formState) {
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
      keyFeaturesText: formState.keyFeaturesText.trim(),
      innovations: buildFeatureList(formState.solutionText),
      keyFeatures: buildFeatureList(formState.keyFeaturesText),
      teamMembers: formState.teamMembers,
      repositoryUrl: formState.repositoryUrl.trim(),
      liveDemoUrl: formState.liveDemoUrl.trim(),
      feedbackRequested: formState.feedbackRequested,
      collections: [],
      tags: formState.tags,
    },
  };
}

function navigateToHash(path) {
  if (typeof window !== 'undefined') {
    window.location.hash = path;
  }
}

function grantUploadDetailsEntry() {
  allowUploadDetailsEntry = true;
}

function clearUploadDetailsEntry() {
  allowUploadDetailsEntry = false;
}

function hasUploadDetailsEntry() {
  return allowUploadDetailsEntry;
}

function readPendingUpload() {
  if (pendingUploadEntry?.files?.length) return pendingUploadEntry;
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_UPLOAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const legacyFile = pendingUploadDataToFile(parsed);
    if (!legacyFile) return null;
    pendingUploadEntry = {
      files: [legacyFile],
      previewUrl: parsed.dataUrl || '',
    };
    return pendingUploadEntry;
  } catch {
    return null;
  }
}

function clearPendingUpload() {
  if (pendingUploadEntry?.previewUrl?.startsWith('blob:') && typeof window !== 'undefined') {
    window.URL.revokeObjectURL(pendingUploadEntry.previewUrl);
  }
  pendingUploadEntry = null;
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(PENDING_UPLOAD_KEY);
  }
}

function persistPendingUpload(files) {
  clearPendingUpload();
  const nextFiles = Array.from(files).filter(Boolean);
  if (!nextFiles.length) return null;
  const previewUrl = typeof window !== 'undefined' ? window.URL.createObjectURL(nextFiles[0]) : '';
  pendingUploadEntry = {
    files: nextFiles,
    previewUrl,
  };
  return pendingUploadEntry;
}

function pendingUploadDataToFile(pendingUpload) {
  if (!pendingUpload?.dataUrl) return null;
  const [, mime = pendingUpload.type || 'application/octet-stream'] = pendingUpload.dataUrl.match(/^data:(.*?);base64,/) || [];
  const base64 = pendingUpload.dataUrl.split(',')[1] || '';
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], pendingUpload.name || 'upload.png', {
    type: mime,
    lastModified: pendingUpload.lastModified || Date.now(),
  });
}

function getPendingUploadFiles(pendingUpload) {
  if (Array.isArray(pendingUpload?.files)) {
    return pendingUpload.files.filter(Boolean);
  }
  const legacyFile = pendingUploadDataToFile(pendingUpload);
  return legacyFile ? [legacyFile] : [];
}

function getPendingUploadPreviewUrl(pendingUpload) {
  if (typeof pendingUpload?.previewUrl === 'string' && pendingUpload.previewUrl) {
    return pendingUpload.previewUrl;
  }
  if (typeof pendingUpload?.dataUrl === 'string' && pendingUpload.dataUrl) {
    return pendingUpload.dataUrl;
  }
  return '';
}

function ImageIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__drop-icon" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="5.5" width="15" height="13" rx="2.5" /><path d="m8.5 15 2.6-2.9 2.3 2.2 2.1-2.3 2 3" /><circle cx="9.2" cy="9.4" r="1.2" /></svg>;
}

function CheckCircleIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__rule-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" /><path d="m8.8 12.2 2.2 2.3 4.4-4.8" /></svg>;
}

function ArrowRightIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__button-icon" viewBox="0 0 20 20" fill="none"><path d="M4.5 10h10.2" /><path d="m10.8 5.2 4.7 4.8-4.7 4.8" /></svg>;
}

function SearchIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="4.8" /><path d="m12.6 12.6 4 4" /></svg>;
}

function LinkIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none"><path d="m7 10 3-3 3 3" /><path d="m6 13-2-2 2-2" /><path d="m14 13 2-2-2-2" /></svg>;
}

function ExternalLinkIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none"><path d="M8 4h8v8" /><path d="m16 4-8 8" /><path d="M12 10v5H4V7h5" /></svg>;
}

function UsersIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__field-icon" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="2.2" /><path d="M3.8 14.2c.5-2 2-3 4-3s3.5 1 4 3" /><circle cx="14.4" cy="8" r="1.7" /><path d="M12.6 13.8c.3-1.4 1.3-2.2 2.8-2.2 1 0 1.8.3 2.4.8" /></svg>;
}

function ListBulletsIcon() {
  return <svg aria-hidden="true" className="upload-shot-page__toolbar-icon" viewBox="0 0 20 20" fill="none"><circle cx="4.25" cy="5.25" r="1.1" /><circle cx="4.25" cy="10" r="1.1" /><circle cx="4.25" cy="14.75" r="1.1" /><path d="M8 5.25h7.75" /><path d="M8 10h7.75" /><path d="M8 14.75h7.75" /></svg>;
}

function UploadShotPage({ mode = 'upload', toAppHref, contributorDirectory = [], onSaveDraft, onPublishProject }) {
  const isDetailsMode = mode === 'details';
  const fileInputRef = useRef(null);
  const solutionInputRef = useRef(null);
  const keyFeaturesInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [contributorInput, setContributorInput] = useState('');
  const [formState, setFormState] = useState(() => createInitialFormState());
  const pendingUpload = isDetailsMode ? readPendingUpload() : null;
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const canOpenDetails = !isDetailsMode || hasUploadDetailsEntry();

  const profileHref = typeof toAppHref === 'function' ? toAppHref('/profile') : '/profile';
  const acceptedFileList = Array.from(acceptedImageTypes).join(',');
  const pendingFiles = useMemo(() => getPendingUploadFiles(pendingUpload), [pendingUpload]);
  const previewUrl = useMemo(() => getPendingUploadPreviewUrl(pendingUpload), [pendingUpload]);
  const primaryPendingFile = pendingFiles[0] || null;
  const selectedImageCount = selectedFiles.length;
  const contributorSuggestions = useMemo(() => {
    const query = normalizeValue(contributorInput);
    if (!query) return [];
    return contributorDirectory.filter((contributor) => {
      const alreadySelected = formState.teamMembers.some((member) => contributor.slug ? member.slug === contributor.slug : normalizeValue(member.name) === normalizeValue(contributor.name));
      return !alreadySelected && (normalizeValue(contributor.name).includes(query) || normalizeValue(contributor.username || '').includes(query));
    }).slice(0, 5);
  }, [contributorDirectory, contributorInput, formState.teamMembers]);

  useEffect(() => {
    if (isDetailsMode) return;
    clearUploadDetailsEntry();
    clearPendingUpload();
    setIsRouting(false);
  }, [isDetailsMode]);

  useEffect(() => {
    if (!isDetailsMode) return;
    if (pendingFiles.length && canOpenDetails) return;
    clearUploadDetailsEntry();
    clearPendingUpload();
    navigateToHash('/profile/upload');
  }, [canOpenDetails, isDetailsMode, pendingFiles.length]);

  function updateFormField(field, value) {
    setFormState((currentState) => ({ ...currentState, [field]: value }));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileSelection(fileList) {
    const nextFiles = Array.from(fileList).filter(Boolean);
    if (!nextFiles.length) return;

    const invalidFile = nextFiles.find((file) => !acceptedImageTypes.has(file.type));
    if (invalidFile) {
      setValidationMessage('Please choose only PNG, JPG, GIF, or WebP images.');
      return;
    }

    const oversizedFile = nextFiles.find((file) => file.size > MAX_UPLOAD_SIZE);
    if (oversizedFile) {
      setValidationMessage('Each image must be smaller than 10MB.');
      return;
    }

    setSelectedFiles(nextFiles);
    setValidationMessage('');
  }

  function handleDragEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event) {
    handleDragEvent(event);
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files);
  }

  function addToken(field, rawValue, maxItems = Number.POSITIVE_INFINITY) {
    const nextValue = rawValue.trim().replace(/,$/, '');
    if (!nextValue) return;
    setFormState((currentState) => {
      if (currentState[field].length >= maxItems || currentState[field].some((item) => normalizeValue(item) === normalizeValue(nextValue))) {
        return currentState;
      }
      return { ...currentState, [field]: [...currentState[field], nextValue] };
    });
  }

  function removeToken(field, valueToRemove) {
    setFormState((currentState) => ({ ...currentState, [field]: currentState[field].filter((item) => item !== valueToRemove) }));
  }

  function addContributor(rawValue) {
    const query = rawValue.trim();
    if (!query) return;
    const normalizedQuery = normalizeValue(query);
    const matchedContributor = contributorDirectory.find((contributor) => normalizeValue(contributor.name) === normalizedQuery || normalizeValue(contributor.username || '') === normalizedQuery || normalizeValue(contributor.slug || '') === normalizedQuery);
    const nextMember = matchedContributor ? { slug: matchedContributor.slug, name: matchedContributor.name, avatar: matchedContributor.image, role: matchedContributor.role || 'Contributor' } : { slug: '', name: query, avatar: '', role: 'Contributor' };
    setFormState((currentState) => {
      const exists = currentState.teamMembers.some((member) => nextMember.slug ? member.slug === nextMember.slug : normalizeValue(member.name) === normalizeValue(nextMember.name));
      if (exists) return currentState;
      return { ...currentState, teamMembers: [...currentState.teamMembers, nextMember] };
    });
  }

  function removeContributor(memberToRemove) {
    setFormState((currentState) => ({
      ...currentState,
      teamMembers: currentState.teamMembers.filter((member) => memberToRemove.slug ? member.slug !== memberToRemove.slug : normalizeValue(member.name) !== normalizeValue(memberToRemove.name)),
    }));
  }

  function applyFormat(field, ref, type) {
    const textarea = ref.current;
    if (!textarea) return;
    const currentValue = formState[field];
    const selectionStart = textarea.selectionStart || 0;
    const selectionEnd = textarea.selectionEnd || 0;
    const selectedText = currentValue.slice(selectionStart, selectionEnd);
    const beforeSelection = currentValue.slice(0, selectionStart);
    const afterSelection = currentValue.slice(selectionEnd);
    let insertValue = selectedText;
    let nextValue = currentValue;
    let nextSelectionStart = selectionStart;
    let nextSelectionEnd = selectionEnd;
    
    if (type === 'bold') {
      insertValue = `**${selectedText || 'bold text'}**`;
      nextValue = `${beforeSelection}${insertValue}${afterSelection}`;
      nextSelectionStart = selectionStart + 2;
      nextSelectionEnd = nextSelectionStart + (selectedText || 'bold text').length;
    }
    if (type === 'italic') {
      insertValue = `*${selectedText || 'italic text'}*`;
      nextValue = `${beforeSelection}${insertValue}${afterSelection}`;
      nextSelectionStart = selectionStart + 1;
      nextSelectionEnd = nextSelectionStart + (selectedText || 'italic text').length;
    }
    if (type === 'list') {
      const sourceText = selectedText || 'List item';
      insertValue = sourceText.split(/\r?\n/).map((line) => {
        const trimmedLine = line.trim();
        return trimmedLine ? `- ${trimmedLine.replace(/^[-*]\s*/, '')}` : '- ';
      }).join('\n');
      nextValue = `${beforeSelection}${insertValue}${afterSelection}`;
      nextSelectionStart = selectionStart;
      nextSelectionEnd = selectionStart + insertValue.length;
    }
    
    updateFormField(field, nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  }

  function handleContinue() {
    if (!selectedImageCount || isRouting) return;
    setIsRouting(true);

    try {
      const nextPendingUpload = persistPendingUpload(selectedFiles);
      if (!nextPendingUpload) throw new Error('No files selected');
      grantUploadDetailsEntry();
      window.setTimeout(() => {
        navigateToHash('/profile/upload/details');
      }, 0);
    } catch {
      clearUploadDetailsEntry();
      clearPendingUpload();
      setValidationMessage('Could not prepare your upload. Please try again.');
      setIsRouting(false);
    }
  }

  function handleUploadDraft() {
    if (!selectedImageCount) return;
    clearUploadDetailsEntry();
    clearPendingUpload();
    onSaveDraft?.(buildSubmission(selectedFiles, formState));
  }

  async function handleDetailsDraft(event) {
    event.preventDefault();
    console.log('Draft button clicked');
    if (!pendingFiles.length) {
      console.log('No pending files, redirecting');
      navigateToHash('/profile/upload');
      return;
    }
    
    setIsSavingDraft(true);
    try {
      console.log('Calling onSaveDraft...');
      await onSaveDraft?.(buildSubmission(pendingFiles, formState));
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handlePublish(event) {
    event.preventDefault();
    console.log('Publish button clicked');
    if (!pendingFiles.length) {
      console.log('No pending files, redirecting');
      navigateToHash('/profile/upload');
      return;
    }

    setIsPublishing(true);
    try {
      console.log('Calling onPublishProject...');
      await onPublishProject?.(buildSubmission(pendingFiles, formState));
    } catch (err) {
      console.error('Publish error in component:', err);
    } finally {
      setIsPublishing(false);
    }
  }

  if (!isDetailsMode) {
    return (
      <section className="upload-shot-page" aria-labelledby="upload-shot-heading">
        <div className="upload-shot-page__inner">
          <div className="upload-shot-page__topbar">
            <a className="upload-shot-page__secondary-button" href={profileHref}>Cancel</a>
            <div className="upload-shot-page__topbar-actions">
              <button className="upload-shot-page__secondary-button" type="button" onClick={handleUploadDraft} disabled={!selectedImageCount}>Save as Draft</button>
              <button className="upload-shot-page__primary-button" type="button" onClick={handleContinue} disabled={!selectedImageCount || isRouting}><span>Continue</span><ArrowRightIcon /></button>
            </div>
          </div>
          <header className="upload-shot-page__hero">
            <h1 className="upload-shot-page__title" id="upload-shot-heading">What have you been working on?</h1>
          </header>
          <input ref={fileInputRef} className="upload-shot-page__input" type="file" accept={acceptedFileList} multiple onChange={(event) => handleFileSelection(event.target.files || [])} />
          <div className={`upload-shot-page__dropzone ${isDragging ? 'upload-shot-page__dropzone--active' : ''}`} role="button" tabIndex={0} onClick={openFilePicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openFilePicker(); } }} onDragEnter={(event) => { handleDragEvent(event); setIsDragging(true); }} onDragOver={handleDragEvent} onDragLeave={(event) => { handleDragEvent(event); setIsDragging(false); }} onDrop={handleDrop} aria-label="Upload project images">
            <div className="upload-shot-page__dropzone-surface">
              {selectedImageCount ? (
                <div className="upload-shot-page__drop-selection">
                  <div className="upload-shot-page__drop-icon-badge" aria-hidden="true"><ImageIcon /></div>
                  <p className="upload-shot-page__drop-title">{selectedImageCount} image{selectedImageCount === 1 ? '' : 's'} selected</p>
                  <button className="upload-shot-page__browse-button" type="button" onClick={(event) => { event.stopPropagation(); openFilePicker(); }}>Browse again</button>
                </div>
              ) : (
                <>
                  <div className="upload-shot-page__drop-icon-badge" aria-hidden="true"><ImageIcon /></div>
                  <p className="upload-shot-page__drop-title">Drag and drop images, or Browse</p>
                  <p className="upload-shot-page__drop-meta">1600x1200 or higher recommended. Max 10MB each.</p>
                </>
              )}
            </div>
          </div>
          {validationMessage ? <p className="upload-shot-page__validation" role="alert">{validationMessage}</p> : null}
          <div className="upload-shot-page__rules" aria-label="Upload rules">{uploadRules.map((rule) => <div key={rule} className="upload-shot-page__rule"><CheckCircleIcon /><span>{rule}</span></div>)}</div>
        </div>
      </section>
    );
  }

  if (!pendingFiles.length) {
    return null;
  }

  return (
    <section className="upload-shot-page upload-shot-page--details" aria-labelledby="upload-details-heading">
      <div className="upload-shot-page__inner upload-shot-page__inner--details">
        <div className="upload-shot-page__topbar upload-shot-page__topbar--details">
          <a className="upload-shot-page__secondary-button" href={profileHref} onClick={() => { clearUploadDetailsEntry(); clearPendingUpload(); }}>Cancel</a>
          <div className="upload-shot-page__topbar-actions">
            <button 
              key="publish-btn"
              className="upload-shot-page__primary-button upload-shot-page__primary-button--publish" 
              type="submit" 
              form="upload-shot-details-form"
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Project'}
            </button>
            <button 
              key="draft-btn"
              className="upload-shot-page__secondary-button" 
              type="button" 
              onClick={handleDetailsDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
        <div className="upload-shot-page__details-shell">
          <header className="upload-shot-page__details-hero"><h1 className="upload-shot-page__details-title" id="upload-details-heading">Project Details</h1></header>
          <form id="upload-shot-details-form" className="upload-shot-page__details-form" onSubmit={handlePublish}>
            <section className="upload-shot-page__details-section">
              <h2 className="upload-shot-page__section-title">Core Details</h2>
              <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Project Title</span><input className="upload-shot-page__text-input" type="text" value={formState.title} onChange={(event) => updateFormField('title', event.target.value)} /></label>
              <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Tagline</span><input className="upload-shot-page__text-input" type="text" value={formState.summary} onChange={(event) => updateFormField('summary', event.target.value)} /></label>
              <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Problem Statement</span><textarea className="upload-shot-page__text-area upload-shot-page__text-area--problem" value={formState.problemText} onChange={(event) => updateFormField('problemText', event.target.value)} /></label>
              <div className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">The Solution</span>
                <div className="upload-shot-page__editor">
                  <div className="upload-shot-page__editor-toolbar">
                    <button className="upload-shot-page__toolbar-button" type="button" aria-label="Bold" onClick={() => applyFormat('solutionText', solutionInputRef, 'bold')}>B</button>
                    <button className="upload-shot-page__toolbar-button upload-shot-page__toolbar-button--italic" type="button" aria-label="Italic" onClick={() => applyFormat('solutionText', solutionInputRef, 'italic')}>I</button>
                    <button className="upload-shot-page__toolbar-button" type="button" aria-label="Bullet list" onClick={() => applyFormat('solutionText', solutionInputRef, 'list')}><ListBulletsIcon /></button>
                  </div>
                  <textarea ref={solutionInputRef} className="upload-shot-page__editor-input" aria-label="Solution" value={formState.solutionText} onChange={(event) => updateFormField('solutionText', event.target.value)} />
                </div>
              </div>
              <div className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">Key Features</span>
                <div className="upload-shot-page__editor">
                  <div className="upload-shot-page__editor-toolbar">
                    <button className="upload-shot-page__toolbar-button" type="button" aria-label="Bold" onClick={() => applyFormat('keyFeaturesText', keyFeaturesInputRef, 'bold')}>B</button>
                    <button className="upload-shot-page__toolbar-button upload-shot-page__toolbar-button--italic" type="button" aria-label="Italic" onClick={() => applyFormat('keyFeaturesText', keyFeaturesInputRef, 'italic')}>I</button>
                    <button className="upload-shot-page__toolbar-button" type="button" aria-label="Bullet list" onClick={() => applyFormat('keyFeaturesText', keyFeaturesInputRef, 'list')}><ListBulletsIcon /></button>
                  </div>
                  <textarea ref={keyFeaturesInputRef} className="upload-shot-page__editor-input" aria-label="Key features" value={formState.keyFeaturesText} onChange={(event) => updateFormField('keyFeaturesText', event.target.value)} />
                </div>
              </div>
            </section>
            <section className="upload-shot-page__details-section">
              <h2 className="upload-shot-page__section-title">Technical Specifications</h2>
              <div className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">Tech Stack</span>
                {formState.techStack.length ? <div className="upload-shot-page__token-row upload-shot-page__token-row--stack">{formState.techStack.map((item) => <span key={item} className="upload-shot-page__token"><span>{item}</span><button className="upload-shot-page__token-remove" type="button" aria-label={`Remove ${item}`} onClick={() => removeToken('techStack', item)}>x</button></span>)}</div> : null}
                <div className="upload-shot-page__input-shell"><SearchIcon /><input className="upload-shot-page__shell-input" type="text" aria-label="Add tech stack" autoComplete="off" value={techStackInput} onChange={(event) => setTechStackInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addToken('techStack', techStackInput); setTechStackInput(''); } }} onBlur={() => { addToken('techStack', techStackInput); setTechStackInput(''); }} /></div>
              </div>
              <div className="upload-shot-page__field-grid upload-shot-page__field-grid--links">
                <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Repository Link</span><div className="upload-shot-page__input-shell"><LinkIcon /><input className="upload-shot-page__shell-input" type="url" autoComplete="off" value={formState.repositoryUrl} onChange={(event) => updateFormField('repositoryUrl', event.target.value)} /></div></label>
                <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Live Demo URL</span><div className="upload-shot-page__input-shell"><ExternalLinkIcon /><input className="upload-shot-page__shell-input" type="url" autoComplete="off" value={formState.liveDemoUrl} onChange={(event) => updateFormField('liveDemoUrl', event.target.value)} /></div></label>
              </div>
            </section>
            <section className="upload-shot-page__details-section">
              <h2 className="upload-shot-page__section-title">Team & Attribution</h2>
              <div className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">Contributors</span>
                {formState.teamMembers.length ? <div className="upload-shot-page__token-row">{formState.teamMembers.map((member) => <span key={member.slug || member.name} className="upload-shot-page__token"><span>{member.name}</span><button className="upload-shot-page__token-remove" type="button" aria-label={`Remove ${member.name}`} onClick={() => removeContributor(member)}>x</button></span>)}</div> : null}
                <div className="upload-shot-page__input-shell"><UsersIcon /><input className="upload-shot-page__shell-input" type="text" aria-label="Add contributors" autoComplete="off" value={contributorInput} onChange={(event) => setContributorInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addContributor(contributorInput); setContributorInput(''); } }} /></div>
                {contributorSuggestions.length ? <div className="upload-shot-page__suggestion-list" aria-label="Contributor suggestions">{contributorSuggestions.map((contributor) => <button key={contributor.slug} className="upload-shot-page__suggestion-button" type="button" onClick={() => { addContributor(contributor.name); setContributorInput(''); }}><span>{contributor.name}</span><span>@{contributor.username || contributor.slug}</span></button>)}</div> : null}
              </div>
              <div className="upload-shot-page__field-grid upload-shot-page__field-grid--meta">
                <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Year</span><input className="upload-shot-page__text-input" type="text" inputMode="numeric" value={formState.year} onChange={(event) => updateFormField('year', event.target.value)} /></label>
                <label className="upload-shot-page__field"><span className="upload-shot-page__field-label">Event</span><input className="upload-shot-page__text-input" type="text" value={formState.event} onChange={(event) => updateFormField('event', event.target.value)} /></label>
              </div>
            </section>
            <section className="upload-shot-page__details-section upload-shot-page__details-section--final">
              <h2 className="upload-shot-page__section-title">Final Touches</h2>
              <div className="upload-shot-page__final-grid">
                <div className="upload-shot-page__thumbnail-column">
                  <span className="upload-shot-page__field-label">Thumbnail preview</span>
                  <div className="upload-shot-page__thumbnail-card">{previewUrl ? <img className="upload-shot-page__thumbnail-image" src={previewUrl} alt={primaryPendingFile?.name || 'Selected project image'} /> : <div className="upload-shot-page__thumbnail-empty">Thumbnail unavailable</div>}</div>
                  <button className="upload-shot-page__thumbnail-action" type="button" onClick={() => { clearUploadDetailsEntry(); clearPendingUpload(); navigateToHash('/profile/upload'); }}>Crop/Select thumbnail</button>
                </div>
                <div className="upload-shot-page__final-settings">
                  <div className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Tags <span className="upload-shot-page__field-helper">(maximum 20)</span></span>
                    {formState.tags.length ? <div className="upload-shot-page__token-row">{formState.tags.map((item) => <span key={item} className="upload-shot-page__token"><span>{item}</span><button className="upload-shot-page__token-remove" type="button" aria-label={`Remove ${item}`} onClick={() => removeToken('tags', item)}>x</button></span>)}</div> : null}
                    <div className="upload-shot-page__input-shell upload-shot-page__input-shell--plain"><input className="upload-shot-page__shell-input" type="text" aria-label="Add tags" autoComplete="off" value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addToken('tags', tagInput, 20); setTagInput(''); } }} onBlur={() => { addToken('tags', tagInput, 20); setTagInput(''); }} /></div>
                    <p className="upload-shot-page__support-copy">Suggested: {suggestedTags.join(', ')}</p>
                  </div>
                  <div className="upload-shot-page__setting-row"><p className="upload-shot-page__setting-title">Looking for feedback</p><button className={`upload-shot-page__toggle ${formState.feedbackRequested ? 'upload-shot-page__toggle--active' : ''}`} type="button" aria-pressed={formState.feedbackRequested} onClick={() => updateFormField('feedbackRequested', !formState.feedbackRequested)}><span className="upload-shot-page__toggle-handle" /></button></div>
                  <div className="upload-shot-page__setting-block"><p className="upload-shot-page__setting-title">Project Status</p><div className="upload-shot-page__radio-group" role="radiogroup" aria-label="Project status">{projectStatusOptions.map((status) => <label key={status} className="upload-shot-page__radio-option"><input type="radio" name="project-status" value={status} checked={formState.status === status} onChange={() => updateFormField('status', status)} /><span>{status}</span></label>)}</div></div>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
    </section>
  );
}

export default UploadShotPage;
