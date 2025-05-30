import React, { useState, useEffect, useRef } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import './Chatbot.css';

const getTimestamp = () => new Date().toLocaleString();

const mockCustomsResponses = [
  {
    keywords: ['tax', 'duty'],
    reply: 'Import duties vary based on item type and origin. For general goods, the rate is 5%.'
  },
  {
    keywords: ['restricted', 'prohibited'],
    reply: 'Restricted items include firearms, narcotics, and counterfeit goods. Special permits are required.'
  },
  {
    keywords: ['documents', 'paperwork'],
    reply: 'You need a commercial invoice, packing list, bill of lading, and import license if applicable.'
  },
  {
    keywords: ['clearance'],
    reply: 'Customs clearance typically takes 1–3 business days if all documents are correct.'
  }
];

const Chatbot = () => {
  const messagesEndRef = useRef(null);

  const [sessions, setSessions] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('chat-sessions') || '{}');
  
    // ✅ One-time: Import mini chat history if no session exists yet
    if (Object.keys(saved).length === 0) {
      const mini = JSON.parse(localStorage.getItem('chat-mini-history') || '[]');
      if (mini.length > 0) {
        const id = Date.now().toString();
        saved[id] = {
          id,
          title: `Mini Chat Backup`,
          messages: mini,
        };
        localStorage.setItem('chat-sessions', JSON.stringify(saved));
      }
    }
  
    return saved;
  });
  
  

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const keys = Object.keys(sessions);
    return keys.length ? keys[0] : null;
  });

  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');

  const currentMessages = sessions[activeSessionId]?.messages || [];

  const saveSessions = (updated) => {
    localStorage.setItem('chat-sessions', JSON.stringify(updated));
  
    // ✅ Sync the current session to the mini chat history
    const active = updated[activeSessionId];
    if (active && active.messages) {
      localStorage.setItem('chat-mini-history', JSON.stringify(active.messages));
    }
  
    setSessions(updated);
  };
  

  const startNewChat = () => {
    const id = Date.now().toString();
    const newSession = {
      id,
      title: `Chat @ ${getTimestamp()}`,
      messages: [
        { text: 'Hello! 👋 How can I help you today? Type a message below to get started.', sender: 'bot' }
      ]
    };
    const updated = { ...sessions, [id]: newSession };
    saveSessions(updated);
    setActiveSessionId(id);
  };

  const deleteSession = (id) => {
    const updated = { ...sessions };
    delete updated[id];
    saveSessions(updated);
    if (activeSessionId === id) {
      const remainingKeys = Object.keys(updated);
      setActiveSessionId(remainingKeys[0] || null);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeSessionId) return;

    const lower = input.toLowerCase();
    const userMessage = { text: input, sender: 'user' };
    const updatedMessages = [...currentMessages, userMessage];

    setInput('');
    setTyping(true);

    (async () => {
      try {
        const res = await fetch('https://xu9hwa7e40.execute-api.eu-west-1.amazonaws.com/prod/chatbedrock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input })
        });
    
        const data = await res.json();
    
        const botReply = {
          text: data.answer || "I'm sorry, I couldn't understand that.",
          sender: 'bot'
        };
    
        const finalMessages = [...updatedMessages, botReply];
        const updated = {
          ...sessions,
          [activeSessionId]: {
            ...sessions[activeSessionId],
            messages: finalMessages
          }
        };
        saveSessions(updated);
      } catch (err) {
        const errorReply = {
          text: 'Error: Unable to reach the assistant. Please try again later.',
          sender: 'bot'
        };
    
        const finalMessages = [...updatedMessages, errorReply];
        const updated = {
          ...sessions,
          [activeSessionId]: {
            ...sessions[activeSessionId],
            messages: finalMessages
          }
        };
        saveSessions(updated);
        console.error('Bedrock API error:', err);
      } finally {
        setTyping(false);
      }
    })();
    
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, typing]);

  useEffect(() => {
    if (!activeSessionId && Object.keys(sessions).length === 0) {
      startNewChat();
    }
  }, []);

  return (
    <div className="chatbot-wrapper">
      <aside className="chat-sidebar">
        <div className="sidebar-header">Chat History</div>
        <button className="new-chat" onClick={startNewChat}>+ New Chat</button>
        <ul className="session-list">
          {Object.entries(sessions).map(([id, session]) => (
            <li key={id} className={id === activeSessionId ? 'active' : ''}>
              <span onClick={() => setActiveSessionId(id)}>{session.title}</span>
              <button className="delete-btn" onClick={() => deleteSession(id)} title="Delete chat">
                <FaTrashAlt />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="chatbot-container">
        <div className="chatbot-header">
          <span className="chatbot-icon">🤖</span> Customs Bot
        </div>
        <div className="chatbot-messages">
          {currentMessages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          ))}
          {typing && (
            <div className="message bot typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;