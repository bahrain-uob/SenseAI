import { useEffect } from 'react';
import React, { useState } from 'react';
import './Upload.css';
import {
  FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt, FaTimes,
  FaCloudUploadAlt, FaCheck
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});



  useEffect(() => {
    async function fetchUploadHistory() {
      try {
        const response = await fetch('https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/uploadhistory');
        if (response.ok) {
          const data = await response.json();
          const parsed = data.map(file => {
            const match = file.key.match(/^(\d{4})-(\d{1,2})-upload/);
            let year, month;
            if (match) {
              year = parseInt(match[1]);
              month = parseInt(match[2]) - 1;
            } else if (file.lastModified) {
              const dt = new Date(file.lastModified);
              year = dt.getFullYear();
              month = dt.getMonth();
            }
          
            // Fallback date if lastModified is missing
            const fallbackDate = (year !== undefined && month !== undefined)
              ? new Date(year, month, 15).toISOString()
              : null;
          
            return {
              name: file.key,
              key: file.key,
              size: file.size,
              lastModified: file.lastModified || fallbackDate,
              year,
              month,
              status: 'Completed'
            };
          });
          
          
          setUploadHistory(parsed);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    fetchUploadHistory();
  }, []);

  const getFileIcon = (name) => {
    if (!name) return <FaFileAlt className="icon default" />;
    const ext = name.split('.').pop().toLowerCase();
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
    setShowOptions(false); // hide modal if open
    setShowConfirm(false); // important: stop loop
  };
  

  const handleUpload = async () => {
    if (files.length === 0) return;
   
    await startUploadingFiles('Completed');
  };

  const startUploadingFiles = async (statusText) => {
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', files[0].file);

      const res = await fetch(`https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/uploadobj?type=${files[0].file.type}&month=${selectedMonth}&year=${selectedYear}`);
      const { uploadUrl } = await res.json();

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setFiles(prev => {
            const updated = [...prev];
            updated[0].progress = percent;
            updated[0].status = 'Uploading';
            return updated;
          });
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          const timestamp = new Date().toLocaleString();
          setToastMessage('Upload completed ✅');
          setShowNotification(true);
          setUploadHistory(prev => [
            ...prev,
            {
              name: files[0].name,
              type: files[0].file.type,
              lastModified: new Date().toISOString(),
              month: selectedMonth,
              year: selectedYear,
              status: statusText
            }
          ]);
          setFiles(prev => {
            const updated = [...prev];
            updated[0].progress = 100;
            updated[0].status = statusText;
            return updated;
          });
          setTimeout(() => setShowNotification(false), 3000);
        } else {
          setUploadError('Upload failed. Server error.');
        }
      };

      xhr.onerror = () => {
        setUploadError('Upload failed. Network error.');
      };

      xhr.setRequestHeader('Content-Type', files[0].file.type);
      xhr.send(files[0].file);
    } catch (err) {
      console.error(err);
      setUploadError('Upload failed.');
    } finally {
      setUploading(false);
      setShowOptions(false);
    }
  };

  const handleCancel = () => setFiles([]);

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleOverride = () => {
    if (files.length === 0) return;


    setUploadHistory(prev => prev.filter(
      file => !(file.month === selectedMonth && file.year === selectedYear)
    ));
    startUploadingFiles('Edit Completed');
  };

  const handleReplace = async () => {
   

    if (files.length === 0) return;
  
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    setShowOptions(false);
  
    try {
      // ✅ Step 1: Call the /replace API to get signed S3 URL
      const response = await fetch(
        `https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/replace?type=${files[0].file.type}&month=${selectedMonth}&year=${selectedYear}`,
        { method: 'POST' } // <-- Must be POST
      );
      const raw = await response.json(); // raw.body is still a string
const data = JSON.parse(raw.body); // parse it again
const uploadUrl = data.uploadUrl;
     
  
      // ✅ Step 2: Upload the file to S3 using the signed URL
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
  
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setFiles(prev => {
            const updated = [...prev];
            updated[0].progress = 100;
            updated[0].status = 'Completed';
            return updated;
          });
          
          // ✅ Trigger UI again
          setFiles([...files]); // <-- force UI update
          
        }
      });
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const timestamp = new Date().toLocaleString();
          setToastMessage('File replaced successfully ✅');
          setShowNotification(true);
          setUploadSuccess(true);
  
          setUploadHistory(prev => [
            ...prev.filter(f => !(f.month === selectedMonth && f.year === selectedYear)),
            {
              name: files[0].name,
              type: files[0].file.type,
              time: timestamp,
              month: selectedMonth,
              year: selectedYear,
              status: 'Override Completed',
            }
          ]);
  
          setFiles(prev => {
            const updated = [...prev];
            updated[0].progress = 100;
            updated[0].status = 'Completed';
            return updated;
          });
          
          // ✅ Trigger UI again
          setFiles([...files]); // <-- force UI update
          
  
          setTimeout(() => setShowNotification(false), 3000);
        } else {
          console.error('Replace upload failed:', xhr.responseText);
          setUploadError('Replace failed. Server error.');
        }
      };
  
      xhr.onerror = () => {
        console.error('Replace upload failed: network error');
        setUploadError('Replace failed. Network error.');
      };
  
      xhr.setRequestHeader('Content-Type', files[0].file.type);
      xhr.send(files[0].file);
  
    } catch (error) {
      console.error('Replace error:', error);
      setUploadError('Replace failed. Could not fetch pre-signed URL.');
    } finally {
      setUploading(false);
    }
  };
  
  

  const months = [
    t('upload2.jan'), t('upload2.feb'), t('upload2.mar'), t('upload2.apr'),
    t('upload2.may'), t('upload2.jun'), t('upload2.jul'), t('upload2.aug'),
    t('upload2.sep'), t('upload2.oct'), t('upload2.nov'), t('upload2.dec')
  ];
 
  return (
    <div className="upload-page">
      <div className="upload-wrapper-card"><h1>{t('upload2.title')}</h1>
        {showNotification && (
          <div className="upload-toast">
            <FaCheck style={{ marginRight: '8px' }} />
            {toastMessage}
          </div>
        )}
     {showConfirm && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Confirm Action</h3>
      <p>Are you sure you want to continue with this action?</p>

      <div className="modal-buttons">

       {/* YES: triggers upload */}
       <button className="confirm-btn" onClick={() => {
  setShowConfirm(false);
  // let the user manually click the upload button afterward
}}>
  Yes
</button>


{/* CANCEL: closes modal and clears any file input */}
<button className="cancel-btn" onClick={() => {
  setShowConfirm(false);
  setFiles([]); // ⛔ clear pending files to avoid showing upload box
}}>
  Cancel
</button>

      </div>
    </div>
  </div>
)}

        <div className="upload-header-section">
          
          <div className="calendar-box">
            <div className="year-selector">
              <label>{t('upload2.yearLabel')}</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="months-grid">
            {months.map((month, index) => {
  const monthHasFile = uploadHistory.some(f => f.month === index && f.year === selectedYear);

  return (
    <div
      key={index}
      className={`month ${selectedMonth === index ? 'selected' : ''} ${monthHasFile ? 'uploaded' : ''}`}
      onClick={() => {
        setSelectedMonth(index);
        if (uploadHistory.some(f => f.month === index && f.year === selectedYear)) {
          setShowOptions(true); // 👉 Show proper modal with Edit / Override
        }
      }}
      
    >
      {month}
    </div>
  );
})}

            </div>
          </div>

          <div className="upload-actions-box">
          {uploadHistory.some(f => f.month === selectedMonth && f.year === selectedYear) ? (
  <button className="upload-main-btn disabled" onClick={() => setShowOptions(true)}>
    {t('upload2.uploadNewFile')}
  </button>
) : (
  <>
    <button
  className="upload-main-btn"
  onClick={() => {
    // if month already has file, show options modal instead of input
    if (uploadHistory.some(f => f.month === selectedMonth && f.year === selectedYear)) {
      setShowOptions(true);
    } else {
      document.getElementById('uploadInput')?.click();
    }
  }}
>
  {t('upload2.uploadNewFile')}
</button>

    <input type="file" hidden id="uploadInput" onChange={handleFileChange} />
  </>
)}

            <input type="file" hidden id="uploadInput" onChange={handleFileChange} />

            {showOptions && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>File Already Exists</h3>
      <p>
  {files.length > 0
    ? 'Are you sure you want to continue with this action?'
    : 'This month already has an uploaded file. You cannot upload again unless you override or edit it.'}
</p>

      <div className="modal-buttons">
      <button className="confirm-btn" onClick={() => {
  if (files.length === 0) {
    document.getElementById('uploadInput').click(); // <-- trigger file input
  } else {
    setConfirmAction(() => handleOverride);
    setShowConfirm(true);
    setShowOptions(false);
  }
}}>
  Edit
</button>

<button className="cancel-btn" onClick={() => {
  if (files.length === 0) {
    document.getElementById('uploadInput').click(); // <-- trigger file input
  } else {
    setConfirmAction(() => handleReplace);
    setShowConfirm(true);
    setShowOptions(false);
  }
}}>
  Override
</button>

        <button className="cancel-btn" onClick={() => setShowOptions(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        </div>

        {files.length > 0 && (
          <div className="upload-box">
            <div className="cloud-icon"><FaCloudUploadAlt size={48} /></div>
            <h2>{t('upload2.title')}</h2>
            <div className="button-group">
              <button onClick={handleCancel}>{t('upload2.cancel')}</button>
              <button onClick={handleUpload}>{t('upload2.upload')}</button>
            </div>

            {files.map((file, index) => (
              <div className="file-row" key={index}>
                {getFileIcon(file.name)}
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{formatSize(file.size)}</span>
                    <span className={`file-status ${file.status.toLowerCase()}`}>{t(`upload2.${file.status.toLowerCase()}`)}</span>
                  </div>
                  <progress value={file.progress} max="100" className="upload-progress" />
                </div>
                <button className="remove-btn" onClick={() => handleRemoveFile(index)}><FaTimes /></button>
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
                  .map((file, idx) => (
                    <tr key={idx}>
                      <td className="history-file-name">
                        {getFileIcon(file.name)} <span>{<div className="file-name" title={file.name}>{file.name}</div>
                      }</span>
                      </td>
                      <td>{new Date(file.lastModified).toLocaleString()}</td>
                      <td><FaCheck color="green" /> {file.status}</td>
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



