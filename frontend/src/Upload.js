import React, { useState } from 'react';
import './Upload.css';
import { 
  FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt, FaTimes,
  FaCloudUploadAlt, FaCheck 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { CognitoUserPool } from 'amazon-cognito-identity-js';

//Helper function to format the file size 
const formatSize = (size) => {
  if (size < 1024) return `${size} B`; // If file size is less than 1 KB , show it in Bytes (B)
  else if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`; // If file size is less than 1 MB → show in Kilobytes (KB)
  else return `${(size / (1024 * 1024)).toFixed(1)} MB`;// If larger → show in Megabytes (MB)
};

const UploadPage = () => {
  const { t } = useTranslation(); //translation 
  const [files, setFiles] = useState([]); // Files selected by the user to upload
  const [uploadHistory, setUploadHistory] = useState([]);      // History of already uploaded files
  const [showNotification, setShowNotification] = useState(false); // To show success/failure messages
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Year picker
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());  // Month picker
  const [showOptions, setShowOptions] = useState(false);       // Show Override / Replace buttons
  const [toastMessage, setToastMessage] = useState('');        // pop up message text


  const months = [
    t('upload2.jan'), t('upload2.feb'), t('upload2.mar'), t('upload2.apr'),
    t('upload2.may'), t('upload2.jun'), t('upload2.jul'), t('upload2.aug'),
    t('upload2.sep'), t('upload2.oct'), t('upload2.nov'), t('upload2.dec')
  ];

  //  Get file icon based on file extension
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

  //  When user selects new files
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1), // in KB
      status: 'Waiting',                   // Waiting state
      progress: 0,                         // No progress yet
    }));
    setFiles(selected);
  };

  //  When user clicks "Upload"
  const handleUpload = () => {
    if (files.length === 0) return; // No files to upload
  
    // Check if there is already a file uploaded for the selected month/year
    const alreadyUploaded = uploadHistory.some(
      (file) => file.month === selectedMonth && file.year === selectedYear
    );
  
    if (alreadyUploaded) {
      setShowOptions(true);  // Show Override or Replace options
    } else {
      setShowOptions(false); // No previous upload - just upload
      startUploadingFilesToBackend();
    }
  };

  //  Upload selected file to backend (API Gateway)
  const startUploadingFilesToBackend = () => {
    const userPool = new CognitoUserPool({
      UserPoolId: 'me-south-1_h4hXEsiSh',
      ClientId: '4o8u68vk9loi71g7afpno9m9m5',
    });
  
    const user = userPool.getCurrentUser();
  
    if (user) {
      user.getSession(async (err, session) => {
        if (err) {
          console.error('Session error:', err);
          setToastMessage('Error getting user session.');
          setShowNotification(true);
          return;
        }
  
        const idToken = session.getIdToken().getJwtToken(); // Token for Authorization
  
        const file = files[0].file; // (currently upload one file only)
  
        const formData = new FormData();
        formData.append('file', file);
  
        try {
          const response = await fetch('https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/uploadobj', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`, // Secure the request
            },
            body: formData,
          });
  
          if (response.ok) {
            // Success
            setToastMessage(t('upload2.uploadCompleted'));
            setShowNotification(true);

            const timestamp = new Date().toLocaleString();
            setUploadHistory(prev => [...prev, {
              name: file.name,
              type: file.type,
              time: timestamp,
              month: selectedMonth,
              year: selectedYear,
            }]);
            setFiles([]); // Clear selected files
          } else {
            const errorData = await response.json();
            console.error('Upload error:', errorData);
            setToastMessage('Upload failed ');
            setShowNotification(true);
          }
        } catch (uploadError) {
          console.error('Upload exception:', uploadError);
          setToastMessage('Upload failed ');
          setShowNotification(true);
        }
      });
    } else {
      setToastMessage('No user logged in.');
      setShowNotification(true);
    }
  };

  //  Cancel file selection
  const handleCancel = () => setFiles([]);

  //  Remove individual file from selected list
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  //  Simulate a successful upload animation locally (for testing only)
  const startUploadingFiles = (customMessage = t('upload2.uploadCompleted')) => {
    const updated = [...files];
    updated.forEach((f, i) => {
      setTimeout(() => {
        f.status = 'Completed';
        f.progress = 100;
        setToastMessage(customMessage);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
  
        const timestamp = new Date().toLocaleString();
        setUploadHistory(prev => [...prev, {
          name: f.name,
          type: f.file.type,
          time: timestamp,
          month: selectedMonth,
          year: selectedYear,
        }]);
  
        setFiles([...updated]);
      }, 500 + i * 500); // delay between files
    });
  };

  //  If user chooses "Override" old file
  const handleOverride = () => {
    setUploadHistory(prev => prev.filter(
      (file) => !(file.month === selectedMonth && file.year === selectedYear)
    ));
    setShowOptions(false);
    startUploadingFiles(t('upload2.overrideCompleted'));
  };

  //  If user chooses "Replace" (keep old + add new)
  const handleReplace = () => {
    setShowOptions(false);
    startUploadingFiles(t('upload2.replaceCompleted'));
  };

  return (
    <div className="upload-page">
      <div className="upload-wrapper-card">

        {/* Notification Toast */}
        {showNotification && (
          <div className="upload-toast">
            <FaCheck style={{ marginRight: '8px' }} />
            {toastMessage}
          </div>
        )}

        {/* Upload Section */}
        <div className="upload-header-section">
          {/* Calendar  */}
          <div className="calendar-box">
            {/* Year Dropdown */}
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

            {/* Months Grid */}
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

          {/* Upload New File Button */}
          <div className="upload-actions-box">
            <button className="upload-main-btn" onClick={() => document.getElementById('uploadInput').click()}>
              {t('upload2.uploadNewFile')}
            </button>
            <input
              type="file"
              multiple
              hidden
              id="uploadInput"
              onChange={handleFileChange}
            />

            {/* Override/Replace Options */}
            {showOptions && (
              <div className="upload-options">
                <button onClick={handleOverride}>{t('upload2.override')}</button>
                <button onClick={handleReplace}>{t('upload2.replace')}</button>
              </div>
            )}
          </div>
        </div>

        {/* If any files are selected */}
        {files.length > 0 && (
          <div className="upload-box">
            <div className="cloud-icon">
              <FaCloudUploadAlt size={48} color="#060640" />
            </div>
            <h2>{t('upload2.title')}</h2>

            {/* Buttons: Cancel / Upload */}
            <div className="button-group">
              <button onClick={handleCancel} className="cancel">{t('upload2.cancel')}</button>
              <button onClick={handleUpload} className="upload">{t('upload2.upload')}</button>
            </div>

            {/* List Selected Files */}
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

        {/* Upload History Section */}
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
                      <td><FaCheck color="green" /> {t('upload2.completed')}</td>
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
