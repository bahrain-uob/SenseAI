import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TransactionDetail.css";
import {
  FaBoxOpen, FaGlobe, FaMoneyBill,
  FaBalanceScale, FaChartLine, FaFileAlt
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
 
const TransactionDetail = () => {
  const { referenceNumber, itemNumber } = useParams();
  const [data, setData] = useState(null);
 
  useEffect(() => {
    fetch("https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/ShapTransaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referenceNumber, itemNumber })
    })
      .then(res => res.json())
      .then(json => setData(json.item || null))
      .catch(console.error);
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
 
  return (
    <div className="report-container">
      <h2 className="report-title">Transaction Details</h2>
 
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
 
      <div className="row-group">
        <Section
          title="Product & HS Code"
          icon={<FaBoxOpen />}
          rows={[
            ["HS Code", data.HSCode],
            ["Description", data["Commercial Description"]],
            ["Regime", data.Regime],
            ["HS Rate", data["HS-Rate"]],
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