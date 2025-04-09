import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaUpload, FaChartBar, FaChartLine,
  FaRobot, FaUser
} from 'react-icons/fa';
import './HomePage.css'; // Optional for hover/tooltip styling

const HomePage = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      {/* Top Header */}
      <div style={styles.topHeader}>
        <div style={styles.leftSection}>
          <div style={styles.logoBox}>
            <img src="/assets/logo22.png" alt="25 Years" style={styles.logo} />
          </div>
          <div style={styles.title}>
            <div>KINGDOM OF BAHRAIN</div>
            <div>MINISTRY OF INTERIOR</div>
            <div>CUSTOMS AFFAIRS</div>
          </div>
          <div style={styles.logoBox}>
            <img src="/assets/logo11.png" alt="Customs Logo" style={styles.logo} />
          </div>
          <div style={styles.logoBox}>
            <img src="/assets/logo3.png" alt="Police Logo" style={styles.logo} />
          </div>
        </div>
        <div style={styles.languageSwitch}>
          <span>Ar</span>
          <span style={{ margin: '0 5px' }}>|</span>
          <span>Eng</span>
        </div>
      </div>

      {/* Bottom Nav Header */}
      <div style={styles.bottomHeader}>
        <div style={styles.navLinks}>
          <div className="nav-item" onClick={() => navigate('/')}>
            <FaHome /> Home
          </div>
          <div className="nav-item" onClick={() => navigate('/upload')}>
            <FaUpload /> Upload
          </div>
          <div className="nav-item" onClick={() => navigate('/activities')}>
            <FaChartBar /> Activities
          </div>
          <div className="nav-item" onClick={() => navigate('/visualization')}>
            <FaChartLine /> Visualization
          </div>
          <div className="nav-item chatbot-tooltip" onClick={() => navigate('/Chatbot')}>
            <FaRobot />
            <span className="tooltip-text">Chatbot</span>
          </div>
        </div>
        <div style={styles.rightTools}>
          <input type="text" placeholder="Search..." style={styles.search} />
          <div style={styles.profileIcon}><FaUser /></div>
        </div>
      </div>

      {/* Routed Page Content */}
      <section style={styles.bodySection}>
      
        {children}
      </section>

      {/* Footer */}
      <footer style={styles.footer}></footer>

      {/* Floating Chatbot Button */}
      <div
        style={styles.chatbotButton}
        className="chatbot-button"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <FaRobot style={{ marginRight: '6px' }} />
        Customs Bot
        <span style={{ marginLeft: '4px' }}>{chatOpen ? '⌄' : '⌃'}</span>
      </div>

      {chatOpen && (
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>Customs Bot</div>
          <div style={styles.chatMessages}>
            <p><strong>Bot:</strong> Hello! How can I help you today?</p>
          </div>
          <div style={styles.chatInputArea}>
            <input type="text" placeholder="Type a message..." style={styles.chatInput} />
            <button style={styles.chatSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  topHeader: {
    backgroundColor: '#0b1543',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 30px',
    alignItems: 'center',
  },
  leftSection: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '15px',
  },
  logoBox: {
    marginRight: '15px',
    backgroundColor: '#0b1543',
    borderRadius: '6px',
  },
  logo: {
    width: '50px',
    height: '50px',
  },
  title: {
    fontSize: '14px',
    lineHeight: '1.2',
  },
  languageSwitch: {
    fontSize: '14px',
  },
  bottomHeader: {
    backgroundColor: '#c7a349',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 30px',
  },
  navLinks: {
    display: 'flex',
    gap: '25px',
    fontWeight: 'bold',
    alignItems: 'center',
    cursor: 'pointer',
  },
  rightTools: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  search: {
    padding: '8px 12px',
    borderRadius: '20px',
    border: 'none',
    outline: 'none',
  },
  profileIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#0b1543',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  bodySection: {
    flex: 1,
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#0b1543',
    padding: '10px 0',
    width: '100%',
    position: 'relative',
    marginTop: 'auto',
  },
  chatbotButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#c7a349',
    color: 'white',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 100,
  },
  chatPanel: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    width: '300px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 200,
  },
  chatHeader: {
    backgroundColor: '#0b1543',
    color: '#fff',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  chatMessages: {
    padding: '12px',
    height: '200px',
    overflowY: 'auto',
    fontSize: '14px',
  },
  chatInputArea: {
    display: 'flex',
    borderTop: '1px solid #ccc',
  },
  chatInput: {
    flex: 1,
    border: 'none',
    padding: '10px',
    fontSize: '14px',
    outline: 'none',
  },
  chatSend: {
    backgroundColor: '#c7a349',
    border: 'none',
    color: 'white',
    padding: '0 16px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default HomePage;

