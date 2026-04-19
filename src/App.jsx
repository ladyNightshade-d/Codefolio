const navigationItems = ["Explore", "Showcases", "Learning", "Jobs"];
const filterItems = ["Popular", "Recent", "Followed"];
const footerItems = ["Work", "Projects", "Archive", "Stack"];

const trustLogos = [
  { src: "/withintech.png", alt: "Withintech" },
  { src: "/academicbridge.png", alt: "Academic Bridge" },
  { src: "/irembo.png", alt: "Irembo" },
];

const projects = [
  {
    title: "Obsidian Core",
    stack: "React \u2022 Rust \u2022 WASM",
    image: "/1.png",
    imageAlt: "Obsidian Core preview",
    tag: "NEW",
  },
  {
    title: "Lumina Dev",
    stack: "Next.js \u2022 three.js",
    image: "/2.png",
    imageAlt: "Lumina Dev preview",
  },
  {
    title: "alow State",
    stack: "Node \u2022 Graph\u00E9 L",
    image: "/3.png",
    imageAlt: "alow State preview",
  },
  {
    title: "Synthetix",
    stack: "Svelte \u2022 Tailwind",
    image: "/4.png",
    imageAlt: "Synthetix preview",
  },
  {
    title: "Monolith Infrastructure",
    stack: "Go \u2022 Kubernetes \u2022 Docker",
    image: "/5.png",
    imageAlt: "Monolith Infrastructure preview",
    tag: "FEATURED",
    wide: true,
  },
  {
    title: "Vortex AI",
    stack: "Python \u2022 PyTorch",
    image: "/6.png",
    imageAlt: "Vortex AI preview",
  },
  {
    title: "Sonic Labs",
    stack: "Vue \u2022 WebAudio",
    image: "/7.png",
    imageAlt: "Sonic Labs preview",
  },
  {
    title: "Aether Stream",
    stack: "D3.js \u2022 WebGL",
    image: "/8.png",
    imageAlt: "Aether Stream preview",
  },
  {
    title: "Minimal Script",
    stack: "TypeScript \u2022 Bun",
    image: "/9.png",
    imageAlt: "Minimal Script preview",
  },
  {
    title: "Metric Pro",
    stack: "Grafana \u2022 Prometheus",
    image: "/10.png",
    imageAlt: "Metric Pro preview",
  },
  {
    title: "Atomic UI",
    stack: "React \u2022 Storybook",
    image: "/11.png",
    imageAlt: "Atomic UI preview",
  },
];

function CodeMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.5 7 4 12l4.5 5" />
      <path d="m15.5 7 4.5 5-4.5 5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="button__icon"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="footer__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.74-1.34-1.74-1.1-.76.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.08 1.83 2.82 1.3 3.5.99.1-.77.42-1.3.77-1.6-2.67-.3-5.47-1.31-5.47-5.86 0-1.3.47-2.37 1.24-3.2-.12-.3-.53-1.52.12-3.16 0 0 1.01-.32 3.3 1.22a11.52 11.52 0 0 1 6 0c2.29-1.54 3.3-1.22 3.3-1.22.65 1.64.24 2.86.12 3.16.77.83 1.24 1.9 1.24 3.2 0 4.56-2.81 5.55-5.49 5.85.43.37.82 1.09.82 2.2v3.27c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function App() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <a className="brand" href="/" aria-label="Codefolio home">
            <CodeMark />
            <span>Codefolio</span>
          </a>

          <nav className="site-nav" aria-label="Primary">
            {navigationItems.map((item, index) => (
              <a
                key={item}
                className={`site-nav__link ${index === 0 ? "site-nav__link--active" : ""}`}
                href="/"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="site-actions">
            <a className="site-actions__login" href="/">
              Login
            </a>
            <button className="pill-button pill-button--dark pill-button--small" type="button">
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container hero-section__inner">
            <h1 className="hero-title">
              <span>Discover real-world</span>
              <span>Engineering inspiration</span>
            </h1>

            <p className="hero-copy">
              A curated gallery of engineering excellence. Discover high-performance
              portfolios and the systems that power them.
            </p>

            <div className="hero-actions">
              <button className="pill-button pill-button--dark" type="button">
                Join for free
              </button>
              <button className="pill-button pill-button--light" type="button">
                Explore projects
              </button>
            </div>

            <div className="trust-strip">
              <p className="trust-strip__label">Trusted by modern engineering teams</p>
              <div className="trust-strip__logos">
                {trustLogos.map((logo) => (
                  <img
                    key={logo.alt}
                    className="trust-strip__logo"
                    src={logo.src}
                    alt={logo.alt}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="projects-section" aria-labelledby="projects-heading">
          <div className="container projects-section__inner">
            <h2 className="sr-only" id="projects-heading">
              Featured projects
            </h2>

            <div className="project-filters" role="tablist" aria-label="Project filters">
              {filterItems.map((item, index) => (
                <button
                  key={item}
                  className={`project-filters__pill ${index === 0 ? "project-filters__pill--active" : ""}`}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="projects-grid">
              {projects.map((project) => (
                <article
                  key={project.title}
                  className={`project-card ${project.wide ? "project-card--wide" : ""}`}
                >
                  <img
                    className="project-card__image"
                    src={project.image}
                    alt={project.imageAlt}
                    loading="lazy"
                  />

                  <div className="project-card__content">
                    <div className="project-card__top">
                      <h3 className="project-card__title">{project.title}</h3>
                      {project.tag ? (
                        <span className="project-card__badge">{project.tag}</span>
                      ) : null}
                    </div>
                    <p className="project-card__stack">{project.stack}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="projects-section__footer">
              <button className="load-more-button" type="button">
                <span>Load More Projects</span>
                <ChevronDownIcon />
              </button>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-section__inner">
            <h2 className="cta-section__title">Ready to ship?</h2>
            <p className="cta-section__copy">
              Join the elite community of builders defining the next generation of the
              web.
            </p>
            <button className="pill-button pill-button--dark cta-section__button" type="button">
              Start Building
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="site-footer__top">
            <a className="brand brand--footer" href="/">
              <span>Codefolio</span>
            </a>

            <nav className="site-footer__nav" aria-label="Footer">
              {footerItems.map((item) => (
                <a key={item} className="site-footer__link" href="/">
                  {item}
                </a>
              ))}
            </nav>

            <a className="site-footer__github" href="/" aria-label="GitHub">
              <GithubIcon />
            </a>
          </div>

          <div className="site-footer__bottom">
            {"\u00A9 2026 Codefolio \u2014 Project Management"}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
