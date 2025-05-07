import React from "react";
import "./TransactionDetail.css";
import { FaBoxOpen, FaGlobe, FaMoneyBill, FaBalanceScale, FaChartLine, FaFileAlt } from "react-icons/fa";

const TransactionDetail = () => {
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
            <tr key={label}><th>{label}</th><td>{value}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="report-container">
      <h2 className="report-title">Transaction Details</h2>

      <div className="row-group">
        <Section
          title="Product & HS Code"
          icon=	{<FaBoxOpen />}
          rows={[
            ["HS Code", data.hsCode],
            ["Description", data.description],
            ["Regime", data.regime],
            ["HS Rate", data.hsRate],
            ["Commercial Description", data.commercialDesc],
            ["Package Code", data.packageCode],
            ["Supplementary Unit", data.supUnit],
          ]}
        />

        <Section
          title="Origin & Export Details"
          icon={	<FaGlobe />}
          rows={[
            ["Country of Origin", data.country],
            ["Exporter CR", data.exporterCR],
            ["Exporter Name", data.exporterName],
          ]}
        />

        <Section
          title="Invoice & Value Details"
          icon={	<FaMoneyBill />}
          rows={[
            ["Invoice Currency", data.currency],
            ["Local Amount", data.localAmount],
            ["VAT Rate", data.vatRate],
            ["VAT BHD", data.vatBHD],
            ["Fees", data.fees],
          ]}
        />
      </div>

      <div className="row-group">
        <Section
          title="Weight & Measurement"
          icon={	<FaBalanceScale />}
          rows={[
            ["Gross Weight", data.grossWeight],
            ["Net Weight", data.netWeight],
            ["Amount / Net Weight", data.amtNetWeight],
            ["Net Weight / Package", data.netPerPackage],
            ["Net Weight / Sup", data.netPerSup],
            ["Amount / Package", data.amtPerPackage],
            ["Amount / Sup", data.amtPerSup],
            ["Sup Amt", data.supAmt],
          ]}
        />

        <Section
          title="Pricing Analysis"
          icon={	<FaChartLine />}
          rows={[
            ["Max Amount", data.maxAmo],
            ["Average Amount", data.aveAmo],
            ["Min Amount", data.minAmo],
            ["Main Max", data.mainMax],
            ["Main Min", data.mainMin],
          ]}
        />

        <Section
          title="Declaration & Parties"
          icon={<FaFileAlt />}
          rows={[
            ["Registration Serial", data.regSerial],
            ["Registration Number", data.regNumber],
            ["Registration Date", data.regDate],
            ["Declarant CR", data.declarantCR],
            ["Declarant Name", data.declarantName],
            ["Consignee CR", data.consigneeCR],
            ["Consignee Name", data.consigneeName],
          ]}
        />
      </div>
    </div>
  );
};

export default TransactionDetail;

