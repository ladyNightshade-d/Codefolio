import { useState, useRef, useEffect } from "react";

const recentSyncs = ["Model Optimization Logic", "Database Schema Design", "Auth Flow Diagram"];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Neural link established. System data synced. How can I assist with your nodes today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are Korvex AI, an intelligent assistant for the Korvex project management platform used by Rwanda Coding Academy students. Help users with their coding projects, give technical advice, suggest improvements, and answer questions about their projects. Keep responses concise and technical. Use a slightly futuristic, professional tone.",
          messages: [
            ...messages.filter((m, idx) => idx > 0).map(m => ({
              role: m.role === "bot" ? "assistant" : "user",
              content: m.text
            })),
            { role: "user", content: userMsg }
          ]
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Connection lost. Please retry.";
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Neural link disrupted. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content ai-page">
      <div className="page-header-bar">
        <span className="view-mode-tag">VIEW_MODE: AI // ACCESS_GRANTED</span>
        <div className="header-orb" />
      </div>

      <div className="ai-layout">
        <div className="ai-main">
          <h1 className="page-title centered">AI Assistant</h1>

          <div className="chat-window">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role === "bot" ? "bot-msg" : "user-msg"}`}>
                {m.role === "bot" && <span className="bot-label">🤖 BOT</span>}
                <p className="msg-text">{m.text}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot-msg">
                <span className="bot-label">🤖 BOT</span>
                <p className="msg-text typing">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <span className="chat-sparkle">✨</span>
            <input
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask Korvex AI anything..."
            />
            <button className="chat-send-btn" onClick={sendMessage}>➤</button>
          </div>
        </div>

        <div className="ai-sidebar">
          <h3 className="sidebar-title">🕐 Recent Syncs</h3>
          {recentSyncs.map((s, i) => (
            <div key={i} className="sync-item">{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}