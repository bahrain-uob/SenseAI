import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import './land.css';

const mockData = {
  2025: {
    January: [...Array(10)].map((_, i) => ({ id: `TX2025JAN${i}`, date: '2025-01-15', risk: 2.5 + i, status: 'Cleared' })),
    February: [...Array(12)].map((_, i) => ({ id: `TX2025FEB${i}`, date: '2025-02-15', risk: i % 3 === 0 ? 85.3 : 4.2 + i, status: i % 3 === 0 ? 'Pending' : 'Cleared' })),
    March: [...Array(18)].map((_, i) => ({ id: `TX2025MAR${i}`, date: '2025-03-15', risk: 6 + i, status: 'Cleared' })),
    April: [...Array(8)].map((_, i) => ({ id: `TX2025APR${i}`, date: '2025-04-22', risk: i === 3 ? 90.2 : 5 + i, status: i === 3 ? 'Pending' : 'Cleared' }))
  }
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Land() {
  const [year, setYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('April');

  const allTransactions = mockData[year];
  const monthData = allTransactions[selectedMonth] || [];
  const allTransactionsFlat = Object.values(allTransactions).flat();

  const total = allTransactionsFlat.length;
  const highRisk = allTransactionsFlat.filter(tx => tx.risk >= 70).length;
  const pending = allTransactionsFlat.filter(tx => tx.status === 'Pending').length;

  const chartData = months.map(month => ({
    month,
    count: allTransactions[month]?.length || 0
  }));

  return (
    <div className="dashboard">
      <h1 className="page-title">King Fahd Causeway</h1>
      <div className="summary-section">
        <div className="summary-box">
          <div className="summary-label">Total Transactions</div>
          <div className="summary-value">{total}</div>
        </div>
        <div className="summary-box">
          <div className="summary-label">High-Risk %</div>
          <div className="summary-value">{((highRisk / total) * 100).toFixed(1)}%</div>
        </div>
        <div className="summary-box">
          <div className="summary-label">Pending</div>
          <div className="summary-value">{pending}</div>
        </div>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="dropdown">
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      <h2 className="section-title">Uploaded Transactions by Month ({year})</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <XAxis dataKey="month" fontSize={12} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="filter-section">
        <label className="filter-label">Select Month:</label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="dropdown">
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <h3 className="section-title">Recent Transactions</h3>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Risk %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {monthData.map(tx => (
              <tr key={tx.id} className={tx.status === 'Pending' ? 'tr-pending' : 'tr-cleared'}>

                <td>{tx.id}</td>
                <td>{tx.date}</td>
                <td>{tx.risk.toFixed(1)}%</td>
                <td>
                  <span className={tx.status === 'Pending' ? 'status-pending' : 'status-cleared'}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {monthData.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">No transactions uploaded for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
