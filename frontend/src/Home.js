import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaTruckMoving, FaShip, FaChevronRight } from 'react-icons/fa';
import './HomePage.css';

const Home = () => {
  const navigate = useNavigate();

  const styles = {
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    activityCard: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '600px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      marginBottom: '30px',
    },
    timestamp: {
      color: '#aaa',
      marginRight: '10px',
      minWidth: '80px',
    },
    arrow: {
      fontWeight: 'bold',
      color: '#333',
    },
    portCard: {
      backgroundColor: '#0b1543',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Recent Activity */}
      <div style={styles.activityCard}>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>

        <div className="activity-item hover-card" onClick={() => navigate('/seaport')}>
          <span style={styles.timestamp}>2 mins ago</span>
          <span style={{ flex: 1 }}>You uploaded 2 documents to Sea Port</span>
          <span style={styles.arrow}><FaChevronRight size={12} /></span>
        </div>

        <div className="activity-item hover-card" onClick={() => navigate('/landport')}>
          <span style={styles.timestamp}>1 hour ago</span>
          <span style={{ flex: 1 }}>Ahmed reviewed flagged items for land port</span>
          <span style={styles.arrow}><FaChevronRight size={12} /></span>
        </div>

        <div className="activity-item hover-card" onClick={() => navigate('/airport')}>
          <span style={styles.timestamp}>Yesterday</span>
          <span style={{ flex: 1 }}>You uploaded a report to Air Port</span>
          <span style={styles.arrow}><FaChevronRight size={12} /></span>
        </div>
      </div>

      {/* Port Links */}
      <div style={styles.portCard}>
        <div className="port-link hover-card" onClick={() => navigate('/airport')}>
          <span><FaPlane color="white" /></span>
          <span>AIR PORT</span>
          <span><FaChevronRight size={12} /></span>
        </div>
        <div className="port-link hover-card" onClick={() => navigate('/landport')}>
          <span><FaTruckMoving color="white" /></span>
          <span>LAND PORT</span>
          <span><FaChevronRight size={12} /></span>
        </div>
        <div className="port-link hover-card" onClick={() => navigate('/seaport')}>
          <span><FaShip color="white" /></span>
          <span>SEA PORT</span>
          <span><FaChevronRight size={12} /></span>
        </div>
        <div className="port-link hover-card" onClick={() => navigate('/allports')}>
          <span></span>
          <span>ALL PORTS</span>
          <span><FaChevronRight size={12} /></span>
        </div>
      </div>
    </div>
  );
};

export default Home;
