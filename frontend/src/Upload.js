import React, { useState } from 'react';
import './Upload.css';
import { 
  FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt, FaTimes,
  FaCloudUploadAlt, FaCheck 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Helper function to format the file size
const formatSize = (size) => {
  if (size < 1024) return `${size} B`;
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  else return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadPage = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showOptions, setShowOptions] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const months = [
    t('upload2.jan'), t('upload2.feb'), t('upload2.mar'), t('upload2.apr'),
    t('upload2.may'), t('upload2.jun'), t('upload2.jul'), t('upload2.aug'),
    t('upload2.sep'), t('upload2.oct'), t('upload2.nov'), t('upload2.dec')
  ];

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return <FaFilePdf className="icon pdf" />;
      case 'xlsx':
      case 'xls': return <FaFileExcel className="icon excel" />;
      case 'docx':
      case 'doc': return <FaFileWord className="icon word" />;
      default: return <FaFileAlt className="icon default" />;
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1),
      status: 'Waiting',
      progress: 0,
    }));
    setFiles(selected);
  };

  const handleUpload = () => {
    if (files.length === 0) return;

    const alreadyUploaded = uploadHistory.some(
      (file) => file.month === selectedMonth && file.year === selectedYear
    );

    if (alreadyUploaded) {
      setShowOptions(true);
    } else {
      setShowOptions(false);
      startUploadingFiles('Completed');
    }
  };

  const startUploadingFiles = (statusText = 'Completed') => {
    const updated = [...files];
    updated.forEach((f, i) => {
      setTimeout(() => {
        f.status = 'Completed';
        f.progress = 100;
        setToastMessage(statusText);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);

        const timestamp = new Date().toLocaleString();
        setUploadHistory(prev => [...prev, {
          name: f.name,
          type: f.file.type,
          time: timestamp,
          month: selectedMonth,
          year: selectedYear,
          status: statusText,   // Save the correct status (Completed / Override Completed / Replace Completed)
        }]);

        setFiles([...updated]);
      }, 500 + i * 500);
    });
  };

  const handleCancel = () => setFiles([]);

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleOverride = () => {
    setUploadHistory(prev => prev.filter(
      (file) => !(file.month === selectedMonth && file.year === selectedYear)
    ));
    setShowOptions(false);
    startUploadingFiles('Override Completed');
  };

  const handleReplace = () => {
    setShowOptions(false);
    startUploadingFiles('Replace Completed');
  };

  return (
    <div className="upload-page">
      <div className="upload-wrapper-card">

        {showNotification && (
          <div className="upload-toast">
            <FaCheck style={{ marginRight: '8px' }} />
            {toastMessage}
          </div>
        )}

        <div className="upload-header-section">
          <div className="calendar-box">
            <div className="year-selector">
              <label htmlFor="yearDropdown">{t('upload2.yearLabel')}</label>
              <select
                id="yearDropdown"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = 2020 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="months-grid">
              {months.map((month, index) => (
                <div
                  key={index}
                  className={`month 
                    ${selectedMonth === index ? 'selected' : ''} 
                    ${uploadHistory.some(file => file.month === index && file.year === selectedYear) ? 'uploaded' : ''}`}
                  onClick={() => setSelectedMonth(index)}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>

          <div className="upload-actions-box">
            <button className="upload-main-btn" onClick={() => document.getElementById('uploadInput').click()}>
              {t('upload2.uploadNewFile')}
            </button>
            <input
              type="file"
              multiple
              hidden
              id="uploadInput"
              onChange={(e) => {
                handleFileChange(e);
                e.target.value = null; // reset input
              }}
            />

{showOptions && (
  <div className="upload-options">
    <div className="option-message">
      {t('upload2.chooseOptionMessage')}
    </div>
    <button onClick={handleOverride}>{t('upload2.override')}</button>
    <button onClick={handleReplace}>{t('upload2.replace')}</button>
  </div>
)}

          </div>
        </div>

        {files.length > 0 && (
          <div className="upload-box">
            <div className="cloud-icon">
              <FaCloudUploadAlt size={48} color="#060640" />
            </div>
            <h2>{t('upload2.title')}</h2>

            <div className="button-group">
              <button onClick={handleCancel} className="cancel">{t('upload2.cancel')}</button>
              <button onClick={handleUpload} className="upload">{t('upload2.upload')}</button>
            </div>

            {files.map((file, index) => (
              <div className="file-row" key={index}>
                {getFileIcon(file.name)}
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{formatSize(file.size)}</span>
                    <span className={`file-status ${file.status.toLowerCase()}`}>
                      {t(`upload2.${file.status.toLowerCase()}`)}
                    </span>
                  </div>
                  <progress value={file.progress} max="100" className="upload-progress" />
                </div>
                <button className="remove-btn" onClick={() => handleRemoveFile(index)}>
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadHistory.some(f => f.month === selectedMonth && f.year === selectedYear) && (
          <div className="upload-history-table fade-slide">
            <h3>{t('upload2.fileHistory')}</h3>
            <table>
              <thead>
                <tr>
                  <th>{t('upload2.file')}</th>
                  <th>{t('upload2.uploaded')}</th>
                  <th>{t('upload2.status')}</th>
                </tr>
              </thead>
              <tbody>
                {uploadHistory
                  .filter(file => file.month === selectedMonth && file.year === selectedYear)
                  .map((f, idx) => (
                    <tr key={idx}>
                      <td className="history-file-name">
                        {getFileIcon(f.name)}
                        <span>{f.name}</span>
                      </td>
                      <td>{months[f.month]} {f.year} - {new Date(f.time).toLocaleString()}</td>
                      <td><FaCheck color="green" /> {f.status}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default UploadPage;


