import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

import './Auditing.css';
import { Link } from 'react-router-dom';

const getRiskClass = (risk) => {
  if (risk >= 90) return 'risk-critical';
  if (risk >= 70) return 'risk-high';
  if (risk >= 40) return 'risk-medium';
  return 'risk-low';
};

const getRiskCategory = (risk) => {
  if (risk >= 90) return 'Critical';
  if (risk >= 70) return 'High';
  if (risk >= 40) return 'Medium';
  return 'Low';
};

const COLORS = ['#dc2626', '#f97316', '#facc15', '#4ade80'];
const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

export default function Auditing() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [selectedRisk, setSelectedRisk] = useState(null);

  useEffect(() => {
    fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/RawTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ limit: 20 })
    })
      .then(res => res.json())
      .then(data => {
        setAllTransactions(data.items || []);
        setLoading(false);
        console.log("✅ Success:", data);
      })
      .catch(err => {
        console.error("❌ Error:", err);
        setLoading(false);
      });
  }, []);

  const pieData = [
    { name: 'Critical', value: allTransactions.filter(t => t.risk_percentage >= 90).length },
    { name: 'High', value: allTransactions.filter(t => t.risk_percentage >= 70 && t.risk_percentage < 90).length },
    { name: 'Medium', value: allTransactions.filter(t => t.risk_percentage >= 40 && t.risk_percentage < 70).length },
    { name: 'Low', value: allTransactions.filter(t => t.risk_percentage < 40).length }
  ];

  const handleSliceClick = (_, index) => {
    const category = pieData[index].name;
    setSelectedRisk(prev => (prev === category ? null : category));
  };

  const filteredTransactions = allTransactions.filter(tx => {
    const txDate = new Date(tx["Registration Date"]);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchDate = (!from || txDate >= from) && (!to || txDate <= to);
    const matchHS = hsCode === '' || (tx["HSCode"] || '').toString().includes(hsCode);
    const matchRisk = !selectedRisk || getRiskCategory(tx.risk_percentage) === selectedRisk;
    return matchDate && matchHS && matchRisk;
  });

  return (
    <div className="page-container">
      <div className="page-wrapper">
        <div className="page-left">
          <div className="visual-box">
            <h3>Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={60}
                  label={renderLabel}
                  onClick={handleSliceClick}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} cursor="pointer" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {['Critical', 'High', 'Medium', 'Low'].map((label, i) => (
                <div className="pie-legend-item" key={label}>
                  <span className="pie-legend-color" style={{ backgroundColor: COLORS[i] }}></span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="visual-box">
            <h3>Metric Overview</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  { name: 'Total Transactions', value: allTransactions.length },
                  { name: 'High Risk Cases', value: allTransactions.filter(t => t.risk_percentage >= 70).length },
                  { name: 'Total Value', value: allTransactions.reduce((sum, t) => sum + (parseFloat(t["Local Amount"]) || 0), 0) },
                ]}
                margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  <Cell fill="#0b1743" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-right">
          <h2 className="page-title">Transaction List Analysis</h2>

          <div className="filter-bar">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="range-inputs">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <span>to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <label>HS Code Search</label>
              <input type="text" placeholder="Enter HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
            </div>

            <div className="filter-group">
              <label>Risk Level</label>
              <select value={selectedRisk || ''} onChange={(e) => setSelectedRisk(e.target.value || null)}>
                <option value=''>All Risks</option>
                <option value='Critical'>Critical</option>
                <option value='High'>High</option>
                <option value='Medium'>Medium</option>
                <option value='Low'>Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Risk</th>
                    <th>Transaction ID</th>
                    <th>HS Code</th>
                    <th>Weight</th>
                    <th>Value</th>
                    <th>Date</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, i) => {
                    const risk = tx.risk_percentage;
                    const rowBg = getRiskClass(risk) === 'risk-critical' ? '#fee2e2'
                      : getRiskClass(risk) === 'risk-high' ? '#fde68a'
                      : getRiskClass(risk) === 'risk-medium' ? '#fef9c3'
                      : '#dcfce7';

                    return (
                      <tr key={i} style={{ backgroundColor: rowBg }}>
                        <td><span className={`risk-badge ${getRiskClass(risk)}`}>{risk}%</span></td>
                        <td><Link to={`/pages/transaction/TRX-${tx.rowid}`} className="transaction-link">{tx.rowid}</Link></td>
                        <td>{tx["HSCode"]}</td>
                        <td>{tx["Net Weight"]} kg</td>
                        <td>{tx["Local Amount"]} BD</td>
                        <td>{tx["Registration Date"]}</td>
                        <td><FaEye className="review-icon" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


