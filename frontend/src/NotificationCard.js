import React from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';

const NotificationCard = ({ title, message, time, onClose }) => {
  return (
    <div className="notification-item">
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '12px', color: '#aaa' }}>{time}</div>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0b1543', 
            cursor: 'pointer', 
            fontSize: '14px',
            marginTop: '4px'
          }}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
