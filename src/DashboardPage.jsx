import { useState, useEffect } from 'react';
import './dashboard.css';

const dashboardNavigationItems = [
  { label: 'Explore', href: '/dashboard' },
  { label: 'Showcases', href: '/dashboard/showcases' },
  { label: 'Contributors', href: '/dashboard/contributors' },
];

const dashboardPopularTopics = [
  'Health',
  'Mining',
  'e-commerce',
  'Education',
  'Finance',
  'Agriculture',
];

const dashboardBrowseTopics = [
  'Discover',
  'Health',
  'Mining',
  'Education',
  'Finance',
  'Agriculture',
  'Crypto',
];

function DashboardCodeMark() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-brand__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.2 7.1 2.3 12l3.9 4.9" />
      <path d="M13.2 4.1 10 19.9" />
      <path d="m17.8 7.1 3.9 4.9-3.9 4.9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon dashboard-icon--search"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="5.4" />
      <path d="m15.1 15.1 4.3 4.3" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon dashboard-icon--sparkles"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12 4 1.1 3.2L16.4 8l-3.3.9L12 12l-1.1-3.1L7.6 8l3.3-.8L12 4Z" />
      <path d="m18.4 13.4.6 1.7 1.8.5-1.8.5-.6 1.7-.6-1.7-1.7-.5 1.7-.5.6-1.7Z" />
      <path d="m6.4 13.8.8 2.2 2.2.7-2.2.6-.8 2.2-.8-2.2-2.2-.6 2.2-.7.8-2.2Z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon dashboard-icon--filter"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 7.5h14" />
      <path d="M8 12h8" />
      <path d="M10 16.5h4" />
    </svg>
  );
}

function ChevronDownTinyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon dashboard-icon--tiny"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon dashboard-icon--tiny"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 3.2v9.6" />
      <path d="M3.2 8h9.6" />
    </svg>
  );
}

export function DashboardHeader({
  toAppHref,
  activePath = '/dashboard',
  profile,
  navigationItems = dashboardNavigationItems,
  brandPath = '/dashboard',
  chatHref = '/dashboard/chat',
  chatLabel = 'Chat with AI',
  chatActive = false,
  onChatClick,
  isSearchActive,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerClassName = `dashboard-header ${chatActive ? 'dashboard-header--solid' : ''}`;
  const chatButtonClassName = `dashboard-header__chat-button ${chatActive ? 'dashboard-header__chat-button--active' : ''
    }`;

  return (
    <header className={headerClassName}>
      <div className="container dashboard-header__inner">
        <div className="dashboard-header__left">
          <a className="dashboard-brand" href={toAppHref(brandPath)} aria-label="Codefolio dashboard">
            <DashboardCodeMark />
            <span>Codefolio</span>
          </a>
        </div>

        <nav className={`dashboard-nav ${isMobileMenuOpen ? 'dashboard-nav--mobile-active' : ''}`} aria-label="Dashboard">
          {isSearchActive ? (
            <form className="dashboard-header__search" onSubmit={onSearchSubmit}>
              <input
                className="dashboard-header__search-input"
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={onSearchChange}
                autoFocus
              />
              <button className="dashboard-header__search-submit" type="submit" aria-label="Submit search">
                <SearchIcon />
              </button>
            </form>
          ) : (
            navigationItems.map((item) => (
              <a
                key={item.label}
                className={`dashboard-nav__link ${activePath === item.href ? 'dashboard-nav__link--active' : ''}`}
                href={toAppHref(item.href)}
                aria-current={activePath === item.href ? 'page' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))
          )}
          
          {isMobileMenuOpen && (
             <div className="dashboard-nav__mobile-actions">
                <hr style={{ width: '100%', border: 0, borderTop: '1px solid #f0f0f0', margin: '4px 0' }} />
                <a className="dashboard-nav__link" href={toAppHref('/dashboard/chat')} onClick={() => setIsMobileMenuOpen(false)}>Chat with AI</a>
                <a className="dashboard-nav__link" href={toAppHref('/profile')} onClick={() => setIsMobileMenuOpen(false)}>Profile</a>
                <a className="dashboard-nav__link" href={toAppHref('/logout')} onClick={() => setIsMobileMenuOpen(false)}>Logout</a>
             </div>
          )}
        </nav>

        <div className="dashboard-header__actions">
          <div className="dashboard-dropdown-container">
            <button
              className="dashboard-header__icon-button dashboard-header__icon-button--notification"
              type="button"
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <img
                className="dashboard-header__notification-icon"
                src="/Icon.png"
                alt=""
              />
              <span className="dashboard-header__notification-dot" />
            </button>

            {isNotificationsOpen && (
              <div className="dashboard-dropdown">
                <div className="dashboard-dropdown__header">
                  <h3>Your Notifications</h3>
                </div>
                <div className="dashboard-dropdown__body">
                  <p>You have no notifications</p>
                </div>
                <div className="dashboard-dropdown__footer">
                  <button className="dashboard-dropdown__button" type="button">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <a className="dashboard-header__avatar" href={toAppHref('/profile')} aria-label="Profile">
            <img src={profile?.image || '/me.png'} alt={profile?.name || 'Your profile'} />
          </a>
          {!chatActive && (
            onChatClick ? (
              <button className={chatButtonClassName} type="button" onClick={onChatClick}>
                <PlusIcon />
                <span>{chatLabel}</span>
              </button>
            ) : (
              <a className={chatButtonClassName} href={toAppHref(chatHref)}>
                <PlusIcon />
                <span>{chatLabel}</span>
              </a>
            )
          )}
          
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
             {isMobileMenuOpen ? (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M18 6 6 18" /><path d="m6 6 12 12" />
               </svg>
             ) : (
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
               </svg>
             )}
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardPage({ projects, toAppHref, profile }) {
  const [activeTopic, setActiveTopic] = useState('Discover');
  const [aiInputValue, setAiInputValue] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);

  const filteredProjects = activeTopic === 'Discover' 
    ? projects 
    : projects.filter(p => {
        const query = activeTopic.toLowerCase();
        return (
          p.techStack?.some(s => s.toLowerCase().includes(query)) || 
          p.tags?.some(t => t.toLowerCase().includes(query)) ||
          p.summary?.toLowerCase().includes(query) ||
          p.title?.toLowerCase().includes(query)
        );
      });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiInputValue.trim()) return;
    window.location.hash = `/dashboard/chat?m=${encodeURIComponent(aiInputValue)}`;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    if (input && input.value.trim()) {
      setSearchTerm(input.value.trim());
      setIsSearchActive(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearSearch = () => {
    setIsSearchActive(false);
    setSearchTerm('');
  };

  return (
    <>
        <DashboardHeader
          toAppHref={toAppHref}
          activePath="/dashboard"
          profile={profile}
          isSearchActive={isSearchActive || hasScrolled}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
        />

        <MobileRestriction />

      <main className="dashboard-main">
        {isSearchActive ? (
          <section className="dashboard-search-results">
            <div className="container">
              <h1 className="dashboard-search-results__title">{searchTerm}</h1>
              <p className="dashboard-search-results__subtitle">
                Explore real-world engineering project collections for {searchTerm}.
              </p>

            </div>
          </section>
        ) : (
          <section className="dashboard-hero">
            <div className="container dashboard-hero__inner">
              <h1 className="dashboard-hero__title">
                <span>Discover real-world</span>
                <span>Engineering Inspiration</span>
              </h1>

              <form className="dashboard-search" role="search" onSubmit={handleSearchSubmit}>
                <input
                  className="dashboard-search__input"
                  type="search"
                  placeholder="What type of projects are you interested in?"
                  aria-label="Search projects"
                />
                <button className="dashboard-search__button" type="submit" aria-label="Search">
                  <SearchIcon />
                </button>
              </form>

              <div className="dashboard-popular">
                <span className="dashboard-popular__label">Popular:</span>
                <div className="dashboard-popular__chips">
                  {dashboardPopularTopics.map((topic) => (
                    <button key={topic} className="dashboard-popular__chip" type="button" onClick={() => {
                      setSearchTerm(topic);
                      setIsSearchActive(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <form className="dashboard-ai-banner" onSubmit={handleAiSubmit}>
                <a className="dashboard-ai-banner__button" href={toAppHref('/dashboard/chat')}>
                  <SparklesIcon />
                  <span>Start a Conversation</span>
                  <span className="dashboard-ai-banner__badge">NEW</span>
                </a>
                <input
                  className="dashboard-ai-banner__input"
                  type="text"
                  placeholder="Tell us what you need and help you to find it easily using AI."
                  value={aiInputValue}
                  onChange={(e) => setAiInputValue(e.target.value)}
                />
              </form>
            </div>
          </section>
        )}

        <section className="dashboard-projects" id="community" aria-labelledby="dashboard-projects-heading">
          <div className="container">
            <h2 className="sr-only" id="dashboard-projects-heading">
              Dashboard projects
            </h2>

            <div className="dashboard-toolbar">
              <button className="dashboard-toolbar__pill" type="button">
                <span>Following</span>
                <ChevronDownTinyIcon />
              </button>

              <div className="dashboard-toolbar__tabs" aria-label="Browse topics">
                {dashboardBrowseTopics.map((topic) => (
                  <button
                    key={topic}
                    className={`dashboard-toolbar__tab ${activeTopic === topic ? 'dashboard-toolbar__tab--active' : ''}`}
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <button className="dashboard-toolbar__pill dashboard-toolbar__pill--filter" type="button">
                <FilterIcon />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="container container--dashboard-projects">
            <div className="dashboard-projects__grid">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <article key={project.slug} className="dashboard-project-card">
                    <a className="dashboard-project-card__link" href={toAppHref(`/projects/${project.slug}`)}>
                      <div className="dashboard-project-card__media">
                        <img
                          className="dashboard-project-card__image"
                          src={project.image}
                          alt={project.imageAlt}
                          loading="lazy"
                        />
                      </div>

                      <div className="dashboard-project-card__content">
                        <div className="dashboard-project-card__top">
                          <h3 className="dashboard-project-card__title">{project.title}</h3>
                          {project.tag ? (
                            <span className="dashboard-project-card__badge">{project.tag}</span>
                          ) : null}
                        </div>
                        <p className="dashboard-project-card__stack">{project.stack}</p>
                      </div>
                    </a>
                  </article>
                ))
              ) : (
                <div className="no-projects-message">
                  <p>No projects yet in this category.</p>
                </div>
              )}
            </div>

            {filteredProjects.length > 8 && (
              <div className="dashboard-projects__footer">
                <button className="dashboard-projects__load-more" type="button">
                  <span>Load More</span>
                  <ChevronDownTinyIcon />
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </>
  );
}

function MobileRestriction() {
  return (
    <div className="mobile-restriction">
      <div className="mobile-restriction__content">
        <div className="mobile-restriction__icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
            <line x1="2" x2="22" y1="20" y2="20" />
            <line x1="12" x2="12" y1="16" y2="20" />
          </svg>
        </div>
        <h2>Desktop Experience Only</h2>
        <p>To provide you with the best project management and code visualization tools, Codefolio is currently optimized for desktop use.</p>
        <p>Please log in from your laptop or desktop computer to access your full dashboard.</p>
      </div>
    </div>
  );
}

export default DashboardPage;

