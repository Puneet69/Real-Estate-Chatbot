import { useState, useEffect, useRef } from 'react';

export default function ChatPanel({ onUserMessage }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    addMessage({ sender: 'user', text: input });
    onUserMessage(input, addMessage);
    setInput('');
  };

  return (
    <div style={{
      width: '400px',
      height: '600px',
      border: '1px solid #333',
      borderRadius: '10px',
      background: '#222',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: '10px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            margin: '8px 0'
          }}>
            <span style={{
              backgroundColor: msg.sender === 'user' ? '#4caf50' : '#555',
              padding: '8px',
              borderRadius: '8px',
              display: 'inline-block',
              maxWidth: '80%'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{
        padding: '10px',
        borderTop: '1px solid #444',
        display: 'flex'
      }}>
        <input
          style={{
            flexGrow: 1,
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none'
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me about properties..."
          autoFocus
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: '#4caf50',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
