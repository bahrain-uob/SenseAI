import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import './Auditing.css';
import { Link } from 'react-router-dom';

const getRiskClass = (risk) => {
  if (risk >= 90) return 'risk-critical';
  else if (risk >= 70) return 'risk-high';
  else if (risk >= 40) return 'risk-medium';
  else return 'risk-low';
};

const getRiskCategory = (score) => {
  if (score >= 90) return 'Critical';
  else if (score >= 70) return 'High';
  else if (score >= 40) return 'Medium';
  else return 'Low';
};

const COLORS = ['#dc2626', '#f97316', '#facc15', '#4ade80'];
const renderLabel = ({ percent }) => `${(percent * 100).toFixed(0)}%`;

export default function Auditing() {
 const [allTransactions, setAllTransactions] = useState([]);
  const [originalTransactions, setOriginalTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState("");
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [itemNumber, setItemNumber] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [formReference, setFormReference] = useState('');
    const [formItem, setFormItem] = useState('');
// At the top of your component
  const navigate = useNavigate();
  const transactionsPerPage = 20;

  useEffect(() => {
  fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/RawTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 300 })
  })
  .then(res => res.json())
  .then(data => { 
    const normalized = (data.items || []).map(item => ({
      ...item,
      risk: parseFloat(item.AnomalyScore) || 0,
      risk_category: getRiskCategory(parseFloat(item.AnomalyScore) || 0),
      id: `${item.rowid}`,
      hs: item.HSCode || '',
      weight: `${item["Net Weight"]} kg`,
      value: `${item["Local Amount"]} BD`,
      date: item["Registration Date"],
      item_number: item["Item Number"] || 'N/A',
      reference_number: item["Reference Number"] || 'N/A'
    }));
    setOriginalTransactions(normalized);
    setAllTransactions(normalized);
    setLoading(false);
  })
  .catch(err => {
    console.error("Error:", err);
    setLoading(false);
  });
}, []);


useEffect(() => {
  // If all filters are cleared, restore original data
  if (!searchTriggered && !fromDate && !toDate && !hsCode && !referenceNumber) { //&& !selectedRisk 
    setAllTransactions(originalTransactions);
    console.log("using original data")
    return;
  }
console.log("fetching new data")
  // Otherwise, fetch filtered data from the server
  setLoading(true);
  fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/RawTransaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      limit: 7000,
      hsCode: hsCode || undefined,
      //riskLevel: selectedRisk || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      referenceNumber: referenceNumber || undefined
    })
  })
  .then(res => res.json())
  .then(data => {
    const normalized = (data.items || []).map(item => ({
      ...item,
      risk: parseFloat(item.AnomalyScore) || 0,
      risk_category: getRiskCategory(parseFloat(item.AnomalyScore) || 0),
      id: `${item.rowid}`,
      hs: item.HSCode || '',
      weight: `${item["Net Weight"]} kg`,
      value: `${item["Local Amount"]} BD`,
      date: item["Registration Date"],
      item_number: item["Item Number"] || 'N/A',
      reference_number: item["Reference Number"] || 'N/A'
    }));
    setAllTransactions(normalized);
    setLoading(false);
     setSearchTriggered(false);
  })
  .catch(err => {
    console.error("❌ Filter fetch error:", err);
    setLoading(false);
     setSearchTriggered(false);
  });
}, [fromDate, toDate, hsCode,referenceNumber,searchTriggered]); //selectedRisk


/* {filteredTransactions.length === 0 && !loading && (
  <p style={{ color: "#888", marginTop: "1rem" }}>No matching transactions found.</p>
)} */


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
  const matchRisk = !selectedRisk || tx.risk_category === selectedRisk;
  const matchRef = referenceNumber === '' || tx.reference_number.toLowerCase().includes(referenceNumber.toLowerCase());
  return matchDate && matchHS && matchRisk && matchRef;
});

//console.log('Selected Risk:', selectedRisk);
//console.log('All Transactions:', allTransactions);
//console.log('Filtered Transactions:', filteredTransactions);


  const totalValue = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);
  const highRiskCount = filteredTransactions.filter(t => t.risk >= 70).length;

const pieData = [
  { name: 'Critical', value: filteredTransactions.filter(t => t.risk_category === 'Critical').length },
  { name: 'High', value: filteredTransactions.filter(t => t.risk_category === 'High').length },
  { name: 'Medium', value: filteredTransactions.filter(t => t.risk_category === 'Medium').length },
  { name: 'Low', value: filteredTransactions.filter(t => t.risk_category === 'Low').length }
];


  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  /* const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast); */
  const currentTransactions = [...filteredTransactions]
  .sort((a, b) => b.risk - a.risk)
  .slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCustomTick = ({ x, y, payload }) => {
    const lines = payload.value.split(' ');
    return (
      <g transform={`translate(${x},${y + 10})`}>
        <text textAnchor="middle" fill="#4b5563" fontSize={11}>
          {lines.map((line, i) => (
            <tspan x="0" dy={i === 0 ? 0 : 12} key={i}>{line}</tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        <div className="page-left">
          <div className="visual-box">
            <h3>Risk Distribution</h3>
            <ResponsiveContainer width="100%" minWidth={360} height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} label={renderLabel} labelLine={false} onClick={handleSliceClick} isAnimationActive={true} animationDuration={1000} animationEasing="ease-in-out">
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

          <div className="visual-box">
            <h3>Metric Overview</h3>
            <ResponsiveContainer width="100%" minWidth={360} height={260}>
              <BarChart data={[
                { name: 'Total Transactions', value: filteredTransactions.length },
                { name: 'High Risk Cases', value: highRiskCount },
                { name: 'Total Value', value: totalValue }
              ]} margin={{ top: 20, right: 20, left: 20, bottom: 40 }}>
                <XAxis dataKey="name" tick={renderCustomTick} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" label={{ position: 'top', fill: '#444', fontSize: 12 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-in-out">
                  <Cell fill="#0b1743" /><Cell fill="#ef4444" /><Cell fill="#3b82f6" /><Cell fill="#22c55e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-right">
          <h2 className="page-title">Transaction List Analysis</h2>
          <div className="filter-bar" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem', textAlign: 'left', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
              <label style={{ marginBottom: '6px' }}>Date Range</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <span style={{ fontWeight: 'normal' }}>to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
              <label style={{ marginBottom: '6px' }}>HS Code Search</label>
              <input type="text" placeholder="Enter HS code" value={hsCode} onChange={(e) => setHsCode(e.target.value)} style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px' }} />
            </div>


            <form
                onSubmit={(e) => {
                e.preventDefault();
                if (formReference && formItem) {
                    navigate(`/pages/transaction/${formReference}/${formItem}`);
                }
                }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Reference Number</label>
                <input
            type="text"
            value={formReference}
            onChange={(e) => setFormReference(e.target.value)}
            placeholder="Enter Reference Number"
            style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontWeight: 'bold' // ✅ Make input text bold
            }}
            />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Item Number</label>
                <input
            type="text"
            value={formItem}
            onChange={(e) => setFormItem(e.target.value)}
            placeholder="Enter Item Number"
            style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontWeight: 'bold' // ✅ Make input text bold
            }}
            />
                </div>
                <button
                type="submit"
                disabled={!formReference || !formItem}
                style={{
                    padding: '10px 16px',
                    backgroundColor: !formReference || !formItem ? '#ccc' : '#0b1743',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: !formReference || !formItem ? 'not-allowed' : 'pointer'
                }}
                >
                🔍 Search
                </button>
            </form>



            {<div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
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
            </div>}

          {/* {<div style={{ display: 'flex', flexDirection: 'column', color: '#0b1743', fontWeight: 600, fontSize: '14px' }}>
              <label style={{ marginBottom: '6px' }}>Reference Number</label>
              <input
                    type="text"
                    placeholder="Enter reference number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearchTriggered(true);
                      }
                    }}
                    style={{ padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px' }}
                  />
           </div> } */}




        

          </div>

          
          <div className="stats-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem', textAlign: 'center' }}>
            <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
              <div>Total Transactions</div>
              <div className="count" style={{ color: '#0f172a' }}><CountUp end={filteredTransactions.length} duration={2} separator="," /></div>
            </div>
            <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
              <div>High Risk Cases</div>
              <div className="count" style={{ color: '#ef4444' }}><CountUp end={highRiskCount} duration={2} /></div>
            </div>
            <div className="stats-card" style={{ backgroundColor: 'white', color: '#0b1743', border: '2px solid #0b1743' }}>
              <div>Total Value</div>
              <div className="count" style={{ color: '#1d4ed8' }}><CountUp end={totalValue} duration={2} decimals={1} /> <span className="unit">BD</span></div>
            </div>
          </div>

      
          {loading ? <p>Loading transactions...</p> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Risk</th>
                    <th>Reference Number</th>
                    <th>Item Number</th>
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
                       {/**  <td><span className={`risk-badge ${getRiskClass(tx.risk)}`}>{tx.risk}%</span></td> */}
                        <td>
                          <span className={`risk-badge risk-${tx.risk_category.toLowerCase()}`}>
                            {tx.risk.toFixed(2)}%
                          </span>
                        </td>
                          <td>{tx.reference_number}</td>
                        <td>{tx.item_number}</td>
                        <td>{tx.hs}</td>
                        <td>{tx.weight}</td>
                        <td>{tx.value}</td>
                        <td>{tx.date}</td>
                        <td>
                        <Link to={`/pages/transaction/${tx.reference_number}/${tx.item_number}`}>
                            <FaEye className="review-icon" />
                        </Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

             
              {totalPages > 1 && (
                <div className="pagination">
                  {pageNumbers.map((num) => (
                    <button key={num} onClick={() => goToPage(num)} className={currentPage === num ? 'active' : ''}>{num}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

