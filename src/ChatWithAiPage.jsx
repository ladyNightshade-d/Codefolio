import { useEffect, useRef, useState } from 'react';
import { DashboardHeader } from './DashboardPage.jsx';
import './chat-with-ai.css';

const chatNavigationItems = [
  { label: 'Explore', href: '/dashboard' },
  { label: 'Showcases', href: '/dashboard/showcases' },
  { label: 'Contributors', href: '/dashboard/contributors' },
];

const suggestionItems = [
  'Create an image',
  'Find the best deal',
  'Predict the future',
  'Take a quiz',
  'Improve writing',
  'Pick a superpower',
  'Write a joke',
  'Get advice',
];

// Removed hardcoded recentChats array

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

function ArrowUpIcon() {
  return (
    <svg
      aria-hidden="true"
      className="chat-ai-page__send-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m5 12 7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19V5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

function ThumbsUpIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3M14 10V4.5a2.5 2.5 0 0 0-5 0V10a2 2 0 0 1-2 2H7v10h10.7a2 2 0 0 0 2-1.5l1.3-6a2 2 0 0 0-2-2.5H14Z" /></svg>; }
function ThumbsDownIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 2H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3M10 14v5.5a2.5 2.5 0 0 0 5 0V14a2 2 0 0 1 2-2h0v-10h-10.7a2 2 0 0 0-2 1.5l-1.3 6a2 2 0 0 0 2 2.5H10Z" /></svg>; }
function ShareIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>; }
function CopyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>; }
function VolumeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>; }
function ReloadIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function formatAiMessage(text) {
  if (!text) return '';
  
  // 1. Escape HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Format basic markdown
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>');

  // 3. Wrap adjacent list items in <ul>
  html = html.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');

  // 4. Handle line breaks (only outside lists to avoid extra spacing)
  html = html.replace(/\n(?!<li|<\/ul|<ul>)/g, '<br />');

  return html;
}

function ChatWithAiPage({ toAppHref, profile }) {
  const composerInputRef = useRef(null);
  const [composerValue, setComposerValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'MANZI';

  useEffect(() => {
    composerInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Force hide global footer if it exists
    const globalFooter = document.querySelector('.site-footer');
    if (globalFooter) {
       globalFooter.style.display = 'none';
    }

    // Fetch recent chats
    if (profile?.id) {
      const token = localStorage.getItem('codefolio_token');
      fetch(`http://localhost:5000/api/ai/recent/${profile.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setRecentChats(data))
        .catch(err => console.error('Error fetching recents:', err));
    }

    return () => {
       if (globalFooter) {
          globalFooter.style.display = 'block';
       }
    };
  }, [profile?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!composerValue.trim()) return;

    const userMessage = { role: 'user', text: composerValue };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setComposerValue('');
    setIsThinking(true);

    try {
      const token = localStorage.getItem('codefolio_token');
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: nextMessages, userId: profile?.id }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
        // Refresh recents
        if (profile?.id) {
          const recentsRes = await fetch(`http://localhost:5000/api/ai/recent/${profile.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (recentsRes.ok) {
            const recentsData = await recentsRes.json();
            setRecentChats(recentsData);
          }
        }
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', text: "Connection error. Make sure the server is running." }]);
    } finally {
      setIsThinking(false);
    }
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function handleNewChat() {
    setMessages([]);
    setIsSidebarOpen(false);
  }

  async function handleLoadChat(chatTitle) {
    if (!profile?.id) return;
    setIsThinking(true);
    setIsSidebarOpen(false);
    try {
      const token = localStorage.getItem('codefolio_token');
      const response = await fetch(`http://localhost:5000/api/ai/history/${profile.id}?query=${encodeURIComponent(chatTitle)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const history = await response.json();
        // Convert DB messages to local state format
        setMessages(history.map(m => ({ role: m.role, text: m.content })));
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <section className={`chat-ai-page ${isSidebarOpen ? 'chat-ai-page--sidebar-open' : ''}`} aria-labelledby="chat-ai-heading">
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

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="chat-ai-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`chat-ai-sidebar ${isSidebarOpen ? 'chat-ai-sidebar--open' : ''}`}>
        <div className="chat-ai-sidebar__header">
          <span className="chat-ai-sidebar__brand">Copilot</span>
          <button className="chat-ai-sidebar__close" onClick={() => setIsSidebarOpen(false)}>
            <SidebarToggleIcon />
          </button>
        </div>

        <button className="chat-ai-sidebar__new-chat" onClick={handleNewChat}>
          <NewChatIcon />
          <span>New chat</span>
        </button>

        <div className="chat-ai-sidebar__recent">
          <h3 className="chat-ai-sidebar__recent-title">Recent</h3>
          <nav className="chat-ai-sidebar__nav">
             {recentChats.map((chat, idx) => (
               <button 
                 key={`${chat}-${idx}`} 
                 className="chat-ai-sidebar__nav-item"
                 onClick={() => handleLoadChat(chat)}
               >
                 {chat}
               </button>
             ))}
          </nav>
        </div>
      </aside>

      {/* Sidebar Toggle Button (floating when sidebar is closed) */}
      {!isSidebarOpen && (
        <button className="chat-ai-sidebar-toggle" onClick={toggleSidebar}>
          <SidebarToggleIcon />
        </button>
      )}

      <div className="chat-ai-page__content">
        {messages.length === 0 ? (
          <div className="chat-ai-page__intro">
            <h1 className="chat-ai-page__greeting">
              Nice to see you, {firstName}. What&apos;s new?
            </h1>

            <div className="chat-ai-page__composer-card">
              <form className="chat-ai-page__form" onSubmit={handleSubmit}>
                <textarea
                  ref={composerInputRef}
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
                />

                <div className="chat-ai-page__toolbar">
                  <div className="chat-ai-page__toolbar-left">
                    <button className="chat-ai-page__action-btn" type="button">
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
                    <button 
                      className={`chat-ai-page__send-btn ${composerValue.trim() ? 'chat-ai-page__send-btn--active' : ''}`} 
                      type="submit"
                      disabled={!composerValue.trim() || isThinking}
                    >
                      <ArrowUpIcon />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="chat-ai-page__suggestions">
              {suggestionItems.map((item) => (
                <button
                  key={item}
                  className="chat-ai-page__suggestion-pill"
                  type="button"
                  onClick={() => setComposerValue(item)}
                >
                  {item}
                </button>
              ))}
            </div>

          </div>
        ) : (
          <div className="chat-ai-page__conversation">
             <div className="chat-ai-page__divider">
               <span>Today</span>
             </div>

             {messages.map((msg, i) => (
                 <div key={i} className={`chat-ai-page__message-row ${msg.role}-row`}>
                     <div 
                        className={`chat-ai-page__message ${msg.role}`}
                        dangerouslySetInnerHTML={{ __html: formatAiMessage(msg.text) }}
                     />
                     {msg.role === 'assistant' && (
                       <div className="chat-ai-page__message-actions">
                         <button type="button" aria-label="Like"><ThumbsUpIcon /></button>
                         <button type="button" aria-label="Dislike"><ThumbsDownIcon /></button>
                         <button type="button" aria-label="Share"><ShareIcon /></button>
                         <button type="button" aria-label="Copy"><CopyIcon /></button>
                         <button type="button" aria-label="Listen"><VolumeIcon /></button>
                         <button type="button" aria-label="Reload"><ReloadIcon /></button>
                         <button type="button" aria-label="Edit"><EditIcon /></button>
                         <span className="chat-ai-page__action-text">Edit in a page</span>
                       </div>
                     )}
                 </div>
             ))}
             {isThinking && <div className="chat-ai-page__thinking">Thinking...</div>}
             
             {/* Sticky input for follow-ups */}
             <div className="chat-ai-page__composer-card chat-ai-page__composer-card--sticky">
                <form className="chat-ai-page__form" onSubmit={handleSubmit}>
                    <textarea
                        className="chat-ai-page__textarea"
                        placeholder="Message Copilot"
                        rows={1}
                        value={composerValue}
                        onChange={(e) => setComposerValue(e.target.value)}
                    />
                    <div className="chat-ai-page__toolbar">
                        <div className="chat-ai-page__toolbar-left">
                            <button className="chat-ai-page__action-btn" type="button"><PlusIcon /></button>
                        </div>
                        <div className="chat-ai-page__toolbar-right">
                             <button 
                               className={`chat-ai-page__send-btn ${composerValue.trim() ? 'chat-ai-page__send-btn--active' : ''}`} 
                               type="submit"
                               disabled={!composerValue.trim() || isThinking}
                             >
                               <ArrowUpIcon />
                             </button>
                        </div>
                    </div>
                </form>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ChatWithAiPage;

