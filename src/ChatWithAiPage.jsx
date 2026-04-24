import { useEffect, useRef, useState } from 'react';
import { DashboardHeader } from './DashboardPage.jsx';
import './chat-with-ai.css';

const chatNavigationItems = [
  { label: 'Explore', href: '/dashboard' },
  { label: 'Showcases', href: '/dashboard/showcases' },
  { label: 'Contributors', href: '/dashboard/contributors' },
];

const seedPrompt =
  "I'm looking for high-performance React projects with a focus on data visualization from Cohort 3.";

const fallbackProjectSlugs = ['aether-stream', 'obsidian-core', 'community-loop'];
const commonTerms = new Set([
  'a',
  'an',
  'and',
  'are',
  'at',
  'build',
  'by',
  'for',
  'from',
  'have',
  'high',
  'i',
  'in',
  'is',
  'it',
  'looking',
  'me',
  'of',
  'on',
  'please',
  'project',
  'projects',
  'show',
  'that',
  'the',
  'to',
  'want',
  'with',
]);

function AssistantBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__assistant-badge-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 9.2h10" />
      <path d="M8.1 6.5h7.8" />
      <rect x="5.5" y="7.8" width="13" height="9.7" rx="2.9" />
      <path d="M10 12.5v.1" />
      <path d="M14 12.5v.1" />
      <path d="M9.5 15.4h5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__send-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 18V6" />
      <path d="m7 11 5-5 5 5" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__card-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 16 16 8" />
      <path d="M10 8h6v6" />
    </svg>
  );
}

function normalizeText(value = '') {
  return value.toLowerCase().trim();
}

function tokenize(value = '') {
  return (
    normalizeText(value)
      .match(/[a-z0-9.+-]+/g)
      ?.filter((token) => token.length > 1 && !commonTerms.has(token)) || []
  );
}

function joinList(items) {
  if (!items.length) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function createMessageId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getProjectSearchText(project) {
  return [
    project.title,
    project.summary,
    project.stack,
    project.cohort,
    project.course,
    project.status,
    ...(project.techStack || []),
    ...(project.tags || []),
    ...(project.collections || []),
    ...(project.problem || []),
    ...(project.solution || []),
    ...(project.innovations || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function includesPattern(project, pattern) {
  return pattern.test(getProjectSearchText(project));
}

function includesTech(project, pattern) {
  return (project.techStack || []).some((item) => pattern.test(item.toLowerCase()));
}

function scoreProject(project, prompt) {
  const promptText = normalizeText(prompt);
  const projectText = getProjectSearchText(project);
  const tokens = tokenize(prompt);
  let score = 0;

  tokens.forEach((token) => {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(`(^|[^a-z0-9])${escapedToken}([^a-z0-9]|$)`, 'i');

    if (expression.test(projectText)) {
      score += token.length > 5 ? 2.4 : 1.6;
    }

    if (project.title.toLowerCase().includes(token)) {
      score += 2.2;
    }
  });

  if (/react|next|vite|frontend|ui/.test(promptText) && includesTech(project, /(react|next|vite|svelte|vue|frontend)/)) {
    score += 4.6;
  }

  if (
    /(data|visual|viz|dashboard|analytics|chart|stream)/.test(promptText) &&
    includesPattern(project, /(data|visual|viz|dashboard|analytics|chart|stream|webgl|d3|grafana)/)
  ) {
    score += 5.1;
  }

  if (
    /(performance|fast|high-performance|real-time|realtime|low-latency)/.test(promptText) &&
    includesPattern(project, /(performance|real time|low-latency|stream|worker|wasm|webgl|fast|gpu)/)
  ) {
    score += 4.8;
  }

  if (
    /(ai|ml|machine learning|model|inference|training)/.test(promptText) &&
    includesPattern(project, /(ai|machine learning|ml|pytorch|inference|training|embedding|model|experiment)/)
  ) {
    score += 5;
  }

  if (
    /(community|collaboration|team|mentor|workflow|operations|coordination)/.test(promptText) &&
    includesPattern(project, /(community|collaboration|team|mentor|workflow|operations|coordination|review)/)
  ) {
    score += 4.2;
  }

  if (/live/.test(promptText) && project.status === 'Live') {
    score += 1.6;
  }

  if (/review/.test(promptText) && project.status === 'In Review') {
    score += 1.6;
  }

  return score;
}

function getFallbackProjects(projects) {
  const fallbackProjects = fallbackProjectSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter(Boolean);

  if (fallbackProjects.length >= 3) {
    return fallbackProjects.slice(0, 3);
  }

  return [...fallbackProjects, ...projects.filter((project) => !fallbackProjects.includes(project))].slice(0, 3);
}

function getTopMatches(projects, prompt) {
  if (!projects.length) {
    return [];
  }

  const rankedProjects = projects
    .map((project) => ({
      project,
      score: scoreProject(project, prompt),
    }))
    .sort((left, right) => right.score - left.score || left.project.title.localeCompare(right.project.title));

  if (!rankedProjects[0]?.score) {
    return getFallbackProjects(projects);
  }

  return rankedProjects.slice(0, 3).map((item) => item.project);
}

function getFocusAreas(prompt) {
  const promptText = normalizeText(prompt);
  const focusAreas = [];

  if (/react|next|frontend|ui/.test(promptText)) {
    focusAreas.push('frontend craft');
  }

  if (/(data|visual|viz|dashboard|analytics|chart|stream)/.test(promptText)) {
    focusAreas.push('data-rich interfaces');
  }

  if (/(performance|fast|real-time|high-performance)/.test(promptText)) {
    focusAreas.push('performance-sensitive engineering');
  }

  if (/(ai|ml|machine learning|model)/.test(promptText)) {
    focusAreas.push('AI-focused workflows');
  }

  if (/(team|collaboration|mentor|workflow|community|operations)/.test(promptText)) {
    focusAreas.push('collaboration systems');
  }

  return focusAreas.slice(0, 2);
}

function buildAssistantCopy(prompt, matches) {
  if (!matches.length) {
    return 'I could not find a perfect match yet, so I pulled in a few strong starting points from the current Codefolio catalog.';
  }

  const focusAreas = getFocusAreas(prompt);
  const countLabel =
    matches.length === 1 ? 'one project' : matches.length === 2 ? 'two projects' : 'three projects';

  if (!focusAreas.length) {
    return `I found ${countLabel} that feel close to your request. These are the strongest matches from the current Codefolio catalog.`;
  }

  return `I found ${countLabel} that line up well with ${joinList(focusAreas)}. Here are the strongest matches from the current Codefolio catalog.`;
}

function createAssistantMessage(prompt, projects, id = createMessageId('assistant')) {
  const matches = getTopMatches(projects, prompt);

  return {
    id,
    role: 'assistant',
    text: buildAssistantCopy(prompt, matches),
    projects: matches,
  };
}

function createSeedConversation(projects) {
  return [
    {
      id: 'seed-user',
      role: 'user',
      text: seedPrompt,
    },
    createAssistantMessage(seedPrompt, projects, 'seed-assistant'),
  ];
}

function ChatWithAiPage({ toAppHref, profile, projects = [] }) {
  const composerInputRef = useRef(null);
  const conversationEndRef = useRef(null);
  const responseTimeoutRef = useRef(null);
  const [composerValue, setComposerValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState(() => createSeedConversation(projects));

  useEffect(() => {
    composerInputRef.current?.focus();
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  }, [messages, isThinking]);

  useEffect(
    () => () => {
      if (responseTimeoutRef.current) {
        window.clearTimeout(responseTimeoutRef.current);
      }
    },
    []
  );

  function focusComposer() {
    composerInputRef.current?.focus();
  }

  function submitPrompt(prompt) {
    const nextPrompt = prompt.trim();

    if (!nextPrompt || isThinking) {
      return;
    }

    if (responseTimeoutRef.current) {
      window.clearTimeout(responseTimeoutRef.current);
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createMessageId('user'),
        role: 'user',
        text: nextPrompt,
      },
    ]);
    setComposerValue('');
    setIsThinking(true);

    responseTimeoutRef.current = window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        createAssistantMessage(nextPrompt, projects),
      ]);
      setIsThinking(false);
      focusComposer();
    }, 720);
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitPrompt(composerValue);
  }

  return (
    <section className="chat-ai-page" aria-labelledby="chat-ai-heading">
      <DashboardHeader
        toAppHref={toAppHref}
        activePath="/dashboard"
        profile={profile}
        navigationItems={chatNavigationItems}
        chatActive
        chatLabel="Chat with AI"
        onChatClick={focusComposer}
      />

      <div className="chat-ai-page__shell">
        <header className="chat-ai-page__hero">
          <span className="chat-ai-page__eyebrow">AI discovery</span>
          <h1 className="chat-ai-page__title" id="chat-ai-heading">
            Chat with Codefolio AI
          </h1>
          <p className="chat-ai-page__copy">
            Describe the kind of project you want and the assistant will surface the closest matches from your catalog.
          </p>
        </header>

        <div className="chat-ai-page__conversation" aria-live="polite" aria-busy={isThinking}>
          {messages.map((message) =>
            message.role === 'user' ? (
              <article key={message.id} className="chat-ai-page__message chat-ai-page__message--user">
                <div className="chat-ai-page__bubble chat-ai-page__bubble--user">
                  <p>{message.text}</p>
                </div>
              </article>
            ) : (
              <article key={message.id} className="chat-ai-page__message chat-ai-page__message--assistant">
                <div className="chat-ai-page__assistant-avatar" aria-hidden="true">
                  <AssistantBadgeIcon />
                </div>

                <div className="chat-ai-page__assistant-panel">
                  <p className="chat-ai-page__assistant-copy">{message.text}</p>

                  {message.projects?.length ? (
                    <div className="chat-ai-page__projects-grid">
                      {message.projects.map((project) => {
                        const projectTags = (project.techStack?.length
                          ? project.techStack
                          : project.tags || []
                        ).slice(0, 2);
                        const visibleTeamMembers = (project.team || []).slice(0, 2);
                        const hiddenTeamCount = Math.max(0, (project.team || []).length - visibleTeamMembers.length);

                        return (
                          <a
                            key={project.slug}
                            className="chat-ai-page__project-card"
                            href={toAppHref(`/projects/${project.slug}`)}
                          >
                            <div className="chat-ai-page__project-media">
                              <img
                                className="chat-ai-page__project-image"
                                src={project.image}
                                alt={project.imageAlt || `${project.title} preview`}
                                loading="lazy"
                              />
                            </div>

                            <div className="chat-ai-page__project-content">
                              <div className="chat-ai-page__project-heading">
                                <h2 className="chat-ai-page__project-title">{project.title}</h2>
                                <ArrowUpRightIcon />
                              </div>

                              <div className="chat-ai-page__project-tags">
                                {projectTags.map((tag) => (
                                  <span key={`${project.slug}-${tag}`} className="chat-ai-page__project-tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="chat-ai-page__project-footer">
                                <div className="chat-ai-page__avatar-stack" aria-label={`${project.title} team`}>
                                  {visibleTeamMembers.map((member) => (
                                    <img
                                      key={`${project.slug}-${member.slug || member.name}`}
                                      className="chat-ai-page__avatar"
                                      src={member.image || '/me.png'}
                                      alt={member.name || 'Contributor'}
                                      loading="lazy"
                                    />
                                  ))}

                                  {hiddenTeamCount ? (
                                    <span className="chat-ai-page__avatar-more">+{hiddenTeamCount}</span>
                                  ) : null}
                                </div>

                                <span className="chat-ai-page__project-status">
                                  {project.cohort || project.status}
                                </span>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          )}

          {isThinking ? (
            <article className="chat-ai-page__message chat-ai-page__message--assistant">
              <div className="chat-ai-page__assistant-avatar" aria-hidden="true">
                <AssistantBadgeIcon />
              </div>

              <div className="chat-ai-page__assistant-panel chat-ai-page__assistant-panel--thinking">
                <div className="chat-ai-page__typing" aria-label="Codefolio AI is thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          ) : null}

          <div ref={conversationEndRef} />
        </div>

        <div className="chat-ai-page__composer-wrap">
          <form className="chat-ai-page__composer" onSubmit={handleSubmit}>
            <input
              ref={composerInputRef}
              className="chat-ai-page__composer-input"
              type="text"
              value={composerValue}
              onChange={(event) => setComposerValue(event.target.value)}
              placeholder="Message Codefolio AI..."
              aria-label="Message Codefolio AI"
              disabled={isThinking}
            />

            <button
              className="chat-ai-page__composer-button"
              type="submit"
              aria-label="Send message"
              disabled={!composerValue.trim() || isThinking}
            >
              <ArrowUpIcon />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ChatWithAiPage;
