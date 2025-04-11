import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaTruckMoving, FaShip, FaChevronRight } from 'react-icons/fa';
import './HomePage.css';
import { useTranslation } from 'react-i18next';
import NotificationCard from '../NotificationCard';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Upload Complete', message: 'Your file has been successfully uploaded to Sea Port.', time: 'Just now' },
    { id: 2, title: 'Report Reviewed', message: 'Your flagged items were reviewed by Ahmed.', time: '5 min ago' },
    { id: 3, title: 'Login Success', message: 'You logged in from a new device.', time: '1 hour ago' },
    { id: 1, title: 'Upload Complete', message: 'Your file has been successfully uploaded to Sea Port.', time: '5 hour ago' },
  ]);
  
  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  /*const notificationss = [
    {
      title: "Upload Complete",
      message: "Your file has been successfully uploaded to Sea Port.",
      time: "Just now"
    },
    {
      title: "Report Reviewed",
      message: "Your flagged items were reviewed by Ahmed.",
      time: "5 min ago"
    },
    {
      title: "Login Success",
      message: "You logged in from a new device.",
      time: "1 hour ago"
    },
    {
      title: "Upload Complete",
      message: "Your file has been successfully uploaded to Sea Port.",
      time: "Just now"
    },{
      title: "Upload Complete",
      message: "Your file has been successfully uploaded to Sea Port.",
      time: "3 hour ago"
    },
  ];*/

  return (
    <>
      {/* Banner */}
      <div
        style={{
          width: '100%',
          height: '290px',
          backgroundImage: 'url("/assets/customs.png")',
          backgroundSize: 'cover',
          backgroundPosition: ' center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '30px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>SenseAI</h1>
          <p style={{ fontSize: '18px', marginTop: '10px' }}>{t('customsAffairs')}</p>
        </div>
      </div>

      {/*  Page Container */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '200px',
        }}
      >
        {/* 🔹 Left side: Recent , Ports */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Recent Activity */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '50px',
              borderRadius: '10px',
              width: '100%',           
              maxWidth: '800px',    
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>{t('recent_activity')}</h3>
            <div className="activity-item hover-card" onClick={() => navigate('/seaport')}>
              <span style={{ color: '#aaa', marginRight: '10px', minWidth: '80px' }}>2 mins ago</span>
              <span style={{ flex: 1 }}>You uploaded 2 documents to Sea Port</span>
              <span><FaChevronRight size={12} /></span>
            </div>
            <div className="activity-item hover-card" onClick={() => navigate('/landport')}>
              <span style={{ color: '#aaa', marginRight: '10px', minWidth: '80px' }}>1 hour ago</span>
              <span style={{ flex: 1 }}>Ahmed reviewed flagged items for land port</span>
              <span><FaChevronRight size={12} /></span>
            </div>
            <div className="activity-item hover-card" onClick={() => navigate('/airport')}>
              <span style={{ color: '#aaa', marginRight: '10px', minWidth: '80px' }}>Yesterday</span>
              <span style={{ flex: 1 }}>You uploaded a report to Air Port</span>
              <span><FaChevronRight size={12} /></span>
            </div>
          </div>

          {/* Port Links */}
          <div
            style={{
              backgroundColor: '#0b1543',
              color: 'white',
              padding: '50px',
              borderRadius: '10px',
              width: '100%',           
              maxWidth: '800px',    
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
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
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>{port.icon}</span>
                <span>{port.text}</span>
                <span><FaChevronRight size={12} /></span>
              </div>
            ))}
          </div>
        </div>

        {/*  Notifications */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '360px',
            alignSelf: 'flex-start',
          }}
        >
          <h3 style={{ color: '#0b1543', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            {t('notification')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
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
        </div>
      </div>
    </>
  );
};

export default Home;
