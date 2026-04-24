import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import './public-profile.css';

const contactActions = [
  { key: 'github', label: 'GitHub', icon: FaGithub, variant: 'secondary' },
  { key: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, variant: 'secondary' },
  { key: 'email', label: 'Email', icon: HiOutlineEnvelope, variant: 'primary' },
];

function PublicProfilePage({ contributor, projects, toAppHref }) {
  const featuredProjects = projects.slice(0, 3);

  return (
    <section className="public-profile-page" aria-labelledby="public-profile-name">
      <div className="container container--public-profile">
        <div className="public-profile-page__hero">
          <div className="public-profile-page__avatar-shell">
            <img
              className="public-profile-page__avatar"
              src={contributor.image}
              alt={contributor.name}
            />
          </div>

          <h1 className="public-profile-page__name" id="public-profile-name">
            {contributor.name}
          </h1>

          <p className="public-profile-page__description">
            <span className="public-profile-page__description-role">{contributor.role}</span>{' '}
            {contributor.headline} Based in {contributor.location}.
          </p>

          <div
            className="public-profile-page__contact-row"
            aria-label={`Contact ${contributor.name}`}
          >
            {contactActions
              .map((action) => ({
                ...action,
                href: contributor.contact?.[action.key],
              }))
              .filter((action) => Boolean(action.href))
              .map((action) => {
                const Icon = action.icon;
                const isExternal = action.key !== 'email';

                return (
                  <a
                    key={action.key}
                    className={`public-profile-page__contact-button public-profile-page__contact-button--${action.variant}`}
                    href={action.key === 'email' ? `mailto:${action.href}` : action.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer' : undefined}
                    aria-label={`${action.label} ${contributor.name}`}
                  >
                    <Icon className="public-profile-page__contact-icon" aria-hidden="true" />
                    <span>{action.label}</span>
                  </a>
                );
              })}
          </div>
        </div>

        <section
          className="public-profile-page__section"
          aria-labelledby="public-profile-projects-heading"
        >
          <div className="public-profile-page__section-heading">
            <h2
              className="public-profile-page__section-title"
              id="public-profile-projects-heading"
            >
              Projects &amp; Technical Achievements
            </h2>
          </div>

          {featuredProjects.length ? (
            <div className="public-profile-page__projects-grid">
              {featuredProjects.map((project) => (
                <article key={project.slug} className="public-profile-page__project-card">
                  <a
                    className="public-profile-page__project-link"
                    href={toAppHref(`/projects/${project.slug}`)}
                  >
                    <div className="public-profile-page__project-media">
                      <img
                        className="public-profile-page__project-image"
                        src={project.image}
                        alt={project.imageAlt}
                        loading="lazy"
                      />
                    </div>

                    <div className="public-profile-page__project-content">
                      <h3 className="public-profile-page__project-title">{project.title}</h3>
                      <p className="public-profile-page__project-summary">{project.summary}</p>

                      <div
                        className="public-profile-page__project-tags"
                        aria-label={`${project.title} technologies`}
                      >
                        {project.techStack.slice(0, 3).map((item) => (
                          <span key={item} className="public-profile-page__project-tag">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="public-profile-page__empty-state">
              <h3 className="public-profile-page__empty-title">No published projects yet</h3>
              <p className="public-profile-page__empty-copy">
                This contributor has not added public technical achievements to Codefolio yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default PublicProfilePage;
