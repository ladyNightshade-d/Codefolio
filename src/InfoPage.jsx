import './info-page.css';

function InfoPage({ title, eyebrow, paragraphs = [], actions = [] }) {
  return (
    <section className="info-page" aria-labelledby="info-page-heading">
      <div className="container info-page__inner">
        <div className="info-page__panel">
          {eyebrow ? <p className="info-page__eyebrow">{eyebrow}</p> : null}

          <h1 className="info-page__title" id="info-page-heading">
            {title}
          </h1>

          <div className="info-page__body">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="info-page__copy">
                {paragraph}
              </p>
            ))}
          </div>

          {actions.length ? (
            <div className="info-page__actions">
              {actions.map((action) => (
                <a
                  key={action.label}
                  className={`info-page__action ${
                    action.variant === 'secondary'
                      ? 'info-page__action--secondary'
                      : 'info-page__action--primary'
                  }`}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noreferrer' : undefined}
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default InfoPage;
