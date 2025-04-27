import React, { useState,useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome, FaUpload, FaChartBar, FaChartLine,
  FaRobot, FaUser, FaAngleUp, FaAngleDown,FaSignOutAlt,
} from 'react-icons/fa';
import './HomePage.css'; 
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';




const HomePage = ({ children }) => {
  
  const [chatOpen, setChatOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  const navigate = useNavigate();
  const { t } = useTranslation();
 
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
      <div
        style={styles.chatbotButton}
        className="chatbot-button"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <FaRobot style={{ marginRight: '6px' }} />
       {t('customsBot')}
        <span style={{ marginLeft: '4px' }}>{chatOpen ? <FaAngleDown/> : <FaAngleUp/>}</span>
      </div>

      {chatOpen && (
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>{t('customsBot')}</div>
          <div style={styles.chatMessages}>
            <p><strong>Bot:</strong> Hello! How can I help you today?</p>
          </div>
          <div style={styles.chatInputArea}>
            <input type="text" placeholder={t('messege')} style={styles.chatInput} />
            <button style={styles.chatSend}>{t('send')}</button>
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

