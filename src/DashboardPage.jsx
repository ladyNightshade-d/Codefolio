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
}) {
  const headerClassName = `dashboard-header ${chatActive ? 'dashboard-header--solid' : ''}`;
  const chatButtonClassName = `dashboard-header__chat-button ${
    chatActive ? 'dashboard-header__chat-button--active' : ''
  }`;

  return (
    <header className={headerClassName}>
      <div className="container dashboard-header__inner">
        <a className="dashboard-brand" href={toAppHref(brandPath)} aria-label="Codefolio dashboard">
          <DashboardCodeMark />
          <span>Codefolio</span>
        </a>

        <nav className="dashboard-nav" aria-label="Dashboard">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              className={`dashboard-nav__link ${activePath === item.href ? 'dashboard-nav__link--active' : ''}`}
              href={toAppHref(item.href)}
              aria-current={activePath === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="dashboard-header__actions">
          <button className="dashboard-header__icon-button" type="button" aria-label="Messages">
            <img
              className="dashboard-header__message-icon"
              src="/Button.png"
              alt=""
            />
          </button>
          <button
            className="dashboard-header__icon-button dashboard-header__icon-button--notification"
            type="button"
            aria-label="Notifications"
          >
            <img
              className="dashboard-header__notification-icon"
              src="/Icon.png"
              alt=""
            />
            <span className="dashboard-header__notification-dot" />
          </button>
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
        </div>
      </div>
    </header>
  );
}

function DashboardPage({ projects, toAppHref, profile }) {
  return (
    <>
      <DashboardHeader toAppHref={toAppHref} activePath="/dashboard" profile={profile} />

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <div className="container dashboard-hero__inner">
            <h1 className="dashboard-hero__title">
              <span>Discover real-world</span>
              <span>Engineering Inspiration</span>
            </h1>

            <div className="dashboard-search" role="search">
              <input
                className="dashboard-search__input"
                type="search"
                placeholder="What type of projects are you interested in?"
                aria-label="Search projects"
              />
              <button className="dashboard-search__button" type="button" aria-label="Search">
                <SearchIcon />
              </button>
            </div>

            <div className="dashboard-popular">
              <span className="dashboard-popular__label">Popular:</span>
              <div className="dashboard-popular__chips">
                {dashboardPopularTopics.map((topic) => (
                  <button key={topic} className="dashboard-popular__chip" type="button">
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="dashboard-ai-banner">
              <a className="dashboard-ai-banner__button" href={toAppHref('/dashboard/chat')}>
                <SparklesIcon />
                <span>Start a Conversation</span>
                <span className="dashboard-ai-banner__badge">NEW</span>
              </a>
              <p className="dashboard-ai-banner__copy">
                Tell us what you need and help you to find it easily using AI.
              </p>
            </div>
          </div>
        </section>

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
                {dashboardBrowseTopics.map((topic, index) => (
                  <button
                    key={topic}
                    className={`dashboard-toolbar__tab ${index === 0 ? 'dashboard-toolbar__tab--active' : ''}`}
                    type="button"
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
              {projects.map((project) => (
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
              ))}
            </div>

            <div className="dashboard-projects__footer">
              <button className="dashboard-projects__load-more" type="button">
                <span>Load More Projects</span>
                <ChevronDownTinyIcon />
              </button>
            </div>
          </div>
        </section>

        <section className="dashboard-cta">
          <div className="container dashboard-cta__inner">
            <h2 className="dashboard-cta__title">Ready to ship?</h2>
            <p className="dashboard-cta__copy">
              Join the elite community of builders defining the next generation of the web.
            </p>
            <button className="dashboard-cta__button" type="button">
              Start Building
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default DashboardPage;

