import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, sender: 'user' }];

    // Example bot reply (you can replace with actual logic)
    const botReply = {
      text:
        'To generate a report:\n1- Select a type\n2- Pick a date range\n3- Click generate\n4- Download the PDF',
      sender: 'bot'
    };

    setMessages([...newMessages, botReply]);
    setInput('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <span className="chatbot-icon">🤖</span> Customs Bot
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        ))}
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
  );
};

export default Chatbot;
