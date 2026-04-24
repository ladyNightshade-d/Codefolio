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
      innovations: buildFeatureList(formState.solutionText),
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
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [contributorInput, setContributorInput] = useState('');
  const [formState, setFormState] = useState(() => createInitialFormState());
  const pendingUpload = isDetailsMode ? readPendingUpload() : null;
  const [isRouting, setIsRouting] = useState(false);

  return <div>Upload Shot Page</div>;
}

export default UploadShotPage;
