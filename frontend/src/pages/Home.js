import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaTruckMoving, FaShip, FaChevronRight, FaSyncAlt, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import './Home.css';
import { useTranslation } from 'react-i18next';
import NotificationCard from '../NotificationCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Upload Complete', message: 'Your file has been successfully uploaded to Sea Port.', time: 'Just now' },
    { id: 2, title: 'Report Reviewed', message: 'Your flagged items were reviewed by Ahmed.', time: '5 min ago' },
    { id: 3, title: 'Login Success', message: 'You logged in from a new device.', time: '1 hour ago' },
    { id: 4, title: 'Login Success', message: 'You logged in from a new device.', time: '1 hour ago' },
  ]);

  const [highRiskTransactions] = useState([
    { id: 'TRX1345', risk: 98, level: 'Critical', port: 'Khalifa Bin Salman Port', pending: '10 days' },
    { id: 'TRX1395', risk: 97, level: 'Critical', port: 'Khalifa Bin Salman Port', pending: '12 days' },
    { id: 'TRX1335', risk: 96, level: 'Critical', port: 'Khalifa Bin Salman Port', pending: '15 days' },
    { id: 'TRX6722', risk: 96, level: 'Critical', port: 'Khalifa Bin Salman Port', pending: '5 days' },
    { id: 'TRX9102', risk: 91, level: 'Critical', port: 'King Fahd Causeway', pending: '3 days' },
    { id: 'TRX9222', risk: 88, level: 'High', port: 'King Fahd Causeway', pending: '2 days' },
    { id: 'TRX4678', risk: 88, level: 'High', port: 'Bahrain International Airport', pending: '1 day' },
    { id: 'TRX2746', risk: 86, level: 'High', port: 'King Fahd Causeway', pending: '1 day' },
    { id: 'TRX2776', risk: 86, level: 'High', port: 'King Fahd Causeway', pending: '4 days' },
    { id: 'TRX4888', risk: 85, level: 'High', port: 'Bahrain International Airport', pending: '2 days' },
  ]);

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Chart Data Prep
  const maxTransactions = 20;
  const criticalCount = highRiskTransactions.filter(tx => tx.level === 'Critical').length;
  const highCount = highRiskTransactions.filter(tx => tx.level === 'High').length;
  const totalHighRisk = criticalCount + highCount;
  const percentage = ((totalHighRisk / maxTransactions) * 100).toFixed(1);

  const chartData = {
    labels: ['Critical', 'High'],
    datasets: [
      {
        data: [criticalCount, highCount,],
        backgroundColor: ['#dc2626', '#f97316', '#facc15'],
        borderWidth: 4,
        borderColor: '#fff',
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed}`;
          },
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14, family: 'Poppins' },
        },
      },
    },
  };

  return (
    <>
      <div 
        className="banner"
        style={{ backgroundImage: "url('/assets/customs.png')", backgroundSize: "cover", backgroundPosition: "center", height: "290px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
        <div className="banner-overlay">
          <h1>SenseAI</h1>
          <p>{t('customsAffairs')}</p>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="main-grid">
          <div className="left-column">
            <div className="port-strip">
              <button className="port-button" onClick={() => navigate('/pages/auditing?port=Airport')}><FaPlane /> {t('airport')}</button>
              <button className="port-button" onClick={() => navigate('/pages/auditing?port=LandPort')}><FaTruckMoving /> {t('landport')}</button>
              <button className="port-button" onClick={() => navigate('/pages/auditing?port=SeaPort')}><FaShip /> {t('seaport')}</button>
              <button className="port-button" onClick={() => navigate('/pages/auditing')}><FaSyncAlt /> {t('allport')}</button>
            </div>

            <div className="high-risk-card">
              <div className="high-risk-header">
                <h3 className="high-risk-title"><FaExclamationTriangle className="section-icon" /> {t('transaction-title')}</h3>
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
                      <td><span className={`risk-badge ${tx.level.toLowerCase()}`}>{tx.level}</span></td>
                      <td>{tx.port}</td>
                      <td>{tx.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="right-column">
            <div className="recent-activities-card">
              <h3 className="card-title">Total High Risk Transactions</h3>
              <div style={{ position: 'relative', width: '300px', margin: '0 auto' }}>
                <Doughnut data={chartData} options={chartOptions} />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#333'
                }}>
                  {totalHighRisk}<br />
                  <span style={{ fontSize: '14px', color: '#666' }}>Total</span><br />
                  <span style={{ fontSize: '16px', color: '#dc2626' }}>{percentage}%</span>
                </div>
              </div>
            </div>

            <div className="notifications-card">
              <h3 className="card-title"><FaBell style={{ marginRight: '8px', color: '#c7a349' }} />{t('notification')}</h3>
              {notifications.length === 0 ? (
                <div className="empty-notifications">No notifications available.</div>
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
