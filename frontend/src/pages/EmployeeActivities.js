import React, { useState, useEffect } from 'react';
import './EmployeeActivities.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const EmployeeActivities = () => {
  const [allActivities, setAllActivities] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [searchTransaction, setSearchTransaction] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get('https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities');

        const parsed = res.data.map((item) => {
  const d = new Date(item.Timestamp); 
  if (isNaN(d)) return null;

  const [datePart, timePart] = d.toLocaleString().split(', ');
  return {
    date: datePart,
    time: timePart,
    employee: item.EmployeeName,
    action: item.Action,
    transaction: item.TransactionID,
  };
}).filter(Boolean); // removes any null entries


        setAllActivities(parsed);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = allActivities.filter((act) => {
    const formattedActDate = new Date(`${act.date} ${act.time}`);
    if (isNaN(formattedActDate)) return false;

    const formattedFilterDate = new Date(dateFilter).toLocaleDateString();

    return (
      (dateFilter === '' || formattedActDate.toLocaleDateString() === formattedFilterDate) &&
      (employeeFilter === 'All' || act.employee === employeeFilter) &&
      (actionFilter === 'All' || act.action === actionFilter) &&
      (searchTransaction === '' || act.transaction.toLowerCase().includes(searchTransaction.toLowerCase()))
    );
  });

  const uniqueEmployees = [...new Set(allActivities.map(act => act.employee))];
  const uniqueActions = [...new Set(allActivities.map(act => act.action))];

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Employee', 'Action', 'Transaction'];
    const rows = filteredActivities.map(a => [a.date, a.time, a.employee, a.action, a.transaction]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'employee_activities.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="activities-wrapper">
      <h2>Employee Activities</h2>

      <div className="filters-row">
        <div className="filter-item">
          <label htmlFor="date-filter">Date</label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="filter-item">
          <label>Employee</label>
          <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option>All</option>
            {uniqueEmployees.map((emp, i) => <option key={`${emp}-${i}`}>{emp}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Action</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option>All</option>
            {uniqueActions.map((action, i) => <option key={`${action}-${i}`}>{action}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Transaction</label>
          <input
            type="text"
            placeholder="Search by transaction..."
            value={searchTransaction}
            onChange={(e) => setSearchTransaction(e.target.value)}
            className="search-transaction-input"
          />
        </div>

        <div className="filter-item">
          <label>&nbsp;</label>
          <button className="export-btn" onClick={exportToCSV}>Export</button>
        </div>
      </div>

      <div className="activities-card">
        <table className="activities-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Action</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                  No activities found.
                </td>
              </tr>
            ) : (
              filteredActivities.map((act, index) => (
                <tr key={index}>
                  <td>{act.date}<br /><small>{act.time}</small></td>
                  <td>
                    <div className="employee-info">
                      <FontAwesomeIcon icon={faUserCircle} size="lg" />
                      <span>{act.employee}</span>
                    </div>
                  </td>
                  <td>{act.action}</td>
                  <td>{act.transaction}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeActivities;

