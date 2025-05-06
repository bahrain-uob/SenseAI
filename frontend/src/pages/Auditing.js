

import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

import './Auditing.css';

const allTransactions = Array.from({ length: 100 }, (_, i) => {
  const risk = Math.floor(Math.random() * 100) + 1;
  
  // Base 8-digit HS code
  const baseHS = String(Math.floor(10000000 + Math.random() * 90000000));

  // Randomly decide whether to extend it
  const hs = Math.random() < 0.5
    ? baseHS  // 8-digit code
    : baseHS + String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');  // 12-digit extended

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

const trendData = [
  { name: 'W1', value: 4 },
  { name: 'W2', value: 2 },
  { name: 'W3', value: 5 },
  { name: 'W4', value: 6 },
  { name: 'W5', value: 8 }
];

export default function Auditing() {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hsCode, setHsCode] = useState('');

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
  const renderCustomTick = ({ x, y, payload }) => {
    const lines = payload.value.split(' ');
    return (
      <g transform={`translate(${x},${y + 10})`}>
        <text textAnchor="middle" fill="#4b5563" fontSize={11}>
          {lines.map((line, i) => (
            <tspan x="0" dy={i === 0 ? 0 : 12} key={i}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };
  
  
  const [currentPage, setCurrentPage] = useState(1);
const transactionsPerPage = 20;

const indexOfLast = currentPage * transactionsPerPage;
const indexOfFirst = indexOfLast - transactionsPerPage;
const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

const goToPage = (page) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to top
};

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Left side: charts */}
        <div className="page-left">
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
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              cursor="pointer"
            />
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
    <ResponsiveContainer width="100%" minWidth={360} height={260}>
  <BarChart
    data={[
      { name: 'Total Transactions', value: 100 },
      { name: 'High Risk Cases', value: 24 },
      { name: 'Total Value', value: 5604 },
    ]}
    
    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
  >
    <XAxis dataKey="name" tick={renderCustomTick} interval={0} />
    <YAxis />
    <Tooltip />
    <Bar
  dataKey="value"
  label={{ position: 'top', fill: '#444', fontSize: 12 }}
  isAnimationActive={true}
  animationDuration={2000}
  animationEasing="ease-in-out"
>
  <Cell fill="#0b1743" />
  <Cell fill="#ef4444" />
  <Cell fill="#3b82f6" />
  <Cell fill="#22c55e" />
</Bar>


  </BarChart>
</ResponsiveContainer>

  </div>
</div>


        {/* Right side: filters, stats, table */}
        <div className="page-right">
          <h2 className="page-title">Transaction List Analysis</h2>

          <div className="filter-bar" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem',  textAlign: 'left',              // ← Add this
  alignItems: 'flex-start'   }}>
  {/* Date Range */}
  <div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
    <label style={{ marginBottom: '6px' }}>Date Range</label>
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <span style={{ fontWeight: 'normal' }}>to</span>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
    </div>
  </div>

  {/* HS Code Search */}
  <div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
    <label style={{ marginBottom: '6px' }}>HS Code Search</label>
    <input
      type="text"
      placeholder="Enter HS code"
      value={hsCode}
      onChange={(e) => setHsCode(e.target.value)}
      style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px' }}
    />
  </div>

  {/* Risk Level Filter */}
  <div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
    <label style={{ marginBottom: '6px' }}>Risk Level</label>
    <select
      value={selectedRisk || ''}
      onChange={(e) => setSelectedRisk(e.target.value || null)}
      style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
    >
      <option value=''>All Risks</option>
      <option value='Critical'>Critical</option>
      <option value='High'>High</option>
      <option value='Medium'>Medium</option>
      <option value='Low'>Low</option>
    </select>
  </div>
</div>


<div className="stats-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem',  textAlign: 'center',              // ← Add this
  }}>
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>Total Transactions</div>
    <div className="count" style={{ color: '#0f172a' }}><CountUp end={100} duration={2} separator="," /></div>
  </div>
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>High Risk Cases</div>
    <div className="count" style={{ color: '#ef4444' }}><CountUp end={24} duration={2} /></div>
  </div>
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>Total Value</div>
    <div className="count" style={{ color: '#1d4ed8' }}><CountUp end={5.6} duration={2} decimals={1} />K <span className="unit">BD</span></div>
  </div>
</div>


          {(selectedRisk || fromDate || toDate || hsCode) && (
            <div style={{ textAlign: 'left', marginBottom: '1rem', fontSize: '13px' }}>
              Showing filtered transactions
              <button
                style={{
                  marginLeft: '1rem',
                  color: '#0b1743',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none'
                }}
                onClick={() => {
                  setSelectedRisk(null);
                  setFromDate('');
                  setToDate('');
                  setHsCode('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

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
            <td><FaEye className="review-icon" /></td>
          </tr>
        );
      })}
    </tbody>
  </table>

  {/* Pagination buttons */}
  {totalPages > 1 && (
    <div className="pagination">
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => setCurrentPage(num)}
          className={currentPage === num ? 'active' : ''}
        >
          {num}
        </button>
      ))}
    </div>
  )}
 <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
  <button
    onClick={() => goToPage(Math.max(currentPage - 1, 1))}
    disabled={currentPage === 1}
    style={{
      padding: '8px 16px',
      backgroundColor: '#0b1743',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
    }}
  >
    Back
  </button>

  <div style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px', color: '#0b1743' }}>
    Page {currentPage} of {totalPages}
  </div>

  <button
    onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
    disabled={currentPage === totalPages}
    style={{
      padding: '8px 16px',
      backgroundColor: '#0b1743',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
    }}
  >
    Next
  </button>
</div>


</div>


        </div>
      </div>
    </div>
  );
}


