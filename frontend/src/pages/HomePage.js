import React, { useState,useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  FaHome, FaUpload, FaChartBar, FaChartLine,
  FaRobot, FaUser, FaAngleUp, FaAngleDown,FaSignOutAlt,
} from 'react-icons/fa';
import './HomePage.css'; 
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';




const HomePage = ({ children }) => {
  
  const [chatOpen, setChatOpen] = useState(false);
  const [miniChatMessages, setMiniChatMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" }
  ]);
  const [miniInput, setMiniInput] = useState('');
  const [miniTyping, setMiniTyping] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isBotPage = location.pathname === '/pages/Chatbot';
  useEffect(() => {
    const saved = localStorage.getItem("chat-mini-history");
    if (saved) {
      setMiniChatMessages(JSON.parse(saved));
    }
  }, []);
  
  // Save history every time it changes
  useEffect(() => {
    localStorage.setItem("chat-mini-history", JSON.stringify(miniChatMessages));
  }, [miniChatMessages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMiniSend = async () => {
    const input = miniInput.trim();
    if (!input) return;

    const updated = [...miniChatMessages, { text: input, sender: 'user' }];
    setMiniChatMessages(updated);
    setMiniTyping(true);
    setMiniInput('');

    try {
      const res = await fetch('https://xu9hwa7e40.execute-api.eu-west-1.amazonaws.com/prod/chatbedrock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();
      const reply = data.answer || "I'm sorry, I couldn't understand that.";

      setMiniChatMessages([...updated, { text: reply, sender: 'bot' }]);
    } catch (err) {
      console.error("MiniBot API Error:", err);
      setMiniChatMessages([...updated, {
        text: "Error: Unable to reach the assistant.",
        sender: 'bot'
      }]);
    } finally {
      setMiniTyping(false);
    }
  };
 
  return (
    <div style={styles.wrapper}>

      {/* Top Header */}
      <div style={styles.topHeader}>
        <div style={styles.leftSection}>
          <div style={styles.logoBox}>
            <img src="/assets/logo22.png" alt="25 Years" style={styles.logo} />
          </div>
          <div style={styles.title}>
            <div>{t('kingdom')}</div>
            <div>{t('ministry')}</div>
            <div>{t('customsAffairs')}</div>
          </div>
          <div style={styles.logoBox}>
            <img src="/assets/logo11.png" alt="Customs Logo" style={styles.logo} />
          </div>
          <div style={styles.logoBox}>
            <img src="/assets/logo3.png" alt="Police Logo" style={styles.logo} />
          </div>
        </div>

        {/*profile and languch part */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
  <div
    style={styles.profileWithLanguage}
    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
  >
    <FaUser style={{ marginRight: '8px' }} />
    <span style={{ color: 'white', fontWeight: 'bold' }}>{t('languch')}</span>
  </div>

  {showLanguageDropdown && (
    <div
    style={{
      ...styles.languageDropdownBase,
      ...(showLanguageDropdown
        ? styles.languageDropdownVisible
        : styles.languageDropdownHidden)
    }}
  >
      <div
        style={styles.langOption}
        onClick={() => {
          i18n.changeLanguage('ar');
          setShowLanguageDropdown(false); //close dropdown
          }
        }
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b59036'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        bh <span style={{ marginLeft: 8 }}>{t('arabic')}</span>
      </div>
      <div
        style={styles.langOption}
        onClick={() => {
          i18n.changeLanguage('en');
          setShowLanguageDropdown(false); //  close dropdown
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b59036'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        🇺🇸 <span style={{ marginLeft: 8 }}>{t('english')}</span>
      </div>

      <div
  style={styles.langOption}
  onClick={() =>{ 
    navigate('/logIn')
    console.log('Signed out');
    setShowLanguageDropdown(false);
  }
} // Replace with real sign-out logic later
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b59036'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>
  <FaSignOutAlt/> <span style={{ marginLeft: 8 }}>{t('signout')}</span>
</div>

    </div>
  )}
</div>
{/** */}
      </div>

      {/* Bottom Nav Header */}
      <div style={styles.bottomHeader}>
        <div style={styles.navLinks}>
          <div className="nav-item" onClick={() => navigate('/')}>
            <FaHome /> {t('home')}
          </div>
          <div className="nav-item" onClick={() => navigate('/pages/upload')}>
            <FaUpload /> {t('upload')}
          </div>
          <div className="nav-item" onClick={() => navigate('/pages/activities')}>
            <FaChartBar /> {t('activities')}
          </div>
          <div className="nav-item" onClick={() => navigate('/pages/auditing')}>
            <FaChartLine /> {t('Auditing')}
          </div>
          <div className="nav-item chatbot-tooltip" onClick={() => navigate('/pages/Chatbot')}>
            <FaRobot />
            <span className="tooltip-text">{t('chatbot')}</span>
          </div>
        </div>
        <div style={styles.rightTools}>
          <input type="text" placeholder={t('search')} style={styles.search} />
          
        </div>
      </div>

      {/* Routed Page Content */}
      <section style={styles.bodySection}>
      
        {children}
      </section>

      {/* Footer */}
      <footer style={styles.footer}></footer>

      {/* Floating Chatbot Button */}
      {!isBotPage && (
        <>
          <div
            className="chatbot-button"
            onClick={() => setChatOpen(!chatOpen)}
          >
            <FaRobot style={{ marginRight: '6px' }} />
            {t('customsBot')}
            <span style={{ marginLeft: '4px' }}>
              {chatOpen ? <FaAngleDown /> : <FaAngleUp />}
            </span>
          </div>

          {chatOpen && (
            <div className="chat-panel">
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px' }}>
                <button
                  onClick={() => {
                    const fresh = [{ text: 'Hello! How can I help you today?', sender: 'bot' }];
                    setMiniChatMessages(fresh);
                    localStorage.setItem("chat-mini-history", JSON.stringify(fresh));
                  }}
                  style={{
                    backgroundColor: '#eee',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  + New Chat
                </button>
              </div>
              <div className="chat-header">{t('customsBot')}</div>
              <div className="chat-messages">
                {miniChatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-bubble ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}
                  >
                    {msg.text}
                  </div>
                ))}
                {miniTyping && (
                  <div className="message-bubble bot-message">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                )}
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder={t('messege')}
                  className="chat-input"
                  value={miniInput}
                  onChange={(e) => setMiniInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMiniSend()}
                />
                <button className="chat-send" onClick={handleMiniSend}>
                  {t('send')}
                </button>
              </div>
            </div>
          )}
        </>
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
  languageSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    padding: '6px 12px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  
  langButton: {
    backgroundColor: '#fff',
    color: '#0b1543',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  
  langButtonHover: {
    backgroundColor: '#c7a349',
    color: 'white',
  },
  profileWithLanguage: {
    backgroundColor: '#c7a349',
    borderRadius: '20px',
    padding: '8px 16px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    fontSize: '14px',
  },
  

  languageDropdownBase: {
    position: 'absolute',
    top: '45px',
    right: 0,
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 999,
    width: '150px',
    transition: 'all 0.3s ease',
  },
  
  languageDropdownHidden: {
    opacity: 0,
    transform: 'translateY(-10px)',
    pointerEvents: 'none',
  },
  
  languageDropdownVisible: {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto',
  },
  
  langOption: {
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    transition: 'background-color 0.3s ease',
  }

};

export default HomePage;



