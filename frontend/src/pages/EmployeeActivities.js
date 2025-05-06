import React, { useState } from 'react';

import './EmployeeActivities.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

const allActivities = [
  {
    date: '2023-04-24',
    time: '10:30 AM',
    employee: 'Ahmed',
    action: 'Inspection',
    transaction: 'TRX123456',
  },
  {
    date: '2023-04-23',
    time: '03:00 PM',
    employee: 'Ali',
    action: 'Edit',
    transaction: 'TRX11111',
  },
  {
    date: '2023-04-22',
    time: '09:00 AM',
    employee: 'Fahad',
    action: 'Upload',
    transaction: 'TRX999999',
  },
  {
    date: '2023-04-21',
    time: '11:15 AM',
    employee: 'Sara',
    action: 'Inspection',
    transaction: 'TRX654321',
  },
  {
    date: '2023-04-21',
    time: '03:00 PM',
    employee: 'Sara',
    action: 'Upload',
    transaction: 'TRX654321',
  },
  {
    date: '2023-04-20',
    time: '02:30 PM',
    employee: 'Hassan',
    action: 'Edit',
    transaction: 'TRX22222',
  },
  {
    date: '2023-04-20',
    time: '02:00 PM',
    employee: 'Ahmed',
    action: 'Edit',
    transaction: 'TRX123456',
  },
  {
    date: '2023-04-19',
    time: '04:00 PM',
    employee: 'Ali',
    action: 'Inspection',
    transaction: 'TRX11111',
  },
  {
    date: '2023-04-19',
    time: '08:45 AM',
    employee: 'Noura',
    action: 'Upload',
    transaction: 'TRX888888',
  },
  {
    date: '2023-04-19',
    time: '10:30 AM',
    employee: 'Noura',
    action: 'Edit',
    transaction: 'TRX777777',
  },
  {
    date: '2023-04-18',
    time: '01:00 PM',
    employee: 'Omar',
    action: 'Inspection',
    transaction: 'TRX777777',
  },
];

const exportToCSV = () => {
  const headers = ['Date', 'Time', 'Employee', 'Action', 'Transaction'];
  const rows = allActivities.map(a => [a.date, a.time, a.employee, a.action, a.transaction]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'employee_activities.csv');
  document.body.appendChild(link);
  link.click();
};

const EmployeeActivities = () => {
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [searchTransaction, setSearchTransaction] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredActivities = allActivities.filter((act) => {
    const formattedActDate = new Date(act.date).toISOString().split('T')[0];
    return (
      (dateFilter === '' || formattedActDate === dateFilter) &&
      (employeeFilter === 'All' || act.employee === employeeFilter) &&
      (actionFilter === 'All' || act.action === actionFilter) &&
      (searchTransaction === '' || act.transaction.toLowerCase().includes(searchTransaction.toLowerCase()))
    );
  });

  const uniqueEmployees = [...new Set(allActivities.map(act => act.employee))];
  const uniqueActions = [...new Set(allActivities.map(act => act.action))];

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
            {uniqueEmployees.map(emp => <option key={emp}>{emp}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Action</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option>All</option>
            {uniqueActions.map(action => <option key={action}>{action}</option>)}
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

