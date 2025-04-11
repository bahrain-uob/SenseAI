
import React from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationCard = ({ title, message, time,onClose }) => {
     
    return (
        <div
          style={{
            backgroundColor:  '#f9f9f9',
            padding: '12px 16px',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor =  '#b59036')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor =  '#f9f9f9' )}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'transparent',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '20px',
              color: '#999',
              cursor: 'pointer',
            }}
            title="Dismiss"
          >
            ×
          </button>
    
          {/* Icon and Content */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <FaBell size={20} color="#f4b400" style={{ marginTop: '3px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '14px', color: '#333' }}>{message}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap' }}>{time}</div>
          </div>
        </div>
      );
  };
  


export default NotificationCard;
