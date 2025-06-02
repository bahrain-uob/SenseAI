import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

import './Auditing.css';
import { Link } from 'react-router-dom';
import TransactionDetail from './TransactionDetail';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
  ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
};
const userPool = new CognitoUserPool(poolData);

const allTransactions = Array.from({ length: 100 }, (_, i) => {
  const risk = Math.floor(Math.random() * 100) + 1;
  const baseHS = String(Math.floor(10000000 + Math.random() * 90000000));
  const hs = Math.random() < 0.5
    ? baseHS
    : baseHS + String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');
  const weight = `${Math.floor(Math.random() * 50) + 1} kg`;
  const value = `${Math.floor(Math.random() * 100) + 10}BD`;
  const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    .toISOString()
    .split('T')[0];

  return {
    risk,
    id: `TRX-2025${i.toString().padStart(3, '0')}`,
    hs,
    weight,
    value,
    date
  };
});

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

const pieData = [
  { name: 'Critical', value: 9 },
  { name: 'High', value: 15 },
  { name: 'Medium', value: 40 },
  { name: 'Low', value: 36 },
];

const COLORS = ['#dc2626', '#f97316', '#facc15', '#4ade80'];
const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

export default function Auditing() {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 20;

 const username = userPool.getCurrentUser()?.getUsername() || 'Unknown';

  // ✅ Define logActivity function inside component, with username available
  const logActivity = async (action, transactionId) => {
    try {
      await fetch('https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/log-employee-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EmployeeName: username,
          Action: action,
          TransactionID: transactionId,
          Timestamp: new Date().toISOString(),
        }),
      });
      console.log('Activity logged successfully');
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleSliceClick = (_, index) => {
    const category = pieData[index].name;
    setSelectedRisk(prev => (prev === category ? null : category));
  };

  const filteredTransactions = allTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchDate = (!from || txDate >= from) && (!to || txDate <= to);
    const matchHS = hsCode === '' || tx.hs.toLowerCase().includes(hsCode.toLowerCase());
    const matchRisk = !selectedRisk || getRiskCategory(tx.risk) === selectedRisk;
    return matchDate && matchHS && matchRisk;
  });

  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Left side: charts */}
        <div className="page-left">
          {/* Pie Chart */}
          <div className="visual-box">
            <h3>Risk Distribution</h3>
            <ResponsiveContainer width="100%" minWidth={360} height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={40}
                  outerRadius={60}
                  label={renderLabel}
                  labelLine={false}
                  onClick={handleSliceClick}
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
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

          {/* Bar Chart */}
          <div className="visual-box">
            <h3>Metric Overview</h3>
            <ResponsiveContainer width="100%" minWidth={360} height={260}>
              <BarChart
                data={[
                  { name: 'Total Transactions', value: 100 },
                  { name: 'High Risk Cases', value: 24 },
                  { name: 'Total Value', value: 5604 },
                ]}
                margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
              >
                <XAxis dataKey="name" interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" label={{ position: 'top', fill: '#444', fontSize: 12 }}>
                  <Cell fill="#0b1743" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side: filters and table */}
        <div className="page-right">
          <h2 className="page-title">Transaction List Analysis</h2>

          {/* Table */}
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
                {currentTransactions.map((tx, i) => {
                  const rowBg = getRiskClass(tx.risk) === 'risk-critical' ? '#fee2e2'
                    : getRiskClass(tx.risk) === 'risk-high' ? '#fde68a'
                    : getRiskClass(tx.risk) === 'risk-medium' ? '#fef9c3'
                    : '#dcfce7';

                  return (
                    <tr key={i} style={{ backgroundColor: rowBg }}>
                      <td><span className={`risk-badge ${getRiskClass(tx.risk)}`}>{tx.risk}%</span></td>
                      <td>{tx.id}</td>
                      <td>{tx.hs}</td>
                      <td>{tx.weight}</td>
                      <td>{tx.value}</td>
                      <td>{tx.date}</td>
                      <td>
                        <Link
                          to={`/pages/transaction/${tx.id}`}
                          className="transaction-link"
                          onClick={() => logActivity('View Transaction', tx.id)}
                        >
                          <FaEye className="review-icon" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {pageNumbers.map((num) => (
                <button key={num} onClick={() => goToPage(num)} className={currentPage === num ? 'active' : ''}>
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


