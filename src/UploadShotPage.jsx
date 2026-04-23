import { useEffect, useRef, useState } from 'react';
import './upload-shot.css';

function ImageUploadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__drop-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m7.5 16 3.2-3.3 2.4 2.4 2.9-3 2.5 3.9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__button-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
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
      <path d="m8.8 12.2 2.1 2.2 4.4-4.9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__field-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__field-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.5 13.5 13.5 10.5" />
      <path d="M8.7 15.3 7.3 16.7a3 3 0 1 1-4.2-4.2l3.3-3.3a3 3 0 0 1 4.2 0" />
      <path d="m15.3 8.7 1.4-1.4a3 3 0 0 1 4.2 4.2l-3.3 3.3a3 3 0 0 1-4.2 0" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__field-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__field-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="9" r="3" />
      <path d="M4 18.2c.7-2.5 2.8-4.2 5-4.2s4.3 1.7 5 4.2" />
      <path d="M16.5 8.2c1.7.2 2.9 1.1 3.5 2.8" />
      <path d="M16.2 14.5c1.7.2 3.2 1.4 3.8 3.3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      aria-hidden="true"
      className="upload-shot-page__toolbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 7h11" />
      <path d="M9 12h11" />
      <path d="M9 17h11" />
      <circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const suggestedTags = ['Climate', 'Environment', 'Wastes'];
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function normalizeToken(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function createTeamMember(name = '') {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    role: '',
    avatar: '',
  };
}

function UploadShotPage({ toAppHref }) {
  const inputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewItems, setPreviewItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [techStackInput, setTechStackInput] = useState('');
  const [innovationInput, setInnovationInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    problemStatement: '',
    solution: '',
    contributors: '',
    repositoryLink: '',
    liveDemoUrl: '',
    year: '',
    event: '',
    techStack: [],
    innovations: [],
    teamMembers: [],
    tags: [],
    feedbackRequested: false,
    status: 'active',
  });

  useEffect(() => {
    const nextPreviewItems = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPreviewItems(nextPreviewItems);

    return () => {
      nextPreviewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [selectedFiles]);

  function appendFiles(fileList) {
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      return;
    }

    setSelectedFiles((currentFiles) => {
      const availableSlots = Math.max(0, 10 - currentFiles.length);

      if (!availableSlots) {
        return currentFiles;
      }

      return [...currentFiles, ...imageFiles.slice(0, availableSlots)];
    });
  }

  function handleInputChange(event) {
    appendFiles(event.target.files);
    event.target.value = '';
  }

  function handleBrowseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    inputRef.current?.click();
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    appendFiles(event.dataTransfer.files);
  }

  function handleDropzoneKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  function handleContinue() {
    if (!selectedFiles.length) {
      inputRef.current?.click();
      return;
    }

    setCurrentStep('details');
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleToggleFeedback() {
    setFormData((currentData) => ({
      ...currentData,
      feedbackRequested: !currentData.feedbackRequested,
    }));
  }

  function addTechStackItem() {
    const nextValue = normalizeToken(techStackInput.replace(/,+$/, ''));

    if (!nextValue) {
      return;
    }

    setFormData((currentData) => {
      if (
        currentData.techStack.some(
          (item) => item.toLowerCase() === nextValue.toLowerCase()
        )
      ) {
        return currentData;
      }

      return {
        ...currentData,
        techStack: [...currentData.techStack, nextValue],
      };
    });
    setTechStackInput('');
  }

  function addTagItem() {
    const nextValue = normalizeToken(tagInput.replace(/,+$/, ''));

    if (!nextValue) {
      return;
    }

    setFormData((currentData) => {
      if (
        currentData.tags.length >= 20 ||
        currentData.tags.some((item) => item.toLowerCase() === nextValue.toLowerCase())
      ) {
        return currentData;
      }

      return {
        ...currentData,
        tags: [...currentData.tags, nextValue],
      };
    });
    setTagInput('');
  }

  function addInnovationItem() {
    const nextValue = normalizeToken(innovationInput.replace(/,+$/, ''));

    if (!nextValue) {
      return;
    }

    setFormData((currentData) => {
      if (
        currentData.innovations.some((item) => item.toLowerCase() === nextValue.toLowerCase())
      ) {
        return currentData;
      }

      return {
        ...currentData,
        innovations: [...currentData.innovations, nextValue],
      };
    });
    setInnovationInput('');
  }

  function addContributorMember() {
    const nextValue = normalizeToken(formData.contributors.replace(/,+$/, ''));

    if (!nextValue) {
      return;
    }

    setFormData((currentData) => {
      if (
        currentData.teamMembers.some((member) => member.name.toLowerCase() === nextValue.toLowerCase())
      ) {
        return {
          ...currentData,
          contributors: '',
        };
      }

      return {
        ...currentData,
        contributors: '',
        teamMembers: [...currentData.teamMembers, createTeamMember(nextValue)],
      };
    });
  }

  function handleTechStackKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTechStackItem();
    }
  }

  function handleInnovationKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addInnovationItem();
    }
  }

  function handleTagKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTagItem();
    }
  }

  function handleContributorKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addContributorMember();
    }
  }

  function removeTechStackItem(itemToRemove) {
    setFormData((currentData) => ({
      ...currentData,
      techStack: currentData.techStack.filter((item) => item !== itemToRemove),
    }));
  }

  function removeInnovationItem(itemToRemove) {
    setFormData((currentData) => ({
      ...currentData,
      innovations: currentData.innovations.filter((item) => item !== itemToRemove),
    }));
  }

  function removeTagItem(itemToRemove) {
    setFormData((currentData) => ({
      ...currentData,
      tags: currentData.tags.filter((item) => item !== itemToRemove),
    }));
  }

  function updateTeamMemberField(memberId, fieldName, value) {
    setFormData((currentData) => ({
      ...currentData,
      teamMembers: currentData.teamMembers.map((member) =>
        member.id === memberId ? { ...member, [fieldName]: value } : member
      ),
    }));
  }

  function removeTeamMember(memberId) {
    setFormData((currentData) => ({
      ...currentData,
      teamMembers: currentData.teamMembers.filter((member) => member.id !== memberId),
    }));
  }

  const selectedImageCount = selectedFiles.length;
  const thumbnailPreview = previewItems[0] || null;

  return (
    <section
      className={`upload-shot-page ${
        currentStep === 'details' ? 'upload-shot-page--details' : ''
      }`}
      aria-labelledby={currentStep === 'details' ? 'project-details-heading' : 'upload-shot-heading'}
    >
      <div
        className={`upload-shot-page__inner ${
          currentStep === 'details' ? 'upload-shot-page__inner--details' : ''
        }`}
      >
        <input
          ref={inputRef}
          className="upload-shot-page__input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
        />

        {currentStep === 'details' ? (
          <>
            <div className="upload-shot-page__topbar upload-shot-page__topbar--details">
              <a className="upload-shot-page__secondary-button" href={toAppHref('/profile')}>
                Cancel
              </a>

              <div className="upload-shot-page__topbar-actions">
                <button
                  className="upload-shot-page__secondary-button upload-shot-page__secondary-button--soft"
                  type="button"
                >
                  Save as draft
                </button>
                <button
                  className="upload-shot-page__primary-button upload-shot-page__primary-button--publish"
                  type="button"
                >
                  Publish Project
                </button>
              </div>
            </div>

            <div className="upload-shot-page__details-shell">
              <header className="upload-shot-page__details-hero">
                <h1 className="upload-shot-page__details-title" id="project-details-heading">
                  Project Details
                </h1>
              </header>

              <form className="upload-shot-page__details-form" onSubmit={(event) => event.preventDefault()}>
                <section className="upload-shot-page__details-section">
                  <h2 className="upload-shot-page__section-title">Core Details</h2>

                  <label className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Project Title</span>
                    <input
                      className="upload-shot-page__text-input"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFieldChange}
                      placeholder="e.g. Acme Financial Dashboard"
                    />
                  </label>

                  <label className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Tagline</span>
                    <input
                      className="upload-shot-page__text-input"
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleFieldChange}
                      placeholder="A one-sentence summary of what this is."
                    />
                  </label>

                  <label className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Problem Statement</span>
                    <textarea
                      className="upload-shot-page__text-area upload-shot-page__text-area--medium"
                      name="problemStatement"
                      value={formData.problemStatement}
                      onChange={handleFieldChange}
                      placeholder="What specific problem does this project solve?"
                    />
                  </label>

                  <label className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Solution / Key Features</span>
                    <div className="upload-shot-page__editor">
                      <div className="upload-shot-page__editor-toolbar" aria-hidden="true">
                        <button className="upload-shot-page__toolbar-button" type="button">
                          <strong>B</strong>
                        </button>
                        <button className="upload-shot-page__toolbar-button" type="button">
                          <em>I</em>
                        </button>
                        <button className="upload-shot-page__toolbar-button" type="button">
                          <ListIcon />
                        </button>
                      </div>
                      <textarea
                        className="upload-shot-page__editor-input"
                        name="solution"
                        value={formData.solution}
                        onChange={handleFieldChange}
                        placeholder="Detail your solution and its key features here..."
                      />
                    </div>
                  </label>

                  <div className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Key Innovations</span>

                    {formData.innovations.length ? (
                      <div className="upload-shot-page__token-row">
                        {formData.innovations.map((item) => (
                          <span key={item} className="upload-shot-page__token">
                            <span>{item}</span>
                            <button
                              className="upload-shot-page__token-remove"
                              type="button"
                              aria-label={`Remove ${item}`}
                              onClick={() => removeInnovationItem(item)}
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        value={innovationInput}
                        onChange={(event) => setInnovationInput(event.target.value)}
                        onKeyDown={handleInnovationKeyDown}
                        onBlur={addInnovationItem}
                        placeholder="Add one innovation at a time..."
                      />
                    </div>
                  </div>
                </section>

                <section className="upload-shot-page__details-section">
                  <h2 className="upload-shot-page__section-title">Technical Specifications</h2>

                  <div className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Tech Stack</span>

                    {formData.techStack.length ? (
                      <div className="upload-shot-page__token-row">
                        {formData.techStack.map((item) => (
                          <span key={item} className="upload-shot-page__token">
                            <span>{item}</span>
                            <button
                              className="upload-shot-page__token-remove"
                              type="button"
                              aria-label={`Remove ${item}`}
                              onClick={() => removeTechStackItem(item)}
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="upload-shot-page__input-shell">
                      <SearchIcon />
                      <input
                        className="upload-shot-page__shell-input"
                        type="text"
                        value={techStackInput}
                        onChange={(event) => setTechStackInput(event.target.value)}
                        onKeyDown={handleTechStackKeyDown}
                        onBlur={addTechStackItem}
                        placeholder="Search or type to add technology..."
                      />
                    </div>
                  </div>

                  <div className="upload-shot-page__field-grid">
                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Repository Link</span>
                      <div className="upload-shot-page__input-shell">
                        <LinkIcon />
                        <input
                          className="upload-shot-page__shell-input"
                          type="url"
                          name="repositoryLink"
                          value={formData.repositoryLink}
                          onChange={handleFieldChange}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </label>

                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Live Demo URL</span>
                      <div className="upload-shot-page__input-shell">
                        <ExternalLinkIcon />
                        <input
                          className="upload-shot-page__shell-input"
                          type="url"
                          name="liveDemoUrl"
                          value={formData.liveDemoUrl}
                          onChange={handleFieldChange}
                          placeholder="https://..."
                        />
                      </div>
                    </label>
                  </div>
                </section>

                <section className="upload-shot-page__details-section">
                  <h2 className="upload-shot-page__section-title">Team & Attribution</h2>

                  <label className="upload-shot-page__field">
                    <span className="upload-shot-page__field-label">Contributors</span>
                    <div className="upload-shot-page__input-shell">
                      <UsersIcon />
                      <input
                        className="upload-shot-page__shell-input"
                        type="text"
                        name="contributors"
                        value={formData.contributors}
                        onChange={handleFieldChange}
                        onKeyDown={handleContributorKeyDown}
                        onBlur={addContributorMember}
                        placeholder="Search by name or username..."
                      />
                    </div>
                    <p className="upload-shot-page__support-copy">
                      Add a contributor, then fill in their role and avatar below.
                    </p>
                  </label>

                  {formData.teamMembers.length ? (
                    <div className="upload-shot-page__team-list">
                      {formData.teamMembers.map((member, index) => (
                        <article key={member.id} className="upload-shot-page__team-card">
                          <div className="upload-shot-page__team-card-header">
                            <div>
                              <h3 className="upload-shot-page__team-card-title">
                                Contributor {index + 1}
                              </h3>
                            </div>

                            <button
                              className="upload-shot-page__small-button upload-shot-page__small-button--danger"
                              type="button"
                              onClick={() => removeTeamMember(member.id)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="upload-shot-page__team-card-body">
                            <div className="upload-shot-page__field-grid upload-shot-page__field-grid--team">
                              <label className="upload-shot-page__field">
                                <span className="upload-shot-page__field-label">Name</span>
                                <input
                                  className="upload-shot-page__text-input"
                                  type="text"
                                  value={member.name}
                                  onChange={(event) =>
                                    updateTeamMemberField(member.id, 'name', event.target.value)
                                  }
                                  placeholder="Contributor name"
                                />
                              </label>

                              <label className="upload-shot-page__field">
                                <span className="upload-shot-page__field-label">Role</span>
                                <input
                                  className="upload-shot-page__text-input"
                                  type="text"
                                  value={member.role}
                                  onChange={(event) =>
                                    updateTeamMemberField(member.id, 'role', event.target.value)
                                  }
                                  placeholder="e.g. Frontend Engineer"
                                />
                              </label>
                            </div>

                            <div className="upload-shot-page__team-avatar-row">
                              <label className="upload-shot-page__field upload-shot-page__field--grow">
                                <span className="upload-shot-page__field-label">Avatar URL</span>
                                <div className="upload-shot-page__input-shell upload-shot-page__input-shell--plain">
                                  <input
                                    className="upload-shot-page__shell-input"
                                    type="url"
                                    value={member.avatar}
                                    onChange={(event) =>
                                      updateTeamMemberField(member.id, 'avatar', event.target.value)
                                    }
                                    placeholder="https://..."
                                  />
                                </div>
                              </label>

                              <div className="upload-shot-page__avatar-preview">
                                {member.avatar ? (
                                  <img
                                    className="upload-shot-page__avatar-preview-image"
                                    src={member.avatar}
                                    alt={member.name || 'Contributor avatar preview'}
                                  />
                                ) : (
                                  <div className="upload-shot-page__avatar-preview-empty">No avatar</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}

                  <div className="upload-shot-page__field-grid">
                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Year</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleFieldChange}
                        placeholder="e.g. 2023"
                      />
                    </label>

                    <label className="upload-shot-page__field">
                      <span className="upload-shot-page__field-label">Event</span>
                      <input
                        className="upload-shot-page__text-input"
                        type="text"
                        name="event"
                        value={formData.event}
                        onChange={handleFieldChange}
                        placeholder="e.g. RCA Hackathon"
                      />
                    </label>
                  </div>
                </section>

                <section className="upload-shot-page__details-section upload-shot-page__details-section--final">
                  <h2 className="upload-shot-page__section-title">Final Touches</h2>

                  <div className="upload-shot-page__final-grid">
                    <div className="upload-shot-page__thumbnail-column">
                      <span className="upload-shot-page__field-label">Thumbnail preview</span>

                      <div className="upload-shot-page__thumbnail-card">
                        {thumbnailPreview ? (
                          <img
                            className="upload-shot-page__thumbnail-image"
                            src={thumbnailPreview.url}
                            alt={thumbnailPreview.name}
                          />
                        ) : (
                          <div className="upload-shot-page__thumbnail-empty">No image selected</div>
                        )}
                      </div>

                      <button
                        className="upload-shot-page__thumbnail-action"
                        type="button"
                        onClick={() => inputRef.current?.click()}
                      >
                        Crop/Select thumbnail
                      </button>
                    </div>

                    <div className="upload-shot-page__final-settings">
                      <div className="upload-shot-page__field">
                        <span className="upload-shot-page__field-label">
                          Tags <span className="upload-shot-page__field-helper">(maximum 20)</span>
                        </span>

                        {formData.tags.length ? (
                          <div className="upload-shot-page__token-row">
                            {formData.tags.map((item) => (
                              <span key={item} className="upload-shot-page__token">
                                <span>{item}</span>
                                <button
                                  className="upload-shot-page__token-remove"
                                  type="button"
                                  aria-label={`Remove ${item}`}
                                  onClick={() => removeTagItem(item)}
                                >
                                  x
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="upload-shot-page__input-shell upload-shot-page__input-shell--plain">
                          <input
                            className="upload-shot-page__shell-input"
                            type="text"
                            value={tagInput}
                            onChange={(event) => setTagInput(event.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={addTagItem}
                            placeholder="Add tags like FinTech, EdTech, etc..."
                          />
                        </div>

                        <p className="upload-shot-page__support-copy">
                          Suggested: {suggestedTags.join(', ')}
                        </p>
                      </div>

                      <div className="upload-shot-page__setting-row">
                        <div>
                          <h3 className="upload-shot-page__setting-title">Looking for feedback</h3>
                        </div>

                        <button
                          className={`upload-shot-page__toggle ${
                            formData.feedbackRequested ? 'upload-shot-page__toggle--active' : ''
                          }`}
                          type="button"
                          role="switch"
                          aria-checked={formData.feedbackRequested}
                          onClick={handleToggleFeedback}
                        >
                          <span className="upload-shot-page__toggle-handle" />
                        </button>
                      </div>

                      <div className="upload-shot-page__setting-block">
                        <h3 className="upload-shot-page__setting-title">Project Status</h3>

                        <div className="upload-shot-page__radio-group" role="radiogroup" aria-label="Project status">
                          {statusOptions.map((option) => (
                            <label key={option.value} className="upload-shot-page__radio-option">
                              <input
                                type="radio"
                                name="status"
                                value={option.value}
                                checked={formData.status === option.value}
                                onChange={handleFieldChange}
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </section>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="upload-shot-page__topbar">
              <a className="upload-shot-page__secondary-button" href={toAppHref('/profile')}>
                Cancel
              </a>

              <div className="upload-shot-page__topbar-actions">
                <button
                  className="upload-shot-page__secondary-button"
                  type="button"
                  disabled={!selectedFiles.length}
                >
                  Save as Draft
                </button>

                <button
                  className="upload-shot-page__primary-button"
                  type="button"
                  onClick={handleContinue}
                >
                  <span>Continue</span>
                  <ArrowRightIcon />
                </button>
              </div>
            </div>

            <div className="upload-shot-page__hero">
              <h1 className="upload-shot-page__title" id="upload-shot-heading">
                What have you been working on?
              </h1>
              <p className="upload-shot-page__copy">
                Share your latest project, prototype, or exploration.
              </p>
            </div>

            <div
              className={`upload-shot-page__dropzone ${
                isDragging ? 'upload-shot-page__dropzone--active' : ''
              }`}
              role="button"
              tabIndex={0}
              aria-label="Upload images"
              onClick={() => inputRef.current?.click()}
              onKeyDown={handleDropzoneKeyDown}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-shot-page__dropzone-surface">
                <div className="upload-shot-page__drop-icon-badge" aria-hidden="true">
                  <ImageUploadIcon />
                </div>

                <h2 className="upload-shot-page__drop-title">
                  Drag and drop images, or{' '}
                  <button className="upload-shot-page__browse-button" type="button" onClick={handleBrowseClick}>
                    Browse
                  </button>
                </h2>

                <p className="upload-shot-page__drop-copy">
                  Upload multiple images. The first image becomes your cover, and the rest go into the gallery.
                </p>

                <p className="upload-shot-page__drop-meta">
                  1600x1200 or higher recommended. Up to 10 images.
                </p>

                {selectedImageCount ? (
                  <p className="upload-shot-page__selection-count" aria-live="polite">
                    Currently {selectedImageCount} image{selectedImageCount === 1 ? '' : 's'} selected.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="upload-shot-page__rules" aria-label="Upload rules">
              <div className="upload-shot-page__rule">
                <CheckCircleIcon />
                <span>High resolution images (png, jpg, webp, gif)</span>
              </div>
              <div className="upload-shot-page__rule">
                <CheckCircleIcon />
                <span>Multiple image uploads with one cover and gallery support</span>
              </div>
              <div className="upload-shot-page__rule">
                <CheckCircleIcon />
                <span>Drag, drop, or browse from your device</span>
              </div>
              <div className="upload-shot-page__rule">
                <CheckCircleIcon />
                <span>Only upload media you own the rights to</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default UploadShotPage;
