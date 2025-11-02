import { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ onUserMessage, onResultClick, onClose, onReady }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hi! I'm Ryna, your AI real estate assistant. I can help you find properties, answer questions about pricing, and guide you through your property search. What are you looking for today?" 
    }
  ]);
  const messagesEndRef = useRef(null);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Expose the addMessage function to parent when ready so App can push messages
  useEffect(() => {
    if (typeof onReady === 'function') onReady(addMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    addMessage({ sender: 'user', text: input });
    onUserMessage(input, addMessage);
    setInput('');
  };

  return (
    <div className="chat-panel" style={{ width: '100%', height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar" aria-hidden />
          <div>
            <div className="chat-title">Ryna - Real Estate Assistant</div>
            <div className="chat-sub">Your AI property specialist</div>
          </div>
        </div>
        <div className="chat-header-actions">
          {onClose && (
            <button onClick={onClose} className="chat-close" aria-label="Close chat">✕</button>
          )}
        </div>
      </div>
      <div className="chat-panel-messages" role="log" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-row ${msg.sender === 'user' ? 'chat-row-user' : 'chat-row-bot'}`}>
            {msg.type === 'result' ? (
              <div className="chat-result">
                {msg.image ? <img src={msg.image} alt={msg.title || 'property'} className="result-thumb" /> : <div className="result-thumb" />}
                <div className="result-meta">
                  <div className="result-title">{msg.title || msg.text}</div>
                  <div className="result-location">{msg.location || ''}</div>
                  <div className="result-price">{msg.price ? `₹${msg.price.toLocaleString()}` : ''}</div>
                  <div className="result-actions"><button onClick={() => onResultClick && onResultClick(msg.propertyId)} className="action-btn save-btn">View property</button></div>
                </div>
              </div>
            ) : (
              <div className="chat-message">
                <div className="chat-message-avatar" aria-hidden>{msg.sender === 'user' ? '🧑' : '🤖'}</div>
                <div className="chat-message-body">
                  <div className={`msg-bubble ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`}>{msg.text}</div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="suggestions">
                      {msg.suggestions.map((s, idx) => (
                        <button key={idx} onClick={() => onUserMessage(typeof s === 'string' ? s : s.text, addMessage)} className="action-btn" style={{ background: '#666', color: '#fff' }}>{typeof s === 'string' ? s : s.label || s.text}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row">
        <input className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask me about properties or type 'guided'" />
        <button className="chat-send-btn" onClick={sendMessage} aria-label="Send message">Send</button>
      </div>
    </div>
  );
}
