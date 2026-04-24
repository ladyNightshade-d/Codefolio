import './search-assistant.css';

const discoveryExamples = [
  'AI-powered dashboards',
  'Real-time analytics',
  'Sustainability apps',
  'Developer tools',
  'Data visualization',
];

function projectMatchesQuery(project, query) {
  const text = [project.title, project.stack, project.tags?.join(' '), project.summary]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  // Allow partial matches and fuzzy search
  return terms.some((term) => text.includes(term));
}

function SearchAssistant({ query, projects = [], onExampleClick, toAppHref, isLoading = false }) {
  const trimmedQuery = query.trim();
  const suggestedSearches = trimmedQuery
    ? [
        `${trimmedQuery} dashboard`,
        `${trimmedQuery} analytics`,
        `Modern ${trimmedQuery} UI`,
      ]
    : discoveryExamples;

  const matchedProjects = trimmedQuery
    ? projects.filter((project) => projectMatchesQuery(project, trimmedQuery))
    : [];

  const visibleProjects = matchedProjects.length
    ? matchedProjects.slice(0, 6)
    : projects.slice(0, 6);

  return (
    <section className="search-assistant" aria-label="Search helper">
      <div className="search-assistant__meta">
        <p className="search-assistant__help-label">Search helper</p>
        <h2 className="search-assistant__help-title">
          {isLoading
            ? 'Searching...'
            : trimmedQuery
            ? `Search results for “${trimmedQuery}”`
            : 'Need help finding the right project?'}
        </h2>
        {trimmedQuery ? (
          <p className="search-assistant__subtitle">
            {matchedProjects.length
              ? `Showing top ${visibleProjects.length} matches from your collection.`
              : 'No exact matches found — here are some strong suggestions.'}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="search-assistant__loading">
          <div className="search-assistant__spinner"></div>
          <p>Finding the best matches...</p>
        </div>
      ) : (
        <>
          <div className="search-assistant__suggestions">
        {suggestedSearches.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="search-assistant__suggestion"
            onClick={() => onExampleClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {trimmedQuery ? (
        <div className="search-assistant__results-grid">
          {visibleProjects.map((project) => (
            <a
              key={project.slug}
              className="search-assistant__result-card"
              href={toAppHref(`/projects/${project.slug}`)}
            >
              <div className="search-assistant__result-media">
                <img
                  src={project.image}
                  alt={project.imageAlt || project.title}
                  loading="lazy"
                />
              </div>
              <div className="search-assistant__result-content">
                <p className="search-assistant__result-tag">{project.tag || project.status || project.stack}</p>
                <h3>{project.title}</h3>
                <p>{project.stack}</p>
              </div>
            </a>
          ))}
        </div>
      ) : null}
        </>
      )}

      <div className="search-assistant__action-row">
        <p className="search-assistant__action-copy">
          {trimmedQuery
            ? 'Want a smarter search? Let Codefolio AI suggest the best projects for your query.'
            : 'Try one of the prompts above or ask the assistant to find the best matches.'}
        </p>
        <a className="search-assistant__chat-button" href={toAppHref('/dashboard/chat')}>
          Ask Codefolio AI
        </a>
      </div>
    </section>
  );
}

export default SearchAssistant;
