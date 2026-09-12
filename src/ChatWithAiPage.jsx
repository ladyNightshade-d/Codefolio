import { useEffect, useRef, useState } from 'react';
import { DashboardHeader } from './DashboardPage.jsx';
import './chat-with-ai.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function sendChatMessage(message, history) {
  const token = sessionStorage.getItem('cf_token');
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI service unavailable.');
  return data.reply;
}

const chatNavigationItems = [
  { label: 'Explore', href: '/dashboard' },
  { label: 'Showcases', href: '/dashboard/showcases' },
  { label: 'Contributors', href: '/dashboard/contributors' },
];

const suggestionItems = [
  'Find React projects',
  'Show AI and ML work',
  'Who works with Python?',
  'Recent hackathon submissions',
  'Projects using Supabase',
  'Find mobile developers',
  'Show infrastructure projects',
  'Who is good at UI design?',
];

function SidebarToggleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-sidebar-toggle__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="6" r="1" fill="currentColor" />
        <circle cx="6" cy="9" r="1" fill="currentColor" />
        <circle cx="6" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function NewChatIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-sidebar__new-chat-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}



function MicIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__mic-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__plus-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__chevron-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__action-icon chat-ai-page__action-icon--light"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.3 1.1 4.4 2.8 5.7L8 16h8l.2-1.3C17.9 13.4 19 11.3 19 9a7 7 0 0 0-7-7z" />
    </svg>
  );
}

function CopilotBrandIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__brand-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function ChatWithAiPage({ toAppHref, profile }) {
  const composerInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [composerValue, setComposerValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Track session-level chat history for the sidebar
  const [sessionChats, setSessionChats] = useState([]);
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'there';

  useEffect(() => {
    composerInputRef.current?.focus();
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Hide global footer on this page
  useEffect(() => {
    const globalFooter = document.querySelector('.site-footer');
    if (globalFooter) globalFooter.style.display = 'none';
    return () => { if (globalFooter) globalFooter.style.display = ''; };
  }, []);

  async function handleSubmit(event) {
    event?.preventDefault();
    const text = composerValue.trim();
    if (!text || isThinking) return;

    // Save first message of each conversation to session history
    if (messages.length === 0) {
      setSessionChats((prev) => {
        const label = text.length > 48 ? text.slice(0, 48) + '…' : text;
        // Avoid duplicates
        if (prev.includes(label)) return prev;
        return [label, ...prev].slice(0, 10);
      });
    }

    const userMessage = { role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setComposerValue('');
    setIsThinking(true);
    setErrorMessage('');

    const history = messages.map((m) => ({ role: m.role, text: m.text }));

    try {
      const reply = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setErrorMessage(err.message);
      setMessages(messages);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSuggestionClick(suggestion) {
    setComposerValue(suggestion);
    composerInputRef.current?.focus();
  }

  function toggleSidebar() { setIsSidebarOpen((o) => !o); }

  function handleNewChat() {
    setMessages([]);
    setErrorMessage('');
    setIsSidebarOpen(false);
    setTimeout(() => composerInputRef.current?.focus(), 100);
  }

  function ComposerBox({ sticky = false }) {
    return (
      <div className={`chat-ai-page__composer-card ${sticky ? 'chat-ai-page__composer-card--sticky' : ''}`}>
        <form className="chat-ai-page__form" onSubmit={handleSubmit}>
          <textarea
            ref={sticky ? undefined : composerInputRef}
            className="chat-ai-page__textarea"
            placeholder="Message Copilot"
            rows={1}
            value={composerValue}
            onChange={(e) => setComposerValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isThinking}
            aria-label="Message input"
          />
          <div className="chat-ai-page__toolbar">
            <div className="chat-ai-page__toolbar-left">
              <button className="chat-ai-page__action-btn" type="button" aria-label="Attach">
                <PlusIcon />
              </button>
              <button className="chat-ai-page__mode-toggle" type="button">
                <span>Smart</span>
                <ChevronDownIcon />
              </button>
            </div>
            <div className="chat-ai-page__toolbar-right">
              <div className="chat-ai-page__brand-pills">
                <LightbulbIcon />
                <CopilotBrandIcon />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <section
      className={`chat-ai-page ${isSidebarOpen ? 'chat-ai-page--sidebar-open' : ''}`}
      aria-labelledby="chat-ai-heading"
    >
      <h1 className="sr-only" id="chat-ai-heading">Chat with Codefolio AI</h1>

      {!isSidebarOpen && (
        <DashboardHeader
          toAppHref={toAppHref}
          activePath="/dashboard"
          profile={profile}
          navigationItems={chatNavigationItems}
          chatActive
          chatLabel="Chat with AI"
        />
      )}

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div className="chat-ai-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`chat-ai-sidebar ${isSidebarOpen ? 'chat-ai-sidebar--open' : ''}`}>
        <div className="chat-ai-sidebar__header">
          <span className="chat-ai-sidebar__brand">Copilot</span>
          <button
            className="chat-ai-sidebar__close"
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          >
            <SidebarToggleIcon />
          </button>
        </div>

        <button className="chat-ai-sidebar__new-chat" type="button" onClick={handleNewChat}>
          <NewChatIcon />
          <span>New chat</span>
        </button>

        <div className="chat-ai-sidebar__recent">
          <h2 className="chat-ai-sidebar__recent-title">Recent</h2>
          <nav className="chat-ai-sidebar__nav" aria-label="Recent chats">
            {sessionChats.length > 0 ? sessionChats.map((chat) => (
              <button
                key={chat}
                className="chat-ai-sidebar__nav-item"
                type="button"
                onClick={() => { handleSuggestionClick(chat); setIsSidebarOpen(false); }}
              >
                {chat}
              </button>
            )) : (
              <p style={{ padding: '12px 16px', color: '#888', fontSize: '0.85rem' }}>
                No recent chats yet.
              </p>
            )}
          </nav>
        </div>
      </aside>

      {/* Sidebar toggle */}
      {!isSidebarOpen && (
        <button
          className="chat-ai-sidebar-toggle"
          type="button"
          aria-label="Open chat history"
          onClick={toggleSidebar}
        >
          <SidebarToggleIcon />
        </button>
      )}

      <div className="chat-ai-page__content">
        {messages.length === 0 ? (
          /* ── Empty / intro state ── */
          <div className="chat-ai-page__intro">
            <h2 className="chat-ai-page__greeting">
              Nice to see you, {firstName}. What&apos;s new?
            </h2>

            <ComposerBox />

            {errorMessage && (
              <p className="chat-ai-page__error" role="alert">{errorMessage}</p>
            )}

            <div className="chat-ai-page__suggestions">
              {suggestionItems.map((item) => (
                <button
                  key={item}
                  className="chat-ai-page__suggestion-pill"
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Active conversation ── */
          <div className="chat-ai-page__conversation">
            <div className="chat-ai-page__messages" aria-live="polite" aria-label="Conversation">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-ai-page__message chat-ai-page__message--${msg.role}`}
                >
                  {msg.role === 'assistant' && (
                    <span className="chat-ai-page__message-avatar" aria-hidden="true">
                      <CopilotBrandIcon />
                    </span>
                  )}
                  <div className="chat-ai-page__message-bubble">
                    {msg.text.split('\n').map((line, j) =>
                      line.trim() ? <p key={j} style={{ margin: '0 0 4px' }}>{line}</p> : <br key={j} />
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="chat-ai-page__message chat-ai-page__message--assistant">
                  <span className="chat-ai-page__message-avatar" aria-hidden="true">
                    <CopilotBrandIcon />
                  </span>
                  <div className="chat-ai-page__thinking" aria-label="Thinking">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {errorMessage && (
                <p className="chat-ai-page__error" role="alert">{errorMessage}</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            <ComposerBox sticky />
          </div>
        )}
      </div>
    </section>
  );
}

export default ChatWithAiPage;

