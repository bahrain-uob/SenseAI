import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaTruckMoving, FaShip, FaChevronRight, FaSyncAlt,FaExclamationTriangle,FaChartLine,FaBell } from 'react-icons/fa';
import './Home.css';
import { useTranslation } from 'react-i18next';
import NotificationCard from '../NotificationCard';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Upload Complete', message: 'Your file has been successfully uploaded to Sea Port.', time: 'Just now' },
    { id: 2, title: 'Report Reviewed', message: 'Your flagged items were reviewed by Ahmed.', time: '5 min ago' },
    { id: 3, title: 'Login Success', message: 'You logged in from a new device.', time: '1 hour ago' },
    { id: 4, title: 'Login Success', message: 'You logged in from a new device.', time: '1 hour ago' },
  ]);

  const [highRiskTransactions, setHighRiskTransactions] = useState([
    { id: 'TRX1345', risk: 92, level: 'Critical', port: 'Khalifa Bin Salman Port', pending: '10 days' },
    { id: 'TRX6722', risk: 85, level: 'High', port: 'Khalifa Bin Salman Port', pending: '5 days' },
    { id: 'TRX9102', risk: 67, level: 'Medium', port: 'King Fahd Causeway ', pending: '3 days' },
    { id: 'TRX4678', risk: 45, level: 'Low', port: 'Bahrain International Airport', pending: '1 day' },
    { id: 'TRX2746', risk: 40, level: 'Low', port: 'King Fahd Causeway ', pending: '1 day' },
  ]);

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleRefresh = () => {
    const shuffled = [...highRiskTransactions].sort(() => Math.random() - 0.5);
    setHighRiskTransactions(shuffled);
  };

  return (
    <>
     <div 
  className="banner"
  style={{ 
    backgroundImage: "url('/assets/customs.png')", 
    backgroundSize: "cover", 
    backgroundPosition: "center",
    height: "290px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white"
  }}
>
  <div className="banner-overlay">
    <h1>SenseAI</h1>
    <p>{t('customsAffairs')}</p>
  </div>
</div>


      {/* Dashboard */}
      <div className="dashboard-container">
        <div className="main-grid">
          
          {/* Left Column */}
          <div className="left-column">

            {/* High Risk Transactions */}
            <div className="high-risk-card">
            <div className="high-risk-header">
  <h3 className="high-risk-title"> <FaExclamationTriangle className="section-icon" /> {t('transaction-title')}</h3>
 {/* <button className="refresh-button" onClick={handleRefresh}>
    <FaSyncAlt style={{ marginRight: '6px' }} />
    Refresh
  </button>*/}
</div>


              <table className="high-risk-table">
                <thead className='title-risk-table'> 
                  <tr>
                    <th>{t('transaction-id')}</th>
                    <th>{t('Risk')}</th>
                    <th>{t('risk')}</th>
                    <th>{t('port')}</th>
                    <th>{t('pending')}</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.risk}%</td>
                      <td>
                        <span className={`risk-badge ${tx.level.toLowerCase()}`}>
                          {tx.level}
                        </span>
                      </td>
                      <td>{tx.port}</td>
                      <td>{tx.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ports Links */}
            <div className="ports-links-card">
              {[
                { icon: <FaPlane />, text: t('airport'), link: '/airport' },
                { icon: <FaTruckMoving />, text: t('landport'), link: '/landport' },
                { icon: <FaShip />, text: t('seaport'), link: '/seaport' },
                { icon: null, text: t('allport'), link: '/allports' },
              ].map((port, idx) => (
                <div
                  key={idx}
                  className="port-link hover-card"
                  onClick={() => navigate(port.link)}
                >
                  <span>{port.icon}</span>
                  <span>{port.text}</span>
                  <FaChevronRight size={12} />
                </div>
              ))}
            </div>

          </div>

          {/* Right Column */}
          <div className="right-column">

            {/* Recent Activities */}
            <div className="recent-activities-card">
              <h3 className="card-title"><FaChartLine className="section-icon" /> {t('recent_activity')}</h3>
              <div className="activity-item hover-card" onClick={() => navigate('/seaport')}>
                <span className="time-text">2 mins ago</span>
                <span className="activity-text">You uploaded 2 documents to Sea Port</span>
                <FaChevronRight size={12} />
              </div>
              <div className="activity-item hover-card" onClick={() => navigate('/seaport')}>
  <div className="activity-left">
    <span className="time-text">2 mins ago</span>
    <span className="activity-text">You uploaded 2 documents to Sea Port</span>
  </div>
  <FaChevronRight size={12} />
</div>

              <div className="activity-item hover-card" onClick={() => navigate('/airport')}>
                <span className="time-text">Yesterday</span>
                <span className="activity-text">You uploaded a report to Air Port</span>
                <FaChevronRight size={12} />
              </div>
            </div>

            {/* Notifications */}
            <div className="notifications-card">
  <h3 className="card-title">
    <FaBell style={{ marginRight: '8px', color: '#c7a349' }} />
    {t('notification')}
  </h3>

  {/* Always keep the white box visible */}
  {notifications.length === 0 ? (
    <div className="empty-notifications">
      No notifications available.
    </div>
  ) : (
    <div className="notifications-list">
      {notifications.map((n, index) => (
        <NotificationCard
          key={n.id}
          title={n.title}
          message={n.message}
          time={n.time}
          variant={index % 2 === 0 ? 'light' : 'dark'}
          onClose={() => handleDismiss(n.id)}
        />
      ))}
    </div>
  )}
</div>



          </div>

        </div>
      </div>
    </>
  );
};

export default Home;



