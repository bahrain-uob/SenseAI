
import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

import './Auditing.css';

const allTransactions = [
  { risk: 91, id: 'TRX-2025001', hs: '81012.14.19', weight: '1.5 kg', value: '100$', date: '2024-01-12' },
  { risk: 83, id: 'TRX-2025001', hs: '76612.14.14', weight: '23 kg', value: '90$', date: '2024-07-24' },
  { risk: 67, id: 'TRX-2025001', hs: '43146.70.73', weight: '13 kg', value: '72$', date: '2024-10-04' },
  { risk: 42, id: 'TRX-2025001', hs: '90562.11.46', weight: '8 kg', value: '56$', date: '2024-08-31' },
  { risk: 15, id: 'TRX-2025001', hs: '34068.14.15', weight: '7 kg', value: '32$', date: '2024-06-09' },
  { risk: 15, id: 'TRX-2025001', hs: '34068.14.15', weight: '29 kg', value: '72$', date: '2024-02-06' },
];

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
  { name: 'Critical', value: 1 },
  { name: 'High', value: 1 },
  { name: 'Medium', value: 2 },
  { name: 'Low', value: 2 },
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
      { name: 'Total Transactions', value: 1234 },
      { name: 'High Risk Cases', value: 86 },
      { name: 'Total Value', value: 2400 },
      { name: 'Optimization', value: 24 },
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
  animationDuration={1000}
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

          <div className="filter-bar">
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem' }}>
    <label style={{ marginBottom: '4px' }}>Date Range</label>
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      <span style={{ color: '#555', fontWeight: 'normal' }}>to</span>
      <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
    </div>
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem' }}>
    <label style={{ marginBottom: '4px' }}>HS Code Search</label>
    <input type="text" placeholder="Enter HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem' }}>
    <label style={{ marginBottom: '4px' }}>Risk Level</label>
    <select value={selectedRisk || ''} onChange={(e) => setSelectedRisk(e.target.value || null)}>
      <option value=''>All Risks</option>
      <option value='Critical'>Critical</option>
      <option value='High'>High</option>
      <option value='Medium'>Medium</option>
      <option value='Low'>Low</option>
    </select>
  </div>
</div>

<div className="stats-row">
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>Total Transactions</div>
    <div className="count" style={{ color: '#0f172a' }}><CountUp end={1234} duration={2} separator="," /></div>
  </div>
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>High Risk Cases</div>
    <div className="count" style={{ color: '#ef4444' }}><CountUp end={86} duration={2} /></div>
  </div>
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>Total Value</div>
    <div className="count" style={{ color: '#1d4ed8' }}><CountUp end={2.4} duration={2} decimals={1} />M <span className="unit">BD</span></div>
  </div>
  <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
    <div>Approx. Optimization</div>
    <div className="count" style={{ color: '#16a34a' }}>+<CountUp end={24} duration={2} />%</div>
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
  {filteredTransactions.map((tx, i) => {
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
</div>

        </div>
      </div>
    </div>
  );
}

