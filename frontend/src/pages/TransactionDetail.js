import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TransactionDetail.css";
import {
  FaBoxOpen, FaGlobe, FaMoneyBill,
  FaBalanceScale, FaChartLine, FaFileAlt
} from "react-icons/fa";

const TransactionDetail = () => {
  const { id } = useParams(); // e.g., "TRX-49"
  const rowid = id.replace("TRX-", ""); // extract "49"

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/RawTransaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 100 })
    })
      .then(res => res.json())
      .then(json => {
        const found = json.items.find(item => item.rowid == rowid);
        setData(found || null);
      })
      .catch(err => console.error("❌ Fetch error:", err));
  }, [rowid]);

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
