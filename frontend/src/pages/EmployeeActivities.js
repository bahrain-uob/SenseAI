import React, { useState } from 'react';
import './EmployeeActivities.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';


const allActivities = [
  {
    date: 'Apr 24, 2023',
    time: '10:30 AM',
    employee: 'Ahmed',
    action: 'Inspection',
    transaction: 'TRX123456',
    status: 'Completed',
    avatar: 'https://i.pravatar.cc/40?img=1',
  },
  {
    date: 'Apr 23, 2023',
    time: '03:00 PM',
    employee: 'Ali',
    action: 'Edit',
    transaction: 'TRX11111',
    status: 'Flagged',
    avatar: 'https://i.pravatar.cc/40?img=2',
  },
  {
    date: 'Apr 22, 2023',
    time: '09:00 AM',
    employee: 'Fahad',
    action: 'Upload',
    transaction: 'TRX999999',
    status: 'Pending',
    avatar: 'https://i.pravatar.cc/40?img=3',
  },
];

const getStatusClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'status-completed';
    case 'Flagged':
      return 'status-flagged';
    case 'Pending':
      return 'status-pending';
    default:
      return '';
  }
};

const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Employee', 'Action', 'Transaction', 'Status'];
    const rows = allActivities.map(a => [a.date, a.time, a.employee, a.action, a.transaction, a.status]);
  
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(',')).join('\n');
  
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

  const filteredActivities = allActivities.filter((act) => {
    return (
      (employeeFilter === 'All' || act.employee === employeeFilter) &&
      (actionFilter === 'All' || act.action === actionFilter)
    );
  });

  const uniqueEmployees = [...new Set(allActivities.map(act => act.employee))];
  const uniqueActions = [...new Set(allActivities.map(act => act.action))];

  return (
    <div className="activities-wrapper">
      <h2>Employee Activities</h2>

      <div className="filters">

      <div className="filter-item">
    <label htmlFor="date-filter">Date</label>
    <select id="date-filter">
      <option>All dates</option>
    </select>
  </div>

  <div className="filter-item">
    <label htmlFor="employee-filter">Employee</label>
    <select onChange={(e) => setEmployeeFilter(e.target.value)}>
          <option>All</option>
          {uniqueEmployees.map(emp => <option key={emp}>{emp}</option>)}
        </select>
  </div>

  <div className="filter-item">
    <label htmlFor="action-filter">Action</label>
    <select onChange={(e) => setActionFilter(e.target.value)}>
          <option>All</option>
          {uniqueActions.map(action => <option key={action}>{action}</option>)}
        </select>
  </div>


  <div className="filter-item">
    <label>&nbsp;</label>
    <button className="export-btn" onClick={() => exportToCSV()}>Export</button>
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
            <th>Status</th>
            <th>✔</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((act, index) => (
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
              <td><span className={`status-badge ${getStatusClass(act.status)}`}>{act.status}</span></td>
              <td>✔</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default EmployeeActivities;
