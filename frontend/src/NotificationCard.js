import React from 'react';
import { FaTimes } from 'react-icons/fa';

const NotificationCard = ({ title, title2, message, time, onClose, variant }) => {
  return (
    <div className={`notification-item ${variant}`}>
      <div className="notification-content">
        <div className="notification-title">
          <strong>{title}</strong>
          {title2 && <span style={{ marginLeft: '8px', fontWeight: 500, color: '#555' }}>{title2}</span>}
        </div>
        <div className="notification-message">{message}</div>
      </div>
      <div className="notification-meta" style={{ marginLeft: 'auto', textAlign: 'right' }}>
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
