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
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
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
const { referenceNumber, itemNumber } = useParams(); // ✅ ✅ ✅

// 🔥 Dynamic Transaction ID
  
  /* const cognitoUser = poolData.getCurrentUser(); */
  const userPool = new CognitoUserPool(poolData);
  const cognitoUser = userPool.getCurrentUser(); // ✅ CORRECT

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
    const userPool = new CognitoUserPool(poolData); // ✅ FIX
    const user = userPool.getCurrentUser();
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
  const [data, setData] = useState(null);

  const arabicActions = ["تعديل البيان", "تحويل الى الشؤون القانونية"];
  const errorTypes = ["السجل التجاري", "بند التعرفة", "أخطاء إحصائية", "مستندات ناقصة", "رسوم جمركية", "القيمة الجمركية"];
  const errorExplanations = ["ميناء الشحن", "قيمة البضاعة الجمركية", "تخفيض/خصم", "أجور الشحن", "وصف البضاعة", "منشأ البضاعة", "(سيل)ختم الجمارك", "الوزن", "CBM", "FOC", "العملة", "تصنيف البضاعة", "بطاقات المرور", "الفاتورة", "العدد", "رسوم شهادة المنشأ", "مبلغ التأمين غير مطابق", "رسوم الأشعة"];
  const flagers = ["شركة التخليص", "المستورد"];

  const logAction = async (action, type = "", explanation = "", flager = "") => {
  try {
    await axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
      reference_number: referenceNumber,
      item_number: itemNumber,
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
          referenceNumber,
          itemNumber
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
    saveActionForTransaction(referenceNumber, itemNumber , action);  // 🔥 Save to localStorage
    setShowFlagMenu(false);
    setShowFlagDetails(true);
  };

  const handleSubmitFlag = () => {
    const logText = `مخالف: ${selectedAction}`;
    logAction(logText, selectedType, selectedExplanation, selectedFlager);
    setSelectedAction(logText);
    saveActionForTransaction(referenceNumber, itemNumber , logText);  // 🔥 Save to localStorage
    setShowFlagDetails(false);
    setSelectedType("");
    setSelectedExplanation("");
    setSelectedFlager("");
  };

  const handleCloseCase = () => {
    const logText = "إغلاق تدقيق المعاملة";
    setSelectedAction(logText);
    saveActionForTransaction(referenceNumber, itemNumber , logText);  // 🔥 Save
    logAction(logText);
    setShowNotFlaggedComment(false);
    setNotFlaggedReason("");
  };

  const handlePending = () => {
    const logText = "قيد التدقيق";
    setSelectedAction(logText);
    saveActionForTransaction(referenceNumber, itemNumber , logText);  // 🔥 Save
    logAction(logText);
  };

  useEffect(() => {
  const logOpenAction = async () => {
    try {
      const userEmail = await getCurrentUser(); // 🔥 Get Cognito user email
      const userName = userEmail ? userEmail.split(/[@.]/)[0] : 'Unknown';

      // ✅ Send separate fields instead of the old one
     //await axios.post("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities", {
       
       // reference_number: referenceNumber,
      //item_number: itemNumber,
        //Action: "Open",
        //EmployeeName: userName,
        //Timestamp: new Date().toISOString()
      //});

      // ✅ Updated GET query to filter using both fields
      const response = await axios.get(`https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/employee-activities`, {
        params: {
          referenceNumber,
          itemNumber
        }
      });

      setActivityLogs(response.data);
    } catch (err) {
      console.error("Error logging open or fetching logs:", err);
    }
  };

  logOpenAction();
}, [referenceNumber, itemNumber]);



 useEffect(() => {
  const fetchSavedAction = async () => {
    const action = await getSavedAction(referenceNumber, itemNumber);
    if (action) {
      setSelectedAction(action);
    }
  };
  fetchSavedAction();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [referenceNumber, itemNumber]);

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

/* useEffect(() => {
    fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/ShapTransaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceNumber, itemNumber })
    })
      .then(res => res.json())
      .then(json => setData(json.item || null))
      .catch(console.error);
  }, [referenceNumber, itemNumber]); */
 
  if (!data) {
    return (
      <div className="report-container">
        <h2 className="report-title">Transaction Details</h2>
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading or not found...</p>
      </div>
    );
  }
 
  // Extract and invert SHAP impact values
  const shapData = Object.entries(data)
    .filter(([key]) => key.startsWith("SHAP_%_"))
    .map(([key, val]) => ({
      name: key.replace("SHAP_%_", ""),
      impact: -parseFloat(val) // Invert the SHAP value
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 10);
 
  const minImpact = Math.min(...shapData.map(d => d.impact));
  const maxImpact = Math.max(...shapData.map(d => d.impact));
    
const filteredLogs = activityLogs.filter(
  log =>
    log.reference_number === referenceNumber &&
    log.item_number === itemNumber
);

  {/* exporttopdf */}
  const exportToPDF = () => {
 const reverseArabicWords = (text) => {
   if (/[\u0600-\u06FF]/.test(text)) {
     return text.split(' ').reverse().join(' ');
   }
   return text;
 };
 const actionCounts = {};
 // ✅ Filter logs only for the current transaction
 
 filteredLogs.forEach(log => {
   const label = log.Action || 'غير محدد';
   actionCounts[label] = (actionCounts[label] || 0) + 1;
 });
 const actions = Object.keys(actionCounts);
 const counts = Object.values(actionCounts);
 const colors = ['#004c6d', '#247ba0', '#5bc0be', '#b2dbbf', '#f3ffbd', '#ff1654'];
 const legendBody = actions.map((label, i) => {
   return [
     { text: '', fillColor: colors[i % colors.length], width: 12, height: 12, margin: [0, 0, 5, 0] },
     { text: `${reverseArabicWords(label)}: ${counts[i]}`, fontSize: 9 }
   ];
 });
 const chartData = actions.map((label, i) => ({
   color: colors[i % colors.length],
   action: reverseArabicWords(label),
   count: counts[i]
 }));
 const chartTable = [
   [
     { text: 'الإجراء', style: 'tableHeader' },
     { text: 'العدد', style: 'tableHeader' },
     { text: 'تمثيل بياني', style: 'tableHeader' }
   ],
   ...chartData.map(row => ([
     { text: row.action },
     { text: row.count.toString(), alignment: 'center' },
     {
       canvas: [
         {
           type: 'rect',
           x: 0,
           y: 0,
           w: row.count * 10,
           h: 10,
           color: row.color
         }
       ]
     }
   ]))
 ];
 const docDefinition = {
   defaultStyle: { font: 'Amiri', fontSize: 10 },
   content: [
     { text: 'المخالفات و الاجراءات تقرير', style: 'header' },
     { text: `:التاريخ ${new Date().toLocaleString()}`, style: 'subheader' },
     { text: `:المستخدم ${userName}`, style: 'subheader' },
     { text: `Reference #: ${referenceNumber} | Item #: ${itemNumber}`, style: 'subheader' },
     {
       table: {
         widths: ['35%', '65%'],
         body: [
           [{ text: ' المرجع رقم ', style: 'tableLabel' }, referenceNumber],
           [{ text: ' البند رقم', style: 'tableLabel' }, itemNumber],
           [{ text: 'HS Code', style: 'tableLabel' }, data?.HSCode || '-'],
           [{ text: 'البضاعة وصف ', style: 'tableLabel' }, data?.['Commercial Description'] || '-'],
           [{ text: 'المنشـ البلد ', style: 'tableLabel' }, data?.['Country of Origin'] || '-'],
           [{ text: 'العملة', style: 'tableLabel' }, data?.['Invoice Currency'] || '-'],
           [{ text: 'المحلية القيمة ', style: 'tableLabel' }, data?.['Local Amount']?.toString() || '-'],
           [{ text: 'المضافة الضريبة  (BHD)', style: 'tableLabel' }, data?.['VAT BHD']?.toString() || '-'],
           [{ text: 'الصافي الوزن ', style: 'tableLabel' }, data?.['Net Weight']?.toString() || '-'],
           [{ text: 'الجمركي المخلص اسم  ', style: 'tableLabel' }, data?.['Declarant Name'] || '-'],
           [{ text: 'المستورد  ', style: 'tableLabel' }, data?.['Consignee Name'] || '-']
         ]
       },
       layout: {
         fillColor: function (rowIndex) {
           return rowIndex % 2 === 0 ? '#f2f2f2' : null;
         },
         hLineColor: () => '#ddd',
         vLineColor: () => '#ddd',
         hLineWidth: () => 0.75,
         vLineWidth: () => 0.75,
         paddingLeft: () => 8,
         paddingRight: () => 8,
         paddingTop: () => 4,
         paddingBottom: () => 4
       },
       margin: [0, 0, 0, 10]
     },
     {
       text: 'السجل تفاصيل ',
       style: 'sectionTitle',
       margin: [0, 10, 0, 8]
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
             { text: 'التاريخ', style: 'tableHeader' },
           ],
           ...filteredLogs.map(log => [
             { text: reverseArabicWords(log.Action || '-') },
             { text: reverseArabicWords(log.TypeOfError || '-') },
             { text: reverseArabicWords(log.ErrorExplanation || '-') },
             { text: reverseArabicWords(log.Flager || '-') },
             { text: new Date(log.Timestamp).toLocaleString() }
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
       }
     }
   ],
   styles: {
     header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10], color: '#0A1F44' },
     subheader: { fontSize: 10, alignment: 'center', margin: [0, 2, 0, 2] },
     sectionTitle: { fontSize: 12, bold: true, margin: [0, 10, 0, 6] },
     tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#0A1F44', alignment: 'center' },
     tableLabel: {
       bold: true,
       fillColor: '#0A1F44',
       color: 'white',
       alignment: 'right',
       fontSize: 10,
       margin: [0, 2, 0, 2]
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
 pdfMake.createPdf(docDefinition).download(`Single_Transaction_Report_${new Date().toLocaleDateString()}.pdf`);
};


  return (
    <div className="report-container">
      <h2 className="report-title">تفاصيل المعاملة</h2>

    {shapData.length > 0 && (
            <div className="shap-chart">
              <h3 style={{ marginBottom: "1rem", fontWeight: "bold", fontSize: "18px" }}>
                العوامل المسببة لنسبة الخطر
              </h3>
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={shapData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      domain={[
                        minImpact * 1.1,
                        maxImpact * 1.1
                      ]}
                      tickFormatter={(v) => `${v.toFixed(1)}%`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={150}
                    />
                    <Tooltip
                      formatter={(value) => `${value.toFixed(2)}%`}
                      labelStyle={{ fontWeight: "bold" }}
                      contentStyle={{ fontSize: "14px" }}
                    />
                    <Bar dataKey="impact" radius={[5, 5, 5, 5]}>
                      {shapData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.impact < 0 ? "#10B981" : "#EF4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
            <h3>📑 تقرير الإجراءات والمخالفات – {referenceNumber }</h3>
            <button onClick={() => setShowReport(false)}><FaTimes /></button>
          </div>
          <p>المراجع: {userName} | تم التوليد: {new Date().toLocaleString()}</p>
          <table className="report-table">
            <thead><tr><th>العملية</th><th>النوع</th><th>الشرح</th><th>المخالف</th><th>التاريخ</th></tr></thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
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
          
        </div>
      )}
    </div>







  );
};

export default TransactionDetail;