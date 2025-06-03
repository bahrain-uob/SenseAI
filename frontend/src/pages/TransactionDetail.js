import React, { useState, useEffect } from "react";
import "./TransactionDetail.css";
import {
  FaBoxOpen, FaGlobe, FaMoneyBill, FaBalanceScale,
  FaChartLine, FaFileAlt, FaFlag, FaTrash, FaLock, FaClock, FaTimes
} from "react-icons/fa";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useParams } from 'react-router-dom';
import { poolData } from '../awsConfig.js';

const TransactionDetail = () => {
 const { reference_number, item_number } = useParams();
// 🔥 Dynamic Transaction ID
  
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

  const saveActionForTransaction = async (reference_number, item_number , action) => {
    const user = await getCurrentUser();
    if (user) {
       const key = `action_${user}_${reference_number}_${item_number}`;
      localStorage.setItem(key, action);
    }
  };

  const getSavedAction = async (reference_number, item_number ) => {
    const user = await getCurrentUser();
    if (user) {
          const key = `action_${user}_${reference_number}_${item_number}`;
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
  const { referenceNumber, itemNumber } = useParams();
  const [data, setData] = useState(null);

  const arabicActions = ["تعديل البيان", "تحويل الى الشؤون القانونية"];
  const errorTypes = ["السجل التجاري", "بند التعرفة", "أخطاء إحصائية", "مستندات ناقصة", "رسوم جمركية", "القيمة الجمركية"];
  const errorExplanations = ["ميناء الشحن", "قيمة البضاعة الجمركية", "تخفيض/خصم", "أجور الشحن", "وصف البضاعة", "منشأ البضاعة", "(سيل)ختم الجمارك", "الوزن", "CBM", "FOC", "العملة", "تصنيف البضاعة", "بطاقات المرور", "الفاتورة", "العدد", "رسوم شهادة المنشأ", "مبلغ التأمين غير مطابق", "رسوم الأشعة"];
  const flagers = ["شركة التخليص", "المستورد"];

  const logAction = async (action, type = "", explanation = "", flager = "") => {
  try {
    await axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
      reference_number,             // ✅ separate field
      item_number,                 // ✅ separate field
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
    const response = await axios.get(
      "https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities",
      {
        params: {
          reference_number,
          item_number
        }
      }
    );
    setActivityLogs(response.data);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
  }
};


  const handleFlagSelect = (action) => {
    setSelectedAction(action);
    saveActionForTransaction(reference_number, item_number , action);  // 🔥 Save to localStorage
    setShowFlagMenu(false);
    setShowFlagDetails(true);
  };

  const handleSubmitFlag = () => {
    const logText = `مخالف: ${selectedAction}`;
    logAction(logText, selectedType, selectedExplanation, selectedFlager);
    setSelectedAction(logText);
    saveActionForTransaction(reference_number, item_number , logText);  // 🔥 Save to localStorage
    setShowFlagDetails(false);
    setSelectedType("");
    setSelectedExplanation("");
    setSelectedFlager("");
  };

  const handleCloseCase = () => {
    const logText = "إغلاق تدقيق المعاملة";
    setSelectedAction(logText);
    saveActionForTransaction(reference_number, item_number , logText);  // 🔥 Save
    logAction(logText);
    setShowNotFlaggedComment(false);
    setNotFlaggedReason("");
  };

  const handlePending = () => {
    const logText = "قيد التدقيق";
    setSelectedAction(logText);
    saveActionForTransaction(reference_number, item_number , logText);  // 🔥 Save
    logAction(logText);
  };

  useEffect(() => {
  const logOpenAction = async () => {
    try {
      const userEmail = await getCurrentUser(); // 🔥 Get Cognito user email
      const userName = userEmail ? userEmail.split(/[@.]/)[0] : 'Unknown';

      // ✅ Send separate fields instead of the old one
      await axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
        reference_number,
        item_number,
        Action: "Open",
        EmployeeName: userName,
        Timestamp: new Date().toISOString()
      });

      // ✅ Updated GET query to filter using both fields
      const response = await axios.get(`https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities`, {
        params: {
          reference_number,
          item_number
        }
      });

      setActivityLogs(response.data);
    } catch (err) {
      console.error("Error logging open or fetching logs:", err);
    }
  };

  logOpenAction();
}, [reference_number, item_number]);



 useEffect(() => {
  const fetchSavedAction = async () => {
    const action = await getSavedAction(reference_number, item_number);
    if (action) {
      setSelectedAction(action);
    }
  };
  fetchSavedAction();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [reference_number, item_number]);


  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(activityLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Transaction_Report_${reference_number}_${item_number}.xlsx`
);
  };
  const printReport = () => window.print();

    useEffect(() => {
    console.log("📦 Fetching transaction details for:", referenceNumber, itemNumber);
 
    fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/ShapTransaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceNumber: referenceNumber,
        itemNumber: itemNumber
      })
    })
      .then(res => {
        console.log("🔄 Response status:", res.status);
        return res.json();
      })
      .then(json => {
        console.log("✅ API response:", json);
        setData(json.item || null);
      })
      .catch(err => {
        console.error("❌ Fetch error:", err);
      });
  }, [referenceNumber, itemNumber]);
 
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
 
  if (!data) {
    console.log("⚠️ No data yet, showing loading message...");
    return (
      <div className="report-container">
        <h2 className="report-title">Transaction Details</h2>
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading or not found...</p>
      </div>
    );
  }
 
  console.log("🟢 Rendering data:", data);


  

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
        <button className="action-btn report-btn" onClick={() => setShowReport(true)}><FaFileAlt /> عرض تقرير تفصيلي</button>
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

     <div className="report-container">
     
 
      {/* First Row: Product Details */}
      <div className="row-group">
        <Section
          title="Product & HS Code"
          icon={<FaBoxOpen />}
          rows={[
            ["HS Code", data.HSCode],
            ["Description", data["Commercial Description"]],
            ["Regime", data.Regime],
            ["HS Rate", data["HS-Rate"]],
            ["Commercial Description", data["Commercial Description"]],
            ["Package Code", data["Package Code"]],
            ["Supplementary Unit", data["Sup Unit"]],
          ]}
        />
        <Section
          title="Origin & Export Details"
          icon={<FaGlobe />}
          rows={[
            ["Country of Origin", data["Country of Origin"]],
            ["Exporter CR", data["Exporter CR"]],
            ["Exporter Name", data["Exporter Name"]],
          ]}
        />
        <Section
          title="Invoice & Value Details"
          icon={<FaMoneyBill />}
          rows={[
            ["Invoice Currency", data["Invoice Currency"]],
            ["Local Amount", data["Local Amount"]],
            ["VAT Rate", data["VAT Rate"]],
            ["VAT BHD", data["VAT BHD"]],
            ["Fees", data.Fees],
          ]}
        />
      </div>
 
      {/* Second Row: Weights, Pricing, and Declarations */}
      <div className="row-group">
        <Section
          title="Weight & Measurement"
          icon={<FaBalanceScale />}
          rows={[
            ["Gross Weight", data["Gross Weight"]],
            ["Net Weight", data["Net Weight"]],
            ["Amount / Net Weight", data["Amount / Net Weight"]],
            ["Net Weight / Package", data["Net Weight / Package"]],
            ["Net Weight / Sup", data["Net Weight / Sup"]],
            ["Amount / Package", data["Amount / Package"]],
            ["Amount / Sup", data["Amount / Sup"]],
            ["Sup Amt", data["Sup Amt"]],
          ]}
        />
        <Section
          title="Pricing Analysis"
          icon={<FaChartLine />}
          rows={[
            ["Max Amount", data["Max Amount"]],
            ["Average Amount", data["Average Amount"]],
            ["Min Amount", data["Min Amount"]],
            ["Main Max", data["Main Max"]],
            ["Main Min", data["Main Min"]],
          ]}
        />
        <Section
          title="Declaration & Parties"
          icon={<FaFileAlt />}
          rows={[
            ["Registration Serial", data["Registration Serial"]],
            ["Registration Number", data["Registration Number"]],
            ["Registration Date", data["Registration Date"]],
            ["Declarant CR", data["Declarant CR"]],
            ["Declarant Name", data["Declarant Name"]],
            ["Consignee CR", data["Consignee CR"]],
            ["Consignee Name", data["Consignee Name"]],
          ]}
        />
      </div>
    </div>

      {showReport && (
        <div className="report-modal">
          <div className="report-header">
            <h3>📑 تقرير الإجراءات والمخالفات – {reference_number }</h3>
            <button onClick={() => setShowReport(false)}><FaTimes /></button>
          </div>
          <p>المراجع: {userName} | تم التوليد: {new Date().toLocaleString()}</p>
          <table className="report-table">
            <thead><tr><th>العملية</th><th>النوع</th><th>الشرح</th><th>المخالف</th><th>التاريخ</th></tr></thead>
            <tbody>
              {activityLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.Action}</td>
                  <td>{log.TypeOfError || "-"}</td>
                  <td>{log.ErrorExplanation || "-"}</td>
                  <td>{log.Flager || "-"}</td>
                  <td>{new Date(log.Timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="report-buttons">
            <div className="no-print">
              <button onClick={printReport}>🖨️ طباعة / حفظ كـ PDF</button>
            </div>
            <button onClick={exportExcel}>تصدير Excel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;

