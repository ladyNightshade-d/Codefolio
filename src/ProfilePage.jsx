import { useEffect, useMemo, useRef, useState } from 'react';
import './profile.css';

const profileTabs = [
  { id: 'work', label: 'Work' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'recent', label: 'Recent' },
  { id: 'collections', label: 'Collections' },
];

function LocationPinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__location-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 20c-3.3-3.7-5-6.5-5-9.1a5 5 0 1 1 10 0c0 2.6-1.7 5.4-5 9.1Z" />
      <circle cx="12" cy="11" r="1.9" />
    </svg>
  );
}

function MoreDotsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__more-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6.5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="17.5" cy="12" r="1.6" />
    </svg>
  );
}

function VerticalDotsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__project-menu-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="5.5" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="18.5" r="1.7" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__upload-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7.2 18.1h8.9a3.5 3.5 0 0 0 .5-7 4.8 4.8 0 0 0-9.4-1.2A4.1 4.1 0 0 0 7.2 18Z" />
      <path d="M12 15.8V9.4" />
      <path d="m9.5 11.8 2.5-2.6 2.5 2.6" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__stat-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 4.8h12v7.1H9.7L6 15V11.9H4z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__stat-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 16.1c-4-2.4-6.4-4.7-6.4-7.5A3.6 3.6 0 0 1 7.2 5c1.2 0 2.1.5 2.8 1.3C10.7 5.5 11.6 5 12.8 5a3.6 3.6 0 0 1 3.6 3.6c0 2.8-2.4 5.1-6.4 7.5Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__stat-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m10 2.8 2 4 4.4.6-3.2 3.1.8 4.4-4-2.1-4 2.1.8-4.4-3.2-3.1 4.4-.6z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__inline-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 4h8v8" />
      <path d="m16 4-9 9" />
      <path d="M12 10v5H4V7h5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__add-project-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 4.5v11" />
      <path d="M4.5 10h11" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="profile-page__trash-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function formatCompactCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  return `${value}`;
}

function formatDateLabel(value) {
  if (!value) {
    return 'Recently updated';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Recently updated';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

function getProjectStatusLabel(project) {
  return project.visibility === 'draft' ? 'Draft' : project.status;
}

function getProjectLikeCount(project) {
  if (Number.isFinite(project.appreciationCount)) {
    return project.appreciationCount;
  }

  return Math.max(0, Math.round((project.reviewAverage || 0) * 5));
}

function buildCollections(projects) {
  const collectionMap = new Map();

  projects.forEach((project) => {
    (project.collections || []).forEach((collectionName) => {
      if (!collectionMap.has(collectionName)) {
        collectionMap.set(collectionName, []);
      }

      collectionMap.get(collectionName).push(project);
    });
  });

  return Array.from(collectionMap.entries())
    .map(([name, items]) => ({
      name,
      items,
    }))
    .sort((firstCollection, secondCollection) => secondCollection.items.length - firstCollection.items.length);
}

function sortProjects(items, sortMode = 'recent') {
  const sortedItems = [...items];

  if (sortMode === 'reviews') {
    sortedItems.sort((firstProject, secondProject) => {
      const ratingDifference = (secondProject.reviewAverage || 0) - (firstProject.reviewAverage || 0);

      if (ratingDifference !== 0) {
        return ratingDifference;
      }

      return (secondProject.reviewCount || 0) - (firstProject.reviewCount || 0);
    });

    return sortedItems;
  }

  if (sortMode === 'liked') {
    sortedItems.sort((firstProject, secondProject) => {
      const likeDifference = getProjectLikeCount(secondProject) - getProjectLikeCount(firstProject);

      if (likeDifference !== 0) {
        return likeDifference;
      }

      return Date.parse(secondProject.updatedAt || '') - Date.parse(firstProject.updatedAt || '');
    });

    return sortedItems;
  }

  sortedItems.sort(
    (firstProject, secondProject) =>
      Date.parse(secondProject.updatedAt || '') - Date.parse(firstProject.updatedAt || '')
  );

  return sortedItems;
}

function ProfilePage({
  toAppHref,
  profile,
  projects = [],
  collections = [],
  activeTab = 'work',
  onTabChange,
  onDeleteProject,
  onEditProject,
  onCreateCollection,
  onDeleteCollection,
  onEditCollection,
  onViewCollection,
}) {
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openProjectMenuSlug, setOpenProjectMenuSlug] = useState(null);
  const [openCollectionMenuId, setOpenCollectionMenuId] = useState(null);
  const resolveHref = typeof toAppHref === 'function' ? toAppHref : (path) => path;
  const profileName = profile?.name || 'Codefolio User';
  const profileLocation = profile?.location || 'Location not set';
  const profileRole = profile?.role || 'Product Builder';
  const profileHeadline = profile?.headline || 'Building thoughtful digital products with clean execution.';
  const profileBio =
    profile?.bio ||
    'Share your background, your strengths, and the kind of work you want collaborators to remember.';
  const profileSkills = profile?.skills?.filter(Boolean) || [];
  const profileEducation = profile?.education?.filter(Boolean) || [];
  const profileWebsite = profile?.contact?.website || '';
  const profileEmail = profile?.contact?.email || profile?.accountEmail || '';

  useEffect(() => {
    function handlePointerDown(event) {
      const eventTarget = event.target instanceof Element ? event.target : null;
      const isInsideProfileMenu = menuRef.current?.contains(event.target);
      const isInsideProjectMenu = eventTarget?.closest('.profile-page__project-menu');

      if (!isInsideProfileMenu) {
        setIsMenuOpen(false);
      }

      if (!isInsideProjectMenu) {
        setOpenProjectMenuSlug(null);
        setOpenCollectionMenuId(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setOpenProjectMenuSlug(null);
        setOpenCollectionMenuId(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const publishedProjects = useMemo(
    () => sortProjects(projects.filter((project) => project.visibility !== 'draft')),
    [projects]
  );
  const recentProjects = useMemo(() => sortProjects(publishedProjects), [publishedProjects]);
  const draftProjects = useMemo(
    () => sortProjects(projects.filter((project) => project.visibility === 'draft')),
    [projects]
  );
  const reviewedProjects = useMemo(
    () =>
      sortProjects(
        projects.filter(
          (project) =>
            project.visibility !== 'draft' &&
            Number.isFinite(project.reviewAverage) &&
            project.reviewAverage > 0 &&
            Number.isFinite(project.reviewCount) &&
            project.reviewCount > 0
        ),
        'reviews'
      ),
    [projects]
  );

  function renderEmptyState({
    title,
    copy,
    buttonLabel = 'Upload your first shot',
    buttonHref = '/profile/upload',
    onButtonClick = null,
  }) {
    return (
      <section className={`profile-page__empty-state ${onButtonClick ? 'profile-page__empty-state--small' : ''}`} aria-labelledby="profile-empty-title">
        <div className="profile-page__upload-badge" aria-hidden="true">
          <UploadCloudIcon />
        </div>

        <h2 className="profile-page__empty-title" id="profile-empty-title">
          {title}
        </h2>

        <p className="profile-page__empty-copy">{copy}</p>

        {onButtonClick ? (
          <button className="profile-page__upload-button" type="button" onClick={onButtonClick}>
            {buttonLabel}
          </button>
        ) : (
          <a className="profile-page__upload-button" href={resolveHref(buttonHref)}>
            {buttonLabel}
          </a>
        )}
      </section>
    );
  }

  function renderProjectGrid(items, mode = 'project') {
    return (
      <section className="profile-page__projects-section" aria-label="Projects">
        <div className="profile-page__projects-actions">
          <a
            className="profile-page__add-project-button"
            href={resolveHref('/profile/upload')}
            aria-label="Add more projects"
            title="Add more projects"
          >
            <PlusIcon />
          </a>
        </div>

        <div className="profile-page__shots-grid profile-page__shots-grid--projects">
          {items.map((project) => (
          <article key={project.slug} className="profile-page__shot-card profile-page__shot-card--project">
            <div className="profile-page__project-menu">
              <button
                className="profile-page__project-menu-button"
                type="button"
                aria-label={`Open actions for ${project.title}`}
                aria-expanded={openProjectMenuSlug === project.slug}
                aria-haspopup="menu"
                onClick={() =>
                  setOpenProjectMenuSlug((currentSlug) =>
                    currentSlug === project.slug ? null : project.slug
                  )
                }
              >
                <VerticalDotsIcon />
              </button>

              {openProjectMenuSlug === project.slug ? (
                <div className="profile-page__project-menu-dropdown" role="menu" aria-label={`${project.title} actions`}>
                  <button
                    className="profile-page__project-menu-item"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenProjectMenuSlug(null);
                      onEditProject?.(project.slug);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="profile-page__project-menu-item profile-page__project-menu-item--danger"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenProjectMenuSlug(null);
                      onDeleteProject?.(project.slug);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>

            <a
              className="profile-page__shot-link"
              href={resolveHref(`/projects/${project.slug}`)}
                aria-label={`Open ${project.title}`}
              >
                <div className="profile-page__shot-media">
                  <img
                    className="profile-page__shot-image"
                    src={project.image}
                    alt={project.imageAlt || project.title}
                    loading="lazy"
                  />
                </div>
              </a>

              <div className="profile-page__shot-footer profile-page__shot-footer--project">
                {mode === 'review' ? (
                  <div className="profile-page__shot-stats" aria-label={`${project.title} review stats`}>
                    <span className="profile-page__shot-stat">
                      <StarIcon />
                      <span>{project.reviewAverage.toFixed(1)}</span>
                    </span>
                    <span className="profile-page__shot-stat">
                      <CommentIcon />
                      <span>{formatCompactCount(project.reviewCount || 0)}</span>
                    </span>
                  </div>
                ) : (
                  <div className="profile-page__shot-stats" aria-label={`${project.title} activity stats`}>
                    <span className="profile-page__shot-stat">
                      <CommentIcon />
                      <span>{formatCompactCount(project.reviewCount || 0)}</span>
                    </span>
                    <span className="profile-page__shot-stat">
                      <HeartIcon />
                      <span>{formatCompactCount(getProjectLikeCount(project))}</span>
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderCollections() {
    if (!collections.length) {
      return (
        <div className="profile-page__collections-container">
          {renderEmptyState({
            title: 'No collections yet',
            copy: 'Group your projects into collections to showcase them together.',
            buttonLabel: 'Create your first collection',
            onButtonClick: onCreateCollection,
          })}
        </div>
      );
    }

    return (
      <div className="profile-page__collections-container">
        <div className="profile-page__projects-actions">
          <button
            className="profile-page__add-project-button profile-page__add-project-button--collection"
            type="button"
            onClick={onCreateCollection}
            aria-label="Create collection"
            title="Create collection"
          >
            <PlusIcon />
          </button>
        </div>
        <div className="profile-page__shots-grid profile-page__shots-grid--collections">
          {collections.map((collection) => {
            const projects = collection.items || [];
            const displayImages = [];
            
            // Collect unique images from projects and their galleries
            const seenImages = new Set();
            for (const p of projects) {
              const mainImg = p.image_url || p.image;
              if (mainImg && !seenImages.has(mainImg)) {
                displayImages.push(mainImg);
                seenImages.add(mainImg);
              }
              if (displayImages.length >= 3) break;
              
              const gallery = Array.isArray(p.gallery) ? p.gallery : [];
              for (const g of gallery) {
                if (g && !seenImages.has(g)) {
                  displayImages.push(g);
                  seenImages.add(g);
                }
                if (displayImages.length >= 3) break;
              }
              if (displayImages.length >= 3) break;
            }

            return (
              <article key={collection.id || collection.title} className="profile-page__shot-card profile-page__shot-card--project profile-page__shot-card--collection" style={{ overflow: 'visible' }}>
                <div className="profile-page__project-menu profile-page__collection-menu">
                  <button
                    className="profile-page__project-menu-button"
                    type="button"
                    aria-label={`Open actions for ${collection.title}`}
                    aria-expanded={openCollectionMenuId === collection.id}
                    aria-haspopup="menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenCollectionMenuId((currentId) =>
                        currentId === collection.id ? null : collection.id
                      );
                    }}
                  >
                    <VerticalDotsIcon />
                  </button>

                  {openCollectionMenuId === collection.id ? (
                    <div className="profile-page__project-menu-dropdown" role="menu" aria-label={`${collection.title} actions`}>
                      <button
                        className="profile-page__project-menu-item"
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCollectionMenuId(null);
                          onEditCollection?.(collection);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="profile-page__project-menu-item profile-page__project-menu-item--danger"
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenCollectionMenuId(null);
                          onDeleteCollection?.(collection.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>

                <div
                  className="profile-page__shot-link"
                  onClick={() => onViewCollection(collection)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`profile-page__collection-stack profile-page__collection-stack--${displayImages.length || 1}`}>
                    {displayImages.length > 0 ? (
                      displayImages.map((img, idx) => (
                        <img
                          key={idx}
                          className={`profile-page__stack-item profile-page__stack-item--${idx + 1}`}
                          src={img}
                          alt=""
                        />
                      ))
                    ) : (
                      <div className="profile-page__collection-placeholder" />
                    )}
                  </div>
                </div>

                <div className="profile-page__shot-footer profile-page__shot-footer--project" onClick={() => onViewCollection(collection)} style={{ cursor: 'pointer' }}>
                  <div className="profile-page__shot-copy--project">
                    <h3 className="profile-page__shot-title--compact">{collection.title}</h3>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  function renderAboutSection() {
    return (
      <section className="profile-page__about-grid" aria-label="About profile">
        <article className="profile-page__about-card profile-page__about-card--intro">
          <p className="profile-page__about-eyebrow">About</p>
          <h2 className="profile-page__about-title">{profileRole}</h2>
          <p className="profile-page__about-lead">{profileHeadline}</p>
          <p className="profile-page__about-copy">{profileBio}</p>
        </article>

        <article className="profile-page__about-card">
          <p className="profile-page__about-eyebrow">Profile details</p>
          <div className="profile-page__detail-list">
            <div className="profile-page__detail-item">
              <span className="profile-page__detail-label">Location</span>
              <span className="profile-page__detail-value">{profileLocation}</span>
            </div>
            {profileEmail ? (
              <div className="profile-page__detail-item">
                <span className="profile-page__detail-label">Email</span>
                <a className="profile-page__detail-link" href={`mailto:${profileEmail}`}>
                  {profileEmail}
                </a>
              </div>
            ) : null}
            {profileWebsite ? (
              <div className="profile-page__detail-item">
                <span className="profile-page__detail-label">Website</span>
                <a className="profile-page__detail-link" href={profileWebsite} target="_blank" rel="noreferrer">
                  <span>{profileWebsite.replace(/^https?:\/\//, '')}</span>
                  <ExternalLinkIcon />
                </a>
              </div>
            ) : null}
          </div>
        </article>

        <article className="profile-page__about-card">
          <p className="profile-page__about-eyebrow">Skills</p>
          {profileSkills.length ? (
            <div className="profile-page__skill-list">
              {profileSkills.map((skill) => (
                <span key={skill} className="profile-page__skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="profile-page__about-copy">
              Add your strongest tools and specialties to help people know how you work.
            </p>
          )}
        </article>

        <article className="profile-page__about-card">
          <p className="profile-page__about-eyebrow">Education</p>
          {profileEducation.length ? (
            <div className="profile-page__education-list">
              {profileEducation.map((item) => (
                <div key={item.id || item.title} className="profile-page__education-item">
                  <h3 className="profile-page__education-title">{item.title}</h3>
                  <p className="profile-page__education-meta">
                    {[item.meta, item.period].filter(Boolean).join(' - ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-page__about-copy">
              Education and training history will appear here once added in your profile settings.
            </p>
          )}
        </article>
      </section>
    );
  }

  function renderActiveContent() {
    if (activeTab === 'drafts') {
      return draftProjects.length
        ? renderProjectGrid(draftProjects)
        : renderEmptyState({
            title: 'No drafts saved yet',
            copy: 'Projects you save as drafts will stay here until you are ready to publish them.',
            buttonLabel: 'Start a draft',
          });
    }

    if (activeTab === 'reviews') {
      return reviewedProjects.length
        ? renderProjectGrid(reviewedProjects, 'review')
        : renderEmptyState({
            title: 'No project reviews yet',
            copy: 'Publish work and your review averages will appear here as feedback comes in.',
          });
    }

    if (activeTab === 'recent') {
      return recentProjects.length
        ? renderProjectGrid(recentProjects)
        : renderEmptyState({
            title: 'No recent shots yet',
            copy: 'Your latest published work will appear here so people can quickly see what is new.',
          });
    }

    if (activeTab === 'collections') {
      return renderCollections();
    }

    if (activeTab === 'liked') {
      return renderEmptyState({
        title: 'No liked shots yet',
        copy: 'When you save inspiration from other builders, those liked shots will appear here.',
        buttonLabel: 'Explore projects',
        buttonHref: '/',
      });
    }

    return publishedProjects.length
      ? renderProjectGrid(publishedProjects)
      : renderEmptyState({
          title: 'Upload your first shot',
          copy: 'Show off your best work. Get feedback, likes and be a part of a growing community.',
        });
  }

  return (
    <section className="profile-page" aria-labelledby="profile-name">
      <div className="profile-page__hero">
        <div className="profile-page__hero-main">
          {profile?.image ? (
            <img className="profile-page__avatar" src={profile.image} alt={profileName} />
          ) : (
            <div className="profile-page__avatar profile-page__avatar--fallback" aria-hidden="true">
              {getInitials(profileName)}
            </div>
          )}

          <div className="profile-page__hero-copy">
            <h1 className="profile-page__name" id="profile-name">
              {profileName}
            </h1>

            <p className="profile-page__location">
              <LocationPinIcon />
              <span>{profileLocation}</span>
            </p>

            <div className="profile-page__actions">
              <a className="profile-page__edit-button" href={resolveHref('/profile/settings/edit-profile')}>
                Edit Profile
              </a>

              <div className="profile-page__menu" ref={menuRef}>
                <button
                  className="profile-page__more-button"
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setIsMenuOpen((currentOpen) => !currentOpen)}
                >
                  <MoreDotsIcon />
                </button>

                {isMenuOpen ? (
                  <div className="profile-page__menu-dropdown" role="menu" aria-label="Profile actions">
                    <a
                      className="profile-page__menu-link"
                      href={resolveHref('/profile/settings')}
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-page__tabs" role="tablist" aria-label="Profile sections">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            className={`profile-page__tab ${activeTab === tab.id ? 'profile-page__tab--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-page__divider" aria-hidden="true" />

      <div className="profile-page__content">{renderActiveContent()}</div>
    </section>
  );
}

export default ProfilePage;

