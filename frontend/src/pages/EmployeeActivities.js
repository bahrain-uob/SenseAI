import React, { useState, useEffect, useRef } from 'react';
import './EmployeeActivities.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import amiriFontBase64 from '../fonts/Amiri-Regular-base64';

pdfMake.vfs = {
  'Amiri-Regular.ttf': amiriFontBase64
};

pdfMake.fonts = {
  Amiri: {
    normal: 'Amiri-Regular.ttf',
    bold: 'Amiri-Regular.ttf',
    italics: 'Amiri-Regular.ttf',
    bolditalics: 'Amiri-Regular.ttf'
  }
};

const EmployeeActivities = () => {
  const [allActivities, setAllActivities] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [searchTransaction, setSearchTransaction] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const chartRef = useRef(null);

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
          transaction: item.TransactionID,
          timestamp: item.Timestamp,
        };
      }).filter(Boolean);
      setAllActivities(parsed);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  const filteredActivities = allActivities.filter((act) => {
    const actDate = new Date(act.timestamp).toLocaleDateString();
    const filterDate = dateFilter ? new Date(dateFilter).toLocaleDateString() : '';
    return (
      (dateFilter === '' || actDate === filterDate) &&
      (employeeFilter === 'All' || act.employee === employeeFilter) &&
      (actionFilter === 'All' || act.action === actionFilter) &&
      (searchTransaction === '' || act.transaction?.toLowerCase().includes(searchTransaction.toLowerCase()))
    );
  });

  const uniqueEmployees = [...new Set(allActivities.map(act => act.employee))];
  const uniqueActions = [...new Set(allActivities.map(act => act.action))];

 const exportToPDF = () => {
  // Helper function to reverse Arabic word order
  const reverseArabicWords = (text) => {
    if (/[\u0600-\u06FF]/.test(text)) {
      return text.split(' ').reverse().join(' ');
    }
    return text;
  };

  const actionCounts = {};
  filteredActivities.forEach(a => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });
  const actions = Object.keys(actionCounts);
  const counts = Object.values(actionCounts);
  const maxCount = Math.max(...counts);
  const colors = ['#0A1F44', '#D4AF37', '#B8860B', '#FFB300', '#1E88E5', '#C2185B'];

  // Draw bars
  const barChartCanvas = actions.map((action, i) => ({
    type: 'rect',
    x: 50,
    y: i * 30,
    w: (counts[i] / maxCount) * 300,
    h: 20,
    color: colors[i % colors.length]
  }));

  // Legend with correct Arabic word order
  const legend = actions.map((action, i) => {
    const labelText = reverseArabicWords(action);
    return [
      { text: '', fillColor: colors[i % colors.length], width: 15, height: 15, margin: [0, 0, 5, 0] },
      { text: `${labelText}: ${counts[i]}`, margin: [0, 0, 0, 0] }
    ];
  });

  const docDefinition = {
    defaultStyle: { font: 'Amiri', fontSize: 10 },
    content: [
      { text: 'Employee Activities Report', style: 'header' },
      { text: `Generated: ${new Date().toLocaleString()}`, style: 'subheader' },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 2, lineColor: '#D4AF37' }], margin: [0, 0, 0, 10] },
      { text: 'Actions Summary', style: 'chartTitle' },
      { canvas: barChartCanvas, margin: [0, 10, 0, 10] },
      {
        table: {
          widths: [15, '*'],
          body: legend
        },
        layout: 'noBorders',
        margin: [50, 10, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*'],
          body: [
            [
              { text: 'Date', style: 'tableHeader' },
              { text: 'Time', style: 'tableHeader' },
              { text: 'Employee', style: 'tableHeader' },
              { text: 'Action', style: 'tableHeader' },
              { text: 'Transaction', style: 'tableHeader' },
            ],
            ...filteredActivities.map((a, i) => [
              { text: a.date, style: i % 2 === 0 ? 'rowEven' : 'rowOdd' },
              { text: a.time, style: i % 2 === 0 ? 'rowEven' : 'rowOdd' },
              { text: a.employee, style: i % 2 === 0 ? 'rowEven' : 'rowOdd', alignment: /[\u0600-\u06FF]/.test(a.employee) ? 'right' : 'left' },
              { text: reverseArabicWords(a.action), style: i % 2 === 0 ? 'rowEven' : 'rowOdd', alignment: /[\u0600-\u06FF]/.test(a.action) ? 'right' : 'left' },
              { text: a.transaction || 'N/A', style: i % 2 === 0 ? 'rowEven' : 'rowOdd' },
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? '#0A1F44' : null),
          textColor: (rowIndex) => (rowIndex === 0 ? 'white' : 'black'),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#BDBDBD',
          vLineColor: () => '#BDBDBD',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 4,
          paddingBottom: () => 4
        },
        margin: [0, 10, 0, 0]
      }
    ],
    styles: {
      header: { fontSize: 24, bold: true, alignment: 'left', color: '#0A1F44', margin: [0, 0, 0, 10] },
      subheader: { fontSize: 12, italics: true, alignment: 'left', margin: [0, 0, 0, 10] },
      chartTitle: { fontSize: 14, bold: true, alignment: 'left', margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fontSize: 12, color: 'white', fillColor: '#0A1F44', alignment: 'center' },
      rowEven: { fillColor: '#F7F7F7' },
      rowOdd: {}
    },
    pageMargins: [40, 60, 40, 60],
    footer: (currentPage, pageCount) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      margin: [0, 10, 0, 0]
    })
  };

  pdfMake.createPdf(docDefinition).open();
};



  return (
    <div className="activities-wrapper">
      <h2>Employee Activities</h2>
      <div className="filters-row">
        <div className="filter-item">
          <label>Date</label>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <div className="filter-item">
          <label>Employee</label>
          <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option>All</option>
            {uniqueEmployees.map((emp, i) => <option key={i}>{emp}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Action</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option>All</option>
            {uniqueActions.map((act, i) => <option key={i}>{act}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Transaction</label>
          <input type="text" placeholder="Search by transaction" value={searchTransaction} onChange={(e) => setSearchTransaction(e.target.value)} />
        </div>
        <div className="filter-item">
          <button className="export-btn" onClick={exportToPDF}>📄 Generate PDF</button>
        </div>
      </div>
      <div className="activities-card">
        <table className="activities-table">
          <thead>
            <tr><th>Date</th><th>Employee</th><th>Action</th><th>Transaction</th></tr>
          </thead>
          <tbody>
            {filteredActivities.map((act, idx) => (
              <tr key={idx}>
                <td>{act.date}<br /><small>{act.time}</small></td>
                <td><FontAwesomeIcon icon={faUserCircle} /> {act.employee}</td>
                <td>{act.action}</td>
                <td>{act.transaction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeActivities;
