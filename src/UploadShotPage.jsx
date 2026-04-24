import { useEffect, useMemo, useRef, useState } from 'react';
import './upload-shot.css';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const acceptedImageTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]);

const uploadRules = [
  'High resolution images (png, jpg, gif)',
  'Animated gifs',
  'Only upload media you own the rights to',
  'Optimized image uploads up to 10MB',
];

function createInitialFormState() {
  return {
    title: '',
    summary: '',
    problemText: '',
    solutionText: '',
    innovationsInput: '',
    techStackInput: '',
    tagsInput: '',
    collectionsInput: '',
    year: String(new Date().getFullYear()),
    event: 'Independent Project',
    repositoryUrl: '',
    liveDemoUrl: '',
    status: 'In Review',
    feedbackRequested: true,
  };
}

function splitCommaList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function ImageIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__drop-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4.5" y="5.5" width="15" height="13" rx="2.5" />
      <path d="m8.5 15 2.6-2.9 2.3 2.2 2.1-2.3 2 3" />
      <circle cx="9.2" cy="9.4" r="1.2" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__rule-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.8 12.2 2.2 2.3 4.4-4.8" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__button-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.5 10h10.2" />
      <path d="m10.8 5.2 4.7 4.8-4.7 4.8" />
    </svg>
  );
}

function buildSubmission(files, formState) {
  return {
    files,
    formData: {
      title: formState.title.trim(),
      summary: formState.summary.trim(),
      techStack: splitCommaList(formState.techStackInput),
      status: formState.status,
      year: formState.year.trim(),
      event: formState.event.trim(),
      problemText: formState.problemText.trim(),
      solutionText: formState.solutionText.trim(),
      innovations: splitCommaList(formState.innovationsInput),
      teamMembers: [],
      repositoryUrl: formState.repositoryUrl.trim(),
      liveDemoUrl: formState.liveDemoUrl.trim(),
      feedbackRequested: formState.feedbackRequested,
      collections: splitCommaList(formState.collectionsInput),
      tags: splitCommaList(formState.tagsInput),
    },
  };
}

function UploadShotPage({ toAppHref, onSaveDraft, onPublishProject }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [formState, setFormState] = useState(() => createInitialFormState());

  const selectedFile = files[0] || null;
  const profileHref = typeof toAppHref === 'function' ? toAppHref('/profile') : '/profile';
  const acceptedFileList = Array.from(acceptedImageTypes).join(',');
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile]
  );

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  function updateFormField(field, value) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileSelection(fileList) {
    const nextFile = Array.from(fileList).find((file) => acceptedImageTypes.has(file.type));

    if (!nextFile) {
      setValidationMessage('Please choose a PNG, JPG, GIF, or WebP image.');
      return;
    }

    if (nextFile.size > MAX_UPLOAD_SIZE) {
      setValidationMessage('Please choose an image smaller than 10MB.');
      return;
    }

    setFiles([nextFile]);
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

  function handleSaveDraft() {
    if (!selectedFile) {
      return;
    }

    onSaveDraft?.(buildSubmission(files, formState));
  }

  function handlePublish(event) {
    event.preventDefault();

    if (!selectedFile) {
      setStep('upload');
      return;
    }

    onPublishProject?.(buildSubmission(files, formState));
  }

  return step === 'upload' ? (
    <section className="upload-shot-page" aria-labelledby="upload-shot-heading">
      <div className="upload-shot-page__inner">
        <div className="upload-shot-page__topbar">
          <a className="upload-shot-page__secondary-button" href={profileHref}>
            Cancel
          </a>

          <div className="upload-shot-page__topbar-actions">
            <button
              className="upload-shot-page__secondary-button"
              type="button"
              onClick={handleSaveDraft}
              disabled={!selectedFile}
            >
              Save as Draft
            </button>

            <button
              className="upload-shot-page__primary-button"
              type="button"
              onClick={() => setStep('details')}
              disabled={!selectedFile}
            >
              <span>Continue</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        <header className="upload-shot-page__hero">
          <h1 className="upload-shot-page__title" id="upload-shot-heading">
            What have you been working on?
          </h1>
          <p className="upload-shot-page__copy">
            Share your latest project, prototype, or exploration.
          </p>
        </header>

        <input
          ref={fileInputRef}
          className="upload-shot-page__input"
          type="file"
          accept={acceptedFileList}
          onChange={(event) => handleFileSelection(event.target.files || [])}
        />

        <div
          className={`upload-shot-page__dropzone ${
            isDragging ? 'upload-shot-page__dropzone--active' : ''
          }`}
          role="button"
          tabIndex={0}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragEnter={(event) => {
            handleDragEvent(event);
            setIsDragging(true);
          }}
          onDragOver={handleDragEvent}
          onDragLeave={(event) => {
            handleDragEvent(event);
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          aria-label="Upload a project image"
        >
          <div className="upload-shot-page__dropzone-surface">
            {selectedFile ? (
              <div className="upload-shot-page__drop-preview">
                <div className="upload-shot-page__drop-preview-frame">
                  <img
                    className="upload-shot-page__drop-preview-image"
                    src={previewUrl}
                    alt={selectedFile.name}
                  />
                </div>

                <div className="upload-shot-page__drop-preview-copy">
                  <p className="upload-shot-page__drop-title">{selectedFile.name}</p>
                  <p className="upload-shot-page__drop-copy">
                    Your shot is ready. Continue to add the project details before publishing.
                  </p>
                  <button
                    className="upload-shot-page__browse-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openFilePicker();
                    }}
                  >
                    Replace image
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="upload-shot-page__drop-icon-badge" aria-hidden="true">
                  <ImageIcon />
                </div>
                <p className="upload-shot-page__drop-title">Drag and drop an image, or Browse</p>
                <p className="upload-shot-page__drop-meta">
                  1600x1200 or higher recommended. Max 10MB.
                </p>
              </>
            )}
          </div>
        </div>

        {validationMessage ? (
          <p className="upload-shot-page__validation" role="alert">
            {validationMessage}
          </p>
        ) : null}

        <div className="upload-shot-page__rules" aria-label="Upload rules">
          {uploadRules.map((rule) => (
            <div key={rule} className="upload-shot-page__rule">
              <CheckCircleIcon />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : (
    <section className="upload-shot-page upload-shot-page--details" aria-labelledby="upload-details-heading">
      <div className="upload-shot-page__inner upload-shot-page__inner--details">
        <div className="upload-shot-page__topbar upload-shot-page__topbar--details">
          <button
            className="upload-shot-page__secondary-button"
            type="button"
            onClick={() => setStep('upload')}
          >
            Back
          </button>

          <div className="upload-shot-page__topbar-actions">
            <button className="upload-shot-page__secondary-button" type="button" onClick={handleSaveDraft}>
              Save as Draft
            </button>

            <button
              className="upload-shot-page__primary-button upload-shot-page__primary-button--publish"
              type="submit"
              form="upload-shot-details-form"
            >
              <span>Publish Shot</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        <div className="upload-shot-page__details-shell">
          <header className="upload-shot-page__details-hero">
            <h1 className="upload-shot-page__details-title" id="upload-details-heading">
              Add the story behind the shot
            </h1>
            <p className="upload-shot-page__copy">
              Help people understand what you built, why it matters, and where they can explore it.
            </p>
          </header>

          <form id="upload-shot-details-form" className="upload-shot-page__details-form" onSubmit={handlePublish}>
            <section className="upload-shot-page__details-section">
              <div>
                <h2 className="upload-shot-page__section-title">Project basics</h2>
                <p className="upload-shot-page__support-copy">
                  Start with the essentials people need to recognize the work quickly.
                </p>
              </div>

              <label className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">Project title</span>
                <input
                  className="upload-shot-page__text-input"
                  type="text"
                  value={formState.title}
                  onChange={(event) => updateFormField('title', event.target.value)}
                  placeholder="Community Loop"
                />
              </label>

              <label className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">
                  Short summary
                  <span className="upload-shot-page__field-helper"> What should people remember?</span>
                </span>
                <textarea
                  className="upload-shot-page__text-area upload-shot-page__text-area--medium"
                  value={formState.summary}
                  onChange={(event) => updateFormField('summary', event.target.value)}
                  placeholder="A collaboration hub for student builders to publish progress, recruit teammates, and collect feedback."
                />
              </label>

              <div className="upload-shot-page__field-grid">
                <label className="upload-shot-page__field">
                  <span className="upload-shot-page__field-label">Tech stack</span>
                  <input
                    className="upload-shot-page__text-input"
                    type="text"
                    value={formState.techStackInput}
                    onChange={(event) => updateFormField('techStackInput', event.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </label>

                <label className="upload-shot-page__field">
                  <span className="upload-shot-page__field-label">Tags</span>
                  <input
                    className="upload-shot-page__text-input"
                    type="text"
                    value={formState.tagsInput}
                    onChange={(event) => updateFormField('tagsInput', event.target.value)}
                    placeholder="Community, Portfolio, Collaboration"
                  />
                </label>
              </div>
            </section>

            <section className="upload-shot-page__details-section">
              <div>
                <h2 className="upload-shot-page__section-title">Project story</h2>
                <p className="upload-shot-page__support-copy">
                  A little context goes a long way when someone is deciding whether to explore your work.
                </p>
              </div>

              <label className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">The problem</span>
                <textarea
                  className="upload-shot-page__text-area"
                  value={formState.problemText}
                  onChange={(event) => updateFormField('problemText', event.target.value)}
                  placeholder="What challenge were you solving? Use multiple paragraphs if needed."
                />
              </label>

              <label className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">The solution</span>
                <textarea
                  className="upload-shot-page__text-area"
                  value={formState.solutionText}
                  onChange={(event) => updateFormField('solutionText', event.target.value)}
                  placeholder="What did you build, and how did it help?"
                />
              </label>

              <label className="upload-shot-page__field">
                <span className="upload-shot-page__field-label">Key innovations</span>
                <input
                  className="upload-shot-page__text-input"
                  type="text"
                  value={formState.innovationsInput}
                  onChange={(event) => updateFormField('innovationsInput', event.target.value)}
                  placeholder="Realtime search, contributor matching, feedback routing"
                />
              </label>
            </section>

            <section className="upload-shot-page__details-section upload-shot-page__details-section--final">
              <div>
                <h2 className="upload-shot-page__section-title">Preview and publish settings</h2>
                <p className="upload-shot-page__support-copy">
                  Finish the metadata so your shot lands in the right context once it goes live.
                </p>
              </div>

              <div className="upload-shot-page__final-grid">
                <div className="upload-shot-page__thumbnail-column">
                  <div className="upload-shot-page__thumbnail-card">
                    {selectedFile ? (
                      <img
                        className="upload-shot-page__thumbnail-image"
                        src={previewUrl}
                        alt={selectedFile.name}
                      />
                    ) : (
                      <div className="upload-shot-page__thumbnail-empty">Add a preview image</div>
                    )}
                  </div>

                  <button className="upload-shot-page__thumbnail-action" type="button" onClick={openFilePicker}>
                    Replace image
                  </button>
                </div>

                <div className="upload-shot-page__final-settings">
                  <div className="upload-shot-page__field-grid">
                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Collection names</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        value={formState.collectionsInput}
                        onChange={(event) => updateFormField('collectionsInput', event.target.value)}
                        placeholder="Portfolio Highlights, RCA Product Studio"
                      />
                    </label>

                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Year or cohort</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        value={formState.year}
                        onChange={(event) => updateFormField('year', event.target.value)}
                        placeholder="2026"
                      />
                    </label>

                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Course or event</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        value={formState.event}
                        onChange={(event) => updateFormField('event', event.target.value)}
                        placeholder="RCA Product Studio"
                      />
                    </label>

                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Repository URL</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="url"
                        value={formState.repositoryUrl}
                        onChange={(event) => updateFormField('repositoryUrl', event.target.value)}
                        placeholder="https://github.com/your-project"
                      />
                    </label>

                    <label className="upload-shot-page__field upload-shot-page__field--grow">
                      <span className="upload-shot-page__field-label">Live demo URL</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="url"
                        value={formState.liveDemoUrl}
                        onChange={(event) => updateFormField('liveDemoUrl', event.target.value)}
                        placeholder="https://your-project.app"
                      />
                    </label>
                  </div>

                  <div className="upload-shot-page__setting-row">
                    <div>
                      <p className="upload-shot-page__setting-title">Request feedback</p>
                      <p className="upload-shot-page__support-copy">
                        Let other builders know this project is open for critique and review.
                      </p>
                    </div>

                    <button
                      className={`upload-shot-page__toggle ${
                        formState.feedbackRequested ? 'upload-shot-page__toggle--active' : ''
                      }`}
                      type="button"
                      aria-pressed={formState.feedbackRequested}
                      onClick={() =>
                        updateFormField('feedbackRequested', !formState.feedbackRequested)
                      }
                    >
                      <span className="upload-shot-page__toggle-handle" />
                    </button>
                  </div>

                  <div className="upload-shot-page__setting-block">
                    <p className="upload-shot-page__setting-title">Project status</p>
                    <div className="upload-shot-page__radio-group" role="radiogroup" aria-label="Project status">
                      {['In Review', 'Live', 'Completed'].map((status) => (
                        <label key={status} className="upload-shot-page__radio-option">
                          <input
                            type="radio"
                            name="project-status"
                            checked={formState.status === status}
                            onChange={() => updateFormField('status', status)}
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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
