import React, { useState } from 'react';
import './Upload.css';
import { FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt, FaTimes ,FaCloudUploadAlt,FaCheck} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Format bytes into readable size
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
    const updated = [...files];
    updated.forEach((f, i) => {
      setTimeout(() => {
        f.status = 'Completed';
        f.progress = 100;
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000); // hide after 3 seconds
        const timestamp = new Date().toLocaleString();
        setUploadHistory(prev => [...prev, {
          name: f.name,
          type: f.file.type,
          time: timestamp,
        }]);
        setFiles([...updated]);
      }, 500 + i * 500); // Staggered simulation
    });
  };
  
  
  

  const handleCancel = () => setFiles([]);

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="upload-page">
      {showNotification && (
  <div className="upload-toast">
     {t('upload2.completed') || 'Upload completed successfully!'}
  </div>
)}

      <div className="upload-box">
      <div className="cloud-icon">
  <FaCloudUploadAlt size={48} color="#060640" />
</div>
        <h2>{t('upload2.title')}</h2>
        <p>{t('upload2.instruction')} <span className="browse">{t('upload2.browse')}</span></p>

        <input type="file" multiple hidden id="uploadInput" onChange={handleFileChange} />
        <label htmlFor="uploadInput" className="browse-btn">{t('upload2.browse')}</label>

        <div className="button-group">
          <button onClick={handleCancel} className="cancel">{t('upload2.cancel')}</button>
          <button onClick={handleUpload} className="upload">{t('upload2.upload')}</button>
        </div>

        {files.map((file, index) => (
         <div className="file-row">
  {getFileIcon(file.name)}
  <div className="file-info">
    <div className="file-name">{file.name}</div>
    <div className="file-meta">
      <span className="file-size">{formatSize(file.size)}</span>
      <span className={`file-status ${file.status.toLowerCase()}`}>
        {t(`upload.${file.status.toLowerCase()}`)}
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
       
      {uploadHistory.length > 0 && (
        <div className="upload-history">
          <h3>{t('upload2.historyTitle')}</h3>
          {uploadHistory.map((f, idx) => (
            <div key={idx} className="history-item">
            {getFileIcon(f.name)}
          
            <div className="file-details">
              <span className="file-name">{f.name}</span>
              <span className="upload-time">
                {new Date(f.time).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          
            <div className="status-right">
              <FaCheck color="green" />
              {t('upload2.completed')}
            </div>
          </div>
          
          
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
