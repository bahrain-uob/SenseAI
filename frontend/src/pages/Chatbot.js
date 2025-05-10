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

    setTimeout(() => {
      let botReply = {
        text:
          'To generate a report:\n1. Select a type\n2. Pick a date range\n3. Click generate\n4. Download the PDF',
        sender: 'bot'
      };

      if (['hi', 'hello'].some(g => lower.includes(g))) {
        botReply = {
          text:
            'Nice to meet you! 😊\nI can help you generate reports, check uploads, and more.\nWhat would you like to do?',
          sender: 'bot'
        };
      } else {
        for (const rule of mockCustomsResponses) {
          if (rule.keywords.some(k => lower.includes(k))) {
            botReply = { text: rule.reply, sender: 'bot' };
            break;
          }
        }
      }

      const finalMessages = [...updatedMessages, botReply];
      const updated = {
        ...sessions,
        [activeSessionId]: {
          ...sessions[activeSessionId],
          messages: finalMessages
        }
      };
      saveSessions(updated);
      setTyping(false);
    }, 800);
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
