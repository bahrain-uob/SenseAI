/* import React, { useState, useEffect } from "react";
import "./TransactionDetail.css";
import {
  FaBoxOpen, FaGlobe, FaMoneyBill, FaBalanceScale,
  FaChartLine, FaFileAlt, FaFlag, FaTrash, FaLock, FaClock
} from "react-icons/fa";
import axios from "axios";

const TransactionDetail = () => {
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

  const userName = "Ahmed"; // Replace with logged-in user
  const trxId = "TRX-2025000"; // Replace with your transaction ID

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
      console.log("Logged action:", action);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const handleFlagSelect = (action) => {
    setSelectedAction(action);
    setShowFlagMenu(false);
    setShowFlagDetails(true);
  };

  const handleSubmitFlag = () => {
    const logText = `مخالف: ${selectedAction}`;
    logAction(logText, selectedType, selectedExplanation, selectedFlager);
    setShowFlagDetails(false);
    setSelectedAction(logText);
    setSelectedType("");
    setSelectedExplanation("");
    setSelectedFlager("");
  };

  const handleCloseCase = () => {
    const logText = "إغلاق تدقيق المعاملة";
    setSelectedAction(logText);
    logAction(logText);
    setShowNotFlaggedComment(false);
    setNotFlaggedReason("");
  };

  const handlePending = () => {
    const logText = "قيد التدقيق";
    setSelectedAction(logText);
    logAction(logText);
  };

  useEffect(() => {
    axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
      TransactionID: trxId,
      Action: "Open",
      EmployeeName: userName,
      Timestamp: new Date().toISOString()
    }).catch(console.error);
  }, []);

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setCommentList(prev => [...prev, { text: comment, user: userName }]);
      setComment("");
    }
  };

  const handleCommentDelete = (indexToDelete) => {
    setCommentList(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

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

        <button className="action-btn not-flagged" onClick={() => setShowNotFlaggedComment(true)}>
          غير مخالف
        </button>

        <button className="action-btn pending" onClick={handlePending}>
          <FaClock /> قيد التدقيق
        </button>

        {showNotFlaggedComment && (
          <div className="not-flagged-comment">
            <textarea
              value={notFlaggedReason}
              onChange={(e) => setNotFlaggedReason(e.target.value)}
              placeholder="اكتب سبب عدم المخالفة..."
            ></textarea>
            <button className="submit-log" onClick={() => {
              logAction(`غير مخالف: ${notFlaggedReason}`);
              setShowNotFlaggedComment(false);
              setNotFlaggedReason("");
              setSelectedAction(`غير مخالف: ${notFlaggedReason}`);
            }}>
              تسجيل وإغلاق المعاملة
            </button>
          </div>
        )}

        {selectedAction && (
          <div className="selected-action">
            الإجراء المختار: {selectedAction}
          </div>
        )}
      </div>

      {showFlagDetails && (
        <div className="flag-details">
          <label>نوع الخطأ:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">اختر</option>
            {errorTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
          <label>شرح الخطأ:</label>
          <select value={selectedExplanation} onChange={(e) => setSelectedExplanation(e.target.value)}>
            <option value="">اختر</option>
            {errorExplanations.map((exp, idx) => (
              <option key={idx} value={exp}>{exp}</option>
            ))}
          </select>
          <label>المخالف:</label>
          <select value={selectedFlager} onChange={(e) => setSelectedFlager(e.target.value)}>
            <option value="">اختر</option>
            {flagers.map((f, idx) => (
              <option key={idx} value={f}>{f}</option>
            ))}
          </select>
          <button className="submit-log" onClick={handleSubmitFlag}>تسجيل المخالفة</button>
        </div>
      )}

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

      <div className="comment-section">
        <h3>Leave a Comment</h3>
        <textarea placeholder="Write your comment here..." rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="comment-input" />
        <button className="submit-comment" onClick={handleCommentSubmit}>Submit Comment</button>
        {commentList.length > 0 && (
          <div className="submitted-comments">
            <h4>Previous Comments</h4>
            <ul>
              {commentList.map((c, i) => (
                <li key={i}>
                  <span><strong>{c.user}:</strong> {c.text}</span>
                  <button className="delete-comment" onClick={() => handleCommentDelete(i)}><FaTrash /></button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;



 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TransactionDetail.css";
import {
  FaBoxOpen, FaGlobe, FaMoneyBill,
  FaBalanceScale, FaChartLine, FaFileAlt
} from "react-icons/fa";
 
// Component to display detailed info about a selected transaction
const TransactionDetail = () => {
  const { referenceNumber, itemNumber } = useParams();
 
  const [data, setData] = useState(null);
 
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
      <h2 className="report-title">Transaction Details</h2>
 
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
  );
};
 
export default TransactionDetail;
 