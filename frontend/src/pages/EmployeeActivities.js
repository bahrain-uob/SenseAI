import React, { useState, useEffect, useRef } from 'react';
import './EmployeeActivities.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { amiriFontBase64 } from '../fonts/Amiri-Regular-base64'; // Base64 import

// Initialize pdfMake with Amiri font
pdfMake.vfs = {
  ...pdfFonts.vfs,
  'Amiri-Regular.ttf': amiriFontBase64
};

pdfMake.fonts = {
  ...pdfMake.fonts,
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
          transaction: item["Reference Number"],
          itemNo: item["Item Number"], //changed!!!!!
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
    const docDefinition = {
      defaultStyle: { font: 'Amiri', fontSize: 10 },
      content: [
        { text: 'تقرير أنشطة الموظف', style: 'header' },
        { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader' },
        { text: '\n\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: 'Date', style: 'tableHeader' },
                { text: 'Employee', style: 'tableHeader' },
                { text: 'Action', style: 'tableHeader' },
                { text: 'Transaction', style: 'tableHeader' },
              ],
              ...filteredActivities.map(a => [
                { text: a.date },
                { text: a.employee, alignment: /[\u0600-\u06FF]/.test(a.employee) ? 'right' : 'left' },
                { text: a.action, alignment: /[\u0600-\u06FF]/.test(a.action) ? 'right' : 'left' },
                { text: a.transaction || 'N/A' }
              ]),
            ],
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? '#2E86C1' : rowIndex % 2 === 0 ? '#F9F9F9' : null),
            textColor: (rowIndex) => (rowIndex === 0 ? 'white' : 'black'),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },
      ],
      styles: {
        header: { fontSize: 24, bold: true, alignment: 'center', margin: [0, 0, 0, 10], color: '#2E86C1' },
        subheader: { fontSize: 12, italics: true, alignment: 'center', margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, color: 'white', fillColor: '#2E86C1', fontSize: 12, alignment: 'center' },
      },
      pageMargins: [30, 40, 30, 40],
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
