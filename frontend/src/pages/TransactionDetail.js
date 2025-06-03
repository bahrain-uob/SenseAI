import React, { useState, useEffect } from "react";
import "./TransactionDetail.css";
import {
  FaBoxOpen, FaGlobe, FaMoneyBill, FaBalanceScale,
  FaChartLine, FaFileAlt, FaFlag, FaTrash, FaLock, FaClock, FaTimes
} from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useParams } from 'react-router-dom';
import { poolData } from '../awsConfig.js';
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
const TransactionDetail = () => {
  const { trxId } = useParams();  // 🔥 Dynamic Transaction ID
  
  const cognitoUser = poolData.getCurrentUser();
  let userName = 'Unknown';
  if (cognitoUser) {
    cognitoUser.getSession((err, session) => {
      if (!err) {
        cognitoUser.getUserAttributes((err, attributes) => {
          if (!err) {
            const emailAttr = attributes.find(attr => attr.getName() === 'email');
            const email = emailAttr ? emailAttr.getValue() : 'unknown@example.com';
            userName = email.split(/[@.]/)[0];
            console.log('User name extracted from email:', userName);
          }
        });
      }
    });
  }

  const getCurrentUser = () => {
    const user = poolData.getCurrentUser(); // 🔥 Fix here
    if (user) {
      return new Promise((resolve, reject) => {
        user.getSession((err, session) => {
          if (err) {
            reject(err);
          } else {
            const email = session.getIdToken().payload.email; // 🔥 Use payload.email
            resolve(email);
          }
        });
      });
    } else {
      return Promise.resolve(null);
    }
  };

  const saveActionForTransaction = async (transactionId, action) => {
    const user = await getCurrentUser();
    if (user) {
      const key = `action_${user}_${transactionId}`;
      localStorage.setItem(key, action);
    }
  };

  const getSavedAction = async (transactionId) => {
    const user = await getCurrentUser();
    if (user) {
      const key = `action_${user}_${transactionId}`;
      return localStorage.getItem(key);
    }
    return null;
  };

  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [showFlagDetails, setShowFlagDetails] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedExplanation, setSelectedExplanation] = useState("");
  const [selectedFlager, setSelectedFlager] = useState("");
  const [showNotFlaggedComment, setShowNotFlaggedComment] = useState(false);
  const [notFlaggedReason, setNotFlaggedReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);

  const arabicActions = ["تعديل البيان", "تحويل الى الشؤون القانونية"];
  const errorTypes = ["السجل التجاري", "بند التعرفة", "أخطاء إحصائية", "مستندات ناقصة", "رسوم جمركية", "القيمة الجمركية"];
  const errorExplanations = ["ميناء الشحن", "قيمة البضاعة الجمركية", "تخفيض/خصم", "أجور الشحن", "وصف البضاعة", "منشأ البضاعة", "(سيل)ختم الجمارك", "الوزن", "CBM", "FOC", "العملة", "تصنيف البضاعة", "بطاقات المرور", "الفاتورة", "العدد", "رسوم شهادة المنشأ", "مبلغ التأمين غير مطابق", "رسوم الأشعة"];
  const flagers = ["شركة التخليص", "المستورد"];

  const logAction = async (action, type = "", explanation = "", flager = "") => {
    try {
      await axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
        TransactionID: trxId,
        EmployeeName: userName,
        Action: action,
        TypeOfError: type,
        ErrorExplanation: explanation,
        Flager: flager,
        Timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get(`https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities?TransactionID=${trxId}`);
      setActivityLogs(response.data);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };
  
    
    const exportToPDF = () => {
  const actionCounts = {};
  activityLogs.forEach(log => {
    const label = log.Action || 'غير محدد';
    actionCounts[label] = (actionCounts[label] || 0) + 1;
  });

  const actions = Object.keys(actionCounts);
  const counts = Object.values(actionCounts);
  const colors = ['#004c6d', '#247ba0', '#5bc0be', '#b2dbbf', '#f3ffbd', '#ff1654'];

  const legendBody = actions.map((label, i) => {
    return [
      {
        text: '',
        fillColor: colors[i % colors.length],
        width: 12,
        height: 12,
        margin: [0, 0, 5, 0]
      },
      {
        text: `${label} : ${counts[i]}`,
        fontSize: 9,
        alignment: 'right',
        rtl: true
      }
    ];
  });

  const docDefinition = {
    defaultStyle: {
      font: 'Amiri',
      fontSize: 10,
      alignment: 'right',
      rtl: true
    },
    content: [
      { text: 'تقرير الإجراءات والمخالفات', style: 'header' },
      { text: `المراجع: ${userName} | تم التوليد: ${new Date().toLocaleString()}`, style: 'subheader' },

      {
        table: {
          body: legendBody
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15]
      },

      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*'],
          body: [
            [
              { text: 'العملية', style: 'tableHeader' },
              { text: 'النوع', style: 'tableHeader' },
              { text: 'الشرح', style: 'tableHeader' },
              { text: 'المخالف', style: 'tableHeader' },
              { text: 'التاريخ', style: 'tableHeader' }
            ],
            ...activityLogs.map((log) => [
              { text: log.Action || '-', alignment: 'right', rtl: true },
              { text: log.TypeOfError || '-', alignment: 'right', rtl: true },
              { text: log.ErrorExplanation || '-', alignment: 'right', rtl: true },
              { text: log.Flager || '-', alignment: 'right', rtl: true },
              { text: new Date(log.Timestamp).toLocaleString(), alignment: 'center' }
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
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        color: '#0A1F44',
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 10,
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'white',
        fillColor: '#0A1F44',
        alignment: 'center'
      }
    },
    pageMargins: [30, 40, 30, 40],
    footer: (currentPage, pageCount) => ({
      text: `الصفحة ${currentPage} من ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      margin: [0, 10, 0, 0],
      font: 'Amiri'
    })
  };

  pdfMake.createPdf(docDefinition).open();
};



  const handleFlagSelect = (action) => {
    setSelectedAction(action);
    saveActionForTransaction(trxId, action);  // 🔥 Save to localStorage
    setShowFlagMenu(false);
    setShowFlagDetails(true);
  };

  const handleSubmitFlag = () => {
    const logText = `مخالف: ${selectedAction}`;
    logAction(logText, selectedType, selectedExplanation, selectedFlager);
    setSelectedAction(logText);
    saveActionForTransaction(trxId, logText);  // 🔥 Save to localStorage
    setShowFlagDetails(false);
    setSelectedType("");
    setSelectedExplanation("");
    setSelectedFlager("");
  };

  const handleCloseCase = () => {
    const logText = "إغلاق تدقيق المعاملة";
    setSelectedAction(logText);
    saveActionForTransaction(trxId, logText);  // 🔥 Save
    logAction(logText);
    setShowNotFlaggedComment(false);
    setNotFlaggedReason("");
  };

  const handlePending = () => {
    const logText = "قيد التدقيق";
    setSelectedAction(logText);
    saveActionForTransaction(trxId, logText);  // 🔥 Save
    logAction(logText);
  };

  useEffect(() => {
    axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
      TransactionID: trxId,
      Action: "Open",
      EmployeeName: userName,
      Timestamp: new Date().toISOString()
    }).catch(console.error);

    fetchActivityLogs();
  }, []);

  useEffect(() => {  // 🔥 Load saved action on mount
    const fetchSavedAction = async () => {
      const action = await getSavedAction(trxId);
      if (action) {
        setSelectedAction(action);
      }
    };
    fetchSavedAction();
  }, [trxId]);

  const data = {
    hsCode: "11022000",
    description: "Maize (corn) flour",
    country: "United Kingdom",
    regime: "IM",
    exporterName: "Jordan Export Co.",
    exporterCR: "EXP12345",
    commercialDesc: "Maize flour refined",
    hsRate: "5%",
    packageCode: "CS",
    supUnit: "kg",
    currency: "GBP",
    localAmount: "15000",
    vatRate: "5%",
    vatBHD: "750",
    fees: "300"
  };

  const Section = ({ title, rows, icon }) => (
    <div className="section">
      <h3>{icon} {title}</h3>
      <table>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}><th>{label}</th><td>{value || "-"}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="report-container">
      <h2 className="report-title">تفاصيل المعاملة</h2>
      <div className="transaction-actions">
        <span className="status-label">الإجراء المتخذ:</span>
        <div className="flag-container">
          <button className="action-btn flag" onClick={() => setShowFlagMenu(prev => !prev)}>
            <FaFlag /> مخالف
          </button>
          {showFlagMenu && (
            <ul className="flag-dropdown">
              {arabicActions.map((action, idx) => (
                <li key={idx} onClick={() => handleFlagSelect(action)}>{action}</li>
              ))}
            </ul>
          )}
        </div>
        <button className="action-btn not-flagged" onClick={() => setShowNotFlaggedComment(true)}>غير مخالف</button>
        <button className="action-btn pending" onClick={handlePending}><FaClock /> قيد التدقيق</button>
        <button className="action-btn report-btn" onClick={exportToPDF}>
          📄 Generate PDF
        </button>
      </div>

      {showFlagDetails && (
        <div className="flag-details">
          <label>نوع الخطأ:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">اختر</option>
            {errorTypes.map((type, idx) => (<option key={idx} value={type}>{type}</option>))}
          </select>
          <label>شرح الخطأ:</label>
          <select value={selectedExplanation} onChange={(e) => setSelectedExplanation(e.target.value)}>
            <option value="">اختر</option>
            {errorExplanations.map((exp, idx) => (<option key={idx} value={exp}>{exp}</option>))}
          </select>
          <label>المخالف:</label>
          <select value={selectedFlager} onChange={(e) => setSelectedFlager(e.target.value)}>
            <option value="">اختر</option>
            {flagers.map((f, idx) => (<option key={idx} value={f}>{f}</option>))}
          </select>
          <button className="submit-log" onClick={handleSubmitFlag}>تسجيل المخالفة</button>
        </div>
      )}

      {showNotFlaggedComment && (
        <div className="not-flagged-comment">
          <textarea value={notFlaggedReason} onChange={(e) => setNotFlaggedReason(e.target.value)} placeholder="اكتب سبب عدم المخالفة..."></textarea>
          <button className="submit-log" onClick={() => { logAction(`غير مخالف: ${notFlaggedReason}`); handleCloseCase(); }}>تسجيل وإغلاق المعاملة</button>
        </div>
      )}

      {selectedAction && <div className="selected-action">الإجراء المختار: {selectedAction}</div>}

      <div className="row-group">
        <Section title="Product & HS Code" icon={<FaBoxOpen />} rows={[
          ["HS Code", data.hsCode], ["Description", data.description], ["Regime", data.regime], ["HS Rate", data.hsRate], ["Commercial Description", data.commercialDesc], ["Package Code", data.packageCode], ["Supplementary Unit", data.supUnit]
        ]} />
        <Section title="Origin & Export Details" icon={<FaGlobe />} rows={[
          ["Country of Origin", data.country], ["Exporter CR", data.exporterCR], ["Exporter Name", data.exporterName]
        ]} />
        <Section title="Invoice & Value Details" icon={<FaMoneyBill />} rows={[
          ["Invoice Currency", data.currency], ["Local Amount", data.localAmount], ["VAT Rate", data.vatRate], ["VAT BHD", data.vatBHD], ["Fees", data.fees]
        ]} />
      </div>
    </div>
  );
};

export default TransactionDetail;