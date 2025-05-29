import React, { useState, useEffect } from "react";
import "./TransactionDetail.css";
import { FaBoxOpen, FaGlobe, FaMoneyBill, FaBalanceScale, FaChartLine, FaFileAlt, FaFlag, FaTrash ,FaLock} from "react-icons/fa";
import axios from "axios";

const TransactionDetail = () => {
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [showAllActions, setShowAllActions] = useState(true);

  const userName = "Ahmed"; // Replace with logged-in user
  const trxId = "TRX-2025000"; // Replace with your transaction ID from router/URL if needed
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [showCloseMenu, setShowCloseMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
     // Replace with actual logged-in user

  const arabicActions = [
    "تعديل البيان",
    "تحويل الى الشؤون القانونية",
    "إجراءات أخرى",
  ];

  const logAction = async (action) => {
    try {
      await axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
        TransactionID: trxId,
        EmployeeName: userName,
        Action: action,
        Timestamp: new Date().toISOString(),
      });
      console.log("Logged action:", action);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const handleFlagSelect = (action) => {
    const logText = `Flag: ${action}`;
    setSelectedAction(logText);
    setShowFlagMenu(false);
    logAction(logText);
  };

  const handleCloseCase = () => {
    const logText = "Close Case";
    setSelectedAction(logText);
    logAction(logText);
  };

  useEffect(() => {
    // Restore status from localStorage
    const savedStatus = localStorage.getItem("transactionStatus");
    if (savedStatus) {
      setActiveAction(savedStatus);
      setShowAllActions(false);
    }

    // Log "view" to the activities endpoint
    axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
      TransactionID: trxId,
      Action: "Open",
      EmployeeName: userName,
      Timestamp: new Date().toISOString()
    }).catch(console.error);
  }, []);

  const handleAction = (action) => {
    setActiveAction(action);
    setShowAllActions(false);
    localStorage.setItem("transactionStatus", action);
  };

  const resetAction = () => {
    setShowAllActions(true);
    localStorage.removeItem("transactionStatus");
  };

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
    fees: "300",
    grossWeight: "21263",
    netWeight: "21263",
    amtNetWeight: "4.25",
    netPerPackage: "3.00",
    netPerSup: "1.41",
    amtPerPackage: "2.00",
    amtPerSup: "1.00",
    supAmt: "5",
    maxAmo: "21.263",
    aveAmo: "15.000",
    minAmo: "5.000",
    mainMax: "HIGH",
    mainMin: "LOW",
    regSerial: "29229",
    regNumber: "4",
    regDate: "2025-04-22",
    declarantCR: "DEC29229",
    declarantName: "Ali Saleh",
    consigneeCR: "CON1198",
    consigneeName: "Customs Bahrain",
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

  if (!data) {
    return (
      <div className="report-container">
        <h2 className="report-title">Transaction Details</h2>
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading or not found...</p>
      </div>
    );
  }

  return (
    <div className="report-container">
      <h2 className="report-title">Transaction Details</h2>

     
      <div className="transaction-actions">
      <span className="status-label">الإجراء المتخذ:</span>

      {/* 🔥 Flag button and dropdown */}
      <div className="flag-container">
        <button className="action-btn flag" onClick={() => setShowFlagMenu(prev => !prev)}>
          <FaFlag /> Flag
        </button>
        {showFlagMenu && (
          <ul className="flag-dropdown">
            {arabicActions.map((action, idx) => (
              <li key={idx} onClick={() => handleFlagSelect(action)}>
                {action}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🔒 Close Case button */}
      <button className="action-btn close" onClick={handleCloseCase}>
        <FaLock /> Close Case
      </button>

      {/* 🔥 Show selected action */}
      {selectedAction && (
        <div className="selected-action">
          الإجراء المختار: {selectedAction}
        </div>
      )}
    </div>


      <div className="row-group">
        <Section title="Product & HS Code" icon={<FaBoxOpen />} rows={[
          ["HS Code", data.hsCode],
          ["Description", data.description],
          ["Regime", data.regime],
          ["HS Rate", data.hsRate],
          ["Commercial Description", data.commercialDesc],
          ["Package Code", data.packageCode],
          ["Supplementary Unit", data.supUnit],
        ]} />

        <Section title="Origin & Export Details" icon={<FaGlobe />} rows={[
          ["Country of Origin", data.country],
          ["Exporter CR", data.exporterCR],
          ["Exporter Name", data.exporterName],
        ]} />

        <Section title="Invoice & Value Details" icon={<FaMoneyBill />} rows={[
          ["Invoice Currency", data.currency],
          ["Local Amount", data.localAmount],
          ["VAT Rate", data.vatRate],
          ["VAT BHD", data.vatBHD],
          ["Fees", data.fees],
        ]} />
      </div>

      <div className="row-group">
        <Section title="Weight & Measurement" icon={<FaBalanceScale />} rows={[
          ["Gross Weight", data.grossWeight],
          ["Net Weight", data.netWeight],
          ["Amount / Net Weight", data.amtNetWeight],
          ["Net Weight / Package", data.netPerPackage],
          ["Net Weight / Sup", data.netPerSup],
          ["Amount / Package", data.amtPerPackage],
          ["Amount / Sup", data.amtPerSup],
          ["Sup Amt", data.supAmt],
        ]} />

        <Section title="Pricing Analysis" icon={<FaChartLine />} rows={[
          ["Max Amount", data.maxAmo],
          ["Average Amount", data.aveAmo],
          ["Min Amount", data.minAmo],
          ["Main Max", data.mainMax],
          ["Main Min", data.mainMin],
        ]} />

        <Section title="Declaration & Parties" icon={<FaFileAlt />} rows={[
          ["Registration Serial", data.regSerial],
          ["Registration Number", data.regNumber],
          ["Registration Date", data.regDate],
          ["Declarant CR", data.declarantCR],
          ["Declarant Name", data.declarantName],
          ["Consignee CR", data.consigneeCR],
          ["Consignee Name", data.consigneeName],
        ]} />
      </div>

      <div className="comment-section">
        <h3>Leave a Comment</h3>
        <textarea
          placeholder="Write your comment here..."
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />
        <button className="submit-comment" onClick={handleCommentSubmit}>Submit Comment</button>

        {commentList.length > 0 && (
          <div className="submitted-comments">
            <h4>Previous Comments</h4>
            <ul>
              {commentList.map((c, i) => (
                <li key={i}>
                  <span><strong>{c.user}:</strong> {c.text}</span>
                  <button className="delete-comment" onClick={() => handleCommentDelete(i)}>
                    <FaTrash />
                  </button>
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

