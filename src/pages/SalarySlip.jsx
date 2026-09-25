import { vaultForm } from '../utils/vaultForm';
import VaultEditNotice from '../components/VaultEditNotice';
import DocumentPreview from "../components/DocumentPreview";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const DESIGNATION_OPTIONS = [
  "Business Development Manager", "Sales Executive", "Frontend Developer",
  "Full Stack Developer", "Graphic Designer (Intern)", "Software Developer (Intern)",
  "Social Media Manager", "SEO Specialist", "Graphic Designer", "Shopify Developer",
  "Digital Ads Manager", "Accountant", "Human Resources Executive", "Relationship Manager", "Telecaller",
  "Branch Manager Sales", "Territory Manager Sales"
];

const MONTH_OPTIONS = [
  "Jan/2026", "Feb/2026", "Mar/2026", "Apr/2026", "May/2026", "Jun/2026",
  "Jul/2026", "Aug/2026", "Sep/2026", "Oct/2026", "Nov/2026", "Dec/2026"
];

const formatINR = (val) => {
  const num = Math.round((Number(val) || 0) * 100) / 100;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function SalarySlip() {
  const { employees, createSalarySlip, sendSalarySlipEmail } = useEmployee();
  const location = useLocation();
  const printRef = useRef(null);

  const [data, setData] = useState(() => vaultForm({
    empId: "", name: "", designation: "", month: "", doj: "",
    pan: "", aadhar: "", accNo: "", ifsc: "", phone: "",
    nod: "30",
    basic: "", allowance: "0", bonus: "0", pf: "0", totalLeaveDays: "0", otherDeduction: "0",
    email: ""
  }, location.state?.vaultDocument, {empId:'employeeId',name:'employeeName',email:'employeeEmail',month:'monthYear',doj:'joiningDate',pan:'panNumber',aadhar:'aadharNumber',accNo:'bankAccount',nod:'workingDays',basic:'basicSalary',pf:'pfDeduction',totalLeaveDays:'lopDays'}));

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm bg-white";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get("employeeId");

    if (employeeId && employees && employees.length > 0) {
      const emp = employees.find((e) => String(e._id) === String(employeeId));
      if (emp) {
        setData((prev) => ({
          ...prev,
          empId: emp.empId || `VAM-${emp._id.slice(-4).toUpperCase()}`,
          name: emp.name || "",
          email: emp.email || "",
          phone: emp.phoneNumber || "",
          designation: emp.designation || "",
          doj: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
          pan: emp.panNumber || "",
          aadhar: emp.adharNumber || "",
          accNo: emp.accountNumber || "",
          ifsc: emp.ifscCode || "",
          basic: emp.salary || "",
        }));
      }
    }
  }, [location.search, employees]);

  const totalEarnings = Number(data.basic || 0) + Number(data.allowance || 0) + Number(data.bonus || 0);
  const rawLop = (totalEarnings / (Number(data.nod) || 30)) * Number(data.totalLeaveDays || 0);
  const leaveDeduction = Math.round(rawLop * 100) / 100;
  const totalDeductions = Math.round((Number(data.pf || 0) + leaveDeduction + Number(data.otherDeduction || 0)) * 100) / 100;
  const netSalary = Math.round((totalEarnings - totalDeductions) * 100) / 100;

  const [pdfId,setPdfId]=useState(null);
  const savedRecord=useRef(null);
  const ensureRecord=async()=>{
      const salaryPayload = {
        employeeName: data.name,
        email: data.email,
        month: data.month,
        basic: Number(data.basic),
        empId: data.empId,
        designation: data.designation,
        doj: data.doj,
        pan: data.pan,
        aadhar: data.aadhar,
        accNo: data.accNo,
        ifsc: data.ifsc,
        phone: data.phone,
        nod: Number(data.nod) || 30,
        totalLeaveDays: Number(data.totalLeaveDays) || 0,
        allowance: Number(data.allowance) || 0,
        bonus: Number(data.bonus) || 0,
        pf: Number(data.pf) || 0,
        otherDeduction: Number(data.otherDeduction) || 0,
      };

      const key=JSON.stringify(salaryPayload);
      if(savedRecord.current?.key===key)return savedRecord.current.id;
      const createRes = await createSalarySlip(salaryPayload);
      const recordId = createRes?.data?._id || createRes?._id;


      savedRecord.current={key,id:recordId};return recordId;
  };
  const generatePrint=async()=>{if(loading)return;setLoading(true);try{setPdfId(await ensureRecord());}catch(e){alert(e.response?.data?.message || e.message);}finally{setLoading(false);}};

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSendEmail = async () => {
    if (!data.email.trim()) return alert("Please enter a recipient email");
    if (!data.month) return alert("Please select a Salary Month");
    if (!data.basic) return alert("Please enter the Basic Salary");

    setLoading(true);
    try {
      const recordId = await ensureRecord();

      if (!recordId) throw new Error("Record created but ID not received.");

      await sendSalarySlipEmail(recordId);
      alert(`Success! Payslip sent successfully to ${data.email}`);
      setShowEmailModal(false);
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <div className="no-print"><Sidebar /></div>

      {pdfId && <DocumentPreview type="Salary Slip" id={pdfId} onClose={()=>setPdfId(null)}/>}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <VaultEditNotice />
        <div className="w-full">
          {/* Form Controls */}
          <div className="no-print bg-white rounded-xl shadow-md p-8 border border-slate-200 mb-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-orange-600 pl-4 uppercase tracking-wide">
              Generate Salary Payslip
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                <input name="name" value={data.name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Work Email</label>
                <input name="email" value={data.email} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
                <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Employee ID</label>
                <input name="empId" value={data.empId} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Designation</label>
                <select name="designation" value={data.designation} onChange={handleChange} className={inputClass}>
                  <option value="">Select Role</option>
                  {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  {data.designation && !DESIGNATION_OPTIONS.includes(data.designation) && (
                    <option value={data.designation}>{data.designation}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Joining Date</label>
                <input name="doj" type="date" value={data.doj} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">PAN Number</label>
                <input name="pan" value={data.pan} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Aadhaar Number</label>
                <input name="aadhar" value={data.aadhar} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Bank Account No.</label>
                <input name="accNo" value={data.accNo} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">IFSC Code</label>
                <input name="ifsc" value={data.ifsc} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Salary Month *</label>
                <select name="month" value={data.month} onChange={handleChange} className={inputClass} required>
                  <option value="">Select Month</option>
                  {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Basic Salary (₹) *</label>
                <input name="basic" type="number" value={data.basic} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">LOP Days</label>
                <input name="totalLeaveDays" type="number" value={data.totalLeaveDays} onChange={handleChange} className={inputClass} />
              </div>

              <div className="md:col-span-2 flex gap-4 mt-4">
                <button onClick={() => generatePrint()} className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md">
                  PRINT PAYSLIP
                </button>
                <button onClick={() => setShowEmailModal(true)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md">
                  EMAIL TO EMPLOYEE
                </button>
              </div>
            </div>
          </div>

          {/* Professional White Background Preview Area */}
          <div
            ref={printRef}
            className="print:m-0 bg-white mb-20 shadow-xl mx-auto border border-gray-300"
            style={{
              width: "210mm",
              padding: "10mm 14mm 8mm 14mm",
              boxSizing: "border-box",
              fontFamily: "Arial, Helvetica, sans-serif",
              color: "#000000",
              backgroundColor: "#ffffff",
              fontSize: "10px"
            }}
          >
            {/* Header: Company Logo /blackLogo.png (65px) */}
            <div style={{
              borderBottom: "2px solid #f27022",
              paddingBottom: "8px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <img src="/blackLogo.png" alt="Viral Ads Media" style={{ height: "65px", width: "auto", objectFit: "contain" }} />
              </div>
              <div style={{ textAlign: "right", lineHeight: "1.45", fontSize: "9.5px", color: "#333333" }}>
                <div style={{ fontSize: "15px", fontWeight: "bold", color: "#000000", letterSpacing: "0.5px" }}>VIRAL ADS MEDIA</div>
                <div><strong>Ref:</strong> VAM/PAY/{data.empId || 'EMP'}/{(data.month || '').replace('/', '-')}</div>
                <div><strong>Issue Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "bold", margin: "0", letterSpacing: "1px", textTransform: "uppercase" }}>
                Salary Payslip
              </h2>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#f27022", marginTop: "2px" }}>
                For the month of {data.month || "—"}
              </div>
            </div>

            {/* Employee Information Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000000", marginBottom: "12px", backgroundColor: "#ffffff" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", width: "18%", color: "#374151", fontWeight: "bold" }}>Employee Name:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", width: "32%", fontWeight: "bold" }}>{data.name || "—"}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", width: "18%", color: "#374151", fontWeight: "bold" }}>Employee ID:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", width: "32%", fontWeight: "bold" }}>{data.empId || "—"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>Designation:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>{data.designation || "—"}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>Date of Joining:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>{data.doj || "—"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>PAN Number:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textTransform: "uppercase" }}>{data.pan || "—"}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>Aadhaar Number:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>{data.aadhar || "—"}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>Bank Account:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>{data.accNo || "—"}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>IFSC Code:</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textTransform: "uppercase" }}>{data.ifsc || "—"}</td>
                </tr>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>Total Days (NOD):</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", fontWeight: "bold" }}>{data.nod || "30"} Days</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", color: "#374151", fontWeight: "bold" }}>Days Present (NDP):</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", fontWeight: "bold" }}>{Number(data.nod || 30) - Number(data.totalLeaveDays || 0)} Days (LOP: {data.totalLeaveDays || "0"} Days)</td>
                </tr>
              </tbody>
            </table>

            {/* Earnings & Deductions Statement */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000000", marginBottom: "12px", backgroundColor: "#ffffff" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6", color: "#000000" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "9.5px", border: "1px solid #000000" }}>EARNINGS</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: "9.5px", width: "120px", border: "1px solid #000000" }}>AMOUNT (₹)</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "9.5px", border: "1px solid #000000" }}>DEDUCTIONS</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: "9.5px", width: "120px", border: "1px solid #000000" }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Basic Salary</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>{formatINR(data.basic)}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Loss of Pay (LOP)</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>{formatINR(leaveDeduction)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>House Rent Allowance (HRA)</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>{formatINR(data.allowance)}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Provident Fund (PF)</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>{formatINR(data.pf)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Special Allowance & Conveyance</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>0.00</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Tax Deducted at Source (TDS)</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>0.00</td>
                </tr>
                <tr>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Performance Bonus & Incentives</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>{formatINR(data.bonus)}</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db" }}>Other Deductions</td>
                  <td style={{ padding: "5px 8px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: "bold", fontFamily: "Courier New, monospace" }}>{formatINR(data.otherDeduction)}</td>
                </tr>
                <tr style={{ backgroundColor: "#f9fafb", fontWeight: "bold" }}>
                  <td style={{ padding: "6px 8px", borderTop: "1.5px solid #000000", borderBottom: "1.5px solid #000000" }}>GROSS EARNINGS</td>
                  <td style={{ padding: "6px 8px", borderTop: "1.5px solid #000000", borderBottom: "1.5px solid #000000", textAlign: "right", fontFamily: "Courier New, monospace" }}>₹ {formatINR(totalEarnings)}</td>
                  <td style={{ padding: "6px 8px", borderTop: "1.5px solid #000000", borderBottom: "1.5px solid #000000" }}>TOTAL DEDUCTIONS</td>
                  <td style={{ padding: "6px 8px", borderTop: "1.5px solid #000000", borderBottom: "1.5px solid #000000", textAlign: "right", fontFamily: "Courier New, monospace" }}>₹ {formatINR(totalDeductions)}</td>
                </tr>
              </tbody>
            </table>

            {/* Net Pay Box */}
            <div style={{
              width: "100%",
              border: "1.5px solid #000000",
              borderLeft: "4px solid #f27022",
              padding: "8px 12px",
              marginBottom: "8px",
              boxSizing: "border-box",
              backgroundColor: "#ffffff"
            }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#374151", textTransform: "uppercase" }}>
                Net Take-Home Pay
              </div>
              <div style={{ fontSize: "15px", fontWeight: "bold", color: "#000000", marginTop: "1px" }}>
                ₹ {formatINR(netSalary)}
              </div>
              <div style={{ fontSize: "9px", color: "#4b5563", fontStyle: "italic", marginTop: "2px" }}>
                (Rupees {formatINR(netSalary)} Only)
              </div>
            </div>

            <div style={{ fontSize: "8.5px", color: "#6b7280", fontStyle: "italic", marginTop: "6px" }}>
              * This is a computer-generated salary slip and does not require a physical signature.
            </div>

            {/* Digital HR Signature: Uses /hrSignature.png with Increased Size (58px) */}
            <div style={{ marginTop: "16px", width: "100%", textAlign: "right" }}>
              <div style={{ display: "inline-block", textAlign: "center", width: "200px" }}>
                <div style={{ fontWeight: "bold", fontSize: "10px", color: "#000000", marginBottom: "2px" }}>For Viral Ads Media</div>
                <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", margin: "2px auto" }}>
                  <img
                    src="/hrSignature.png"
                    alt="HR Signature"
                    style={{ height: "58px", maxWidth: "180px", objectFit: "contain", display: "block", margin: "0 auto" }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span style={{ display: "none", fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: "22px", color: "#1d4ed8" }}>
                    HR Signature
                  </span>
                </div>
                <div style={{ borderTop: "1px solid #000000", marginTop: "2px", marginBottom: "3px" }}></div>
                <div style={{ fontWeight: "bold", fontSize: "9.5px", color: "#000000" }}>HR Department</div>
                <div style={{ fontSize: "8.5px", color: "#4b5563" }}>Viral Ads Media</div>
              </div>
            </div>

            {/* Clean Footer */}
            <div style={{
              marginTop: "20px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "6px",
              textAlign: "center",
              fontSize: "8.5px",
              color: "#4b5563"
            }}>
              <strong>Viral Ads Media</strong> | B-27, Budh Vihar Phase 1, New Delhi - 110086 | Tel: +91 93544 91934 | hr@viraladsmedia.com
            </div>
          </div>
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Send Payslip via Email</h3>
            <input
              type="email"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              className={inputClass}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEmailModal(false)} className="text-gray-500 text-sm">Cancel</button>
              <button onClick={handleSendEmail} disabled={loading} className="bg-orange-600 text-white px-4 py-2 rounded-md font-bold">
                {loading ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
