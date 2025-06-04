import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaTruckMoving, FaShip, FaChevronRight, FaSyncAlt, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import './Home.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import NotificationCard from '../NotificationCard';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

 const [highRiskTransactions, setHighRiskTransactions] = useState([]);
const [loading, setLoading] = useState(true);
 const [allActivities, setAllActivities] = useState([]);

useEffect(() => {
  fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/RawTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 100 }) // Adjust the limit if needed
  })
    .then(res => res.json())
    .then(data => {
      const filtered = (data.items || []).map(item => ({
        id: item["Reference Number"] || 'Unknown',
        itemnumber: item["Item Number"] || 'Unknown',
        risk: parseFloat(item.AnomalyScore) || 0,
        level: parseFloat(item.AnomalyScore) >= 90 ? 'Critical' : parseFloat(item.AnomalyScore) >= 70 ? 'High' : 'Medium',
        hscode: item.HSCode || '',
        value: `${item["Local Amount"]} BD`,
      }))
      .filter(tx => tx.risk >= 70) // Only High or Critical
      .sort((a, b) => b.risk - a.risk); // Sort by risk descending

      setHighRiskTransactions(filtered);
      setLoading(false);
    })
    .catch(err => {
      console.error("❌ Failed to fetch high risk transactions:", err);
      setLoading(false);
    });
}, []);


const [notifications, setNotifications] = useState([]);

/* useEffect(() => {
  fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
    method: "GET"
  })
    .then(res => res.json())
    .then(data => {
      const formatted = (data.items || []).map(item => ({
        
        employee: item.EmployeeName,
        action: item.Action,
        transaction: item["reference_number"],
        itemNo: item["item_number"],
        message: `${item.EmployeeName || 'User'} performed ${item.action}`,
        time: item.timestamp || "Unknown time"
      }));
      setNotifications(formatted);
    })
    .catch(err => {
      console.error("❌ Failed to fetch employee notifications:", err);
    });
}, []); */

useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get('https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities');
      const parsed = res.data.map((item) => {
        if (!item.Timestamp) return null;
        const d = new Date(item.Timestamp);
        if (isNaN(d)) return null;
        const [datePart, timePart] = d.toLocaleString().split(', ');
        return {
          date: datePart,
          time: timePart,
          employee: item.EmployeeName,
          action: item.Action,
          transaction: item["reference_number"],
          itemNo: item["item_number"], //changed!!!!!
          timestamp: item.Timestamp,
          flager: item.Flager,
          typeOfError: item.TypeOfError,
        };
      }).filter(Boolean);
      setAllActivities(parsed);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
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
                    <th>{t('Reference Number ')}</th>
                    <th>{t('Item Number')}</th>
                    <th>{t('Risk')}</th>
                    <th>{t('risk')}</th>
                    <th>{t('HS Code')}</th>
                    <th>{t('Value')}</th>
                  </tr>
                </thead>
                <tbody>
                                  {loading ? (
                    <tr><td colSpan="5">Loading...</td></tr>
                  ) : (
                    highRiskTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.id}</td>
                        <td>{tx.itemnumber}</td>
                        <td>{tx.risk.toFixed(1)}%</td>
                        <td><span className={`risk-badge ${tx.level.toLowerCase()}`}>{tx.level}</span></td>
                        <td>{tx.hscode}</td>
                        <td>{tx.value}</td>
                      </tr>
                    ))
                  )}

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
  <h3 className="card-title"><FaBell style={{ marginRight: '8px', color: '#c7a349' }} />Notifications</h3>
  { (
    <div className="notifications-list">
     {allActivities.slice(0, 3).map((n, index) => (
  <NotificationCard
    key={`${n.transaction}-${n.itemNo}-${index}`}
    title={n.itemNo}
    title2={n.transaction}
message={`${n.employee} : ${n.action} transaction #${n.transaction}, item #${n.itemNo}`}
    time={`${n.date}, ${n.time}`}
    variant={index % 2 === 0 ? 'light' : 'dark'}
    onClose={() => setAllActivities((prev) => prev.filter((_, i) => i !== index))}
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
