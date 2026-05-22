import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const DESIGNATION_OPTIONS = [
  "Business Development Manager", "Sales Executive", "Frontend Developer",
  "Full Stack Developer", "Graphic Designer (Intern)", "Software Developer (Intern)",
  "Social Media Manager", "SEO Specialist", "Graphic Designer", "Shopify Developer",
  "Digital Ads Manager", "Accountant", "Human Resources Executive", "Relationship Manager", "Telecaller",
];

const MONTH_OPTIONS = [
  "Jan/2026", "Feb/2026", "Mar/2026", "Apr/2026", "May/2026", "Jun/2026",
  "Jul/2026", "Aug/2026", "Sep/2026", "Oct/2026", "Nov/2026", "Dec/2026"
];

// Reusable Custom Dropdown
function CustomDropdown({ name, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        className="w-full px-4 py-2 text-left text-sm rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all flex items-center justify-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{value || placeholder}</span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === option ? "bg-orange-100 text-orange-800 font-medium" : "hover:bg-orange-50 hover:text-orange-700"}`}
              onClick={() => {
                onChange({ target: { name, value: option } });
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SalarySlip = () => {
  const { employees, createSalarySlip, sendSalarySlipEmail } = useEmployee();
  const location = useLocation();
  const printRef = useRef(null);

  const [data, setData] = useState({
    empId: "", name: "", designation: "", month: "", doj: "",
    pan: "", aadhar: "", accNo: "", ifsc: "", phone: "",
    nod: "30",
    basic: "", allowance: "0", bonus: "0", pf: "0", totalLeaveDays: "0", otherDeduction: "0",
    email: ""
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get("employeeId");

    if (employeeId && employees && employees.length > 0) {
      const emp = employees.find((e) => e._id === employeeId);
      if (emp) {
        setData((prev) => ({
          ...prev,
          empId: emp.empId || `VAM-${emp._id.slice(-4).toUpperCase()}`,
          name: emp.name || "",
          email: emp.email || "",
          phone: emp.phoneNumber || "",           // ← Fix 1: use correct field
          designation: emp.designation || "",
          doj: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
          pan: emp.panNumber || "",
          aadhar: emp.adharNumber || "",
          accNo: emp.accountNumber || emp.bankAccountNo || "",
          ifsc: emp.ifscCode || emp.ifsc || "",
          basic: emp.salary || "",
        }));
      }
    }
  }, [location.search, employees]);

  const totalEarnings = Number(data.basic || 0) + Number(data.allowance || 0) + Number(data.bonus || 0);
  const leaveDeduction = (totalEarnings / (Number(data.nod) || 30)) * Number(data.totalLeaveDays || 0);
  const totalDeductions = Number(data.pf || 0) + leaveDeduction + Number(data.otherDeduction || 0);
  const netSalary = totalEarnings - totalDeductions;

  const generatePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Payslip_${data.name || "Employee"}_${data.month.replace("/", "-")}`,
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSendEmail = async () => {
    if (!data.email.trim()) return alert("Please enter a recipient email");
    if (!data.month) return alert("Please select a Salary Month");
    if (!data.basic) return alert("Please enter the Basic Salary");

    setLoading(true);
    try {
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
      };

      const createRes = await createSalarySlip(salaryPayload);
    //  const recordId = createRes?._id || createRes?.data?._id;
      const recordId = createRes?.data?._id;

      if (!recordId) {
        throw new Error("Record created but no ID returned.");
      }

      await sendSalarySlipEmail(recordId);
      alert(`Success! Payslip sent to ${data.email}`);
      setShowEmailModal(false);
    } catch (error) {
      const backendMessage = error.response?.data?.message || error.message;
      alert(`Error: ${backendMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <div className="no-print"><Sidebar /></div>

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">

          <div className="no-print bg-white rounded-xl shadow-md p-8 border border-slate-200 mb-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-orange-600 pl-4 uppercase">Payroll Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
                <input name="name" value={data.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Work Email</label>
                <input name="email" value={data.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
                <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} placeholder="e.g. +91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Employee ID</label>
                <input name="empId" value={data.empId} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Designation</label>
                <CustomDropdown name="designation" value={data.designation} onChange={handleChange} options={DESIGNATION_OPTIONS} placeholder="Select Role" />
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
                <label className="block text-sm font-medium mb-1 text-gray-700">Aadhar Number</label>
                <input name="aadhar" value={data.aadhar} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Bank Account No.</label>
                <input name="accNo" value={data.accNo} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">IFSC Code</label>
                <input name="ifsc" value={data.ifsc} onChange={handleChange} className={inputClass} placeholder="e.g. SBIN0001234" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Salary Month</label>
                <CustomDropdown name="month" value={data.month} onChange={handleChange} options={MONTH_OPTIONS} placeholder="Select Month" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Basic Salary (₹)</label>
                <input name="basic" type="number" value={data.basic} onChange={handleChange} className={inputClass} />
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

          {/* Printable Payslip */}
          <div
            ref={printRef}
            className="print:m-0 bg-white mb-20 overflow-hidden"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "15mm 12mm",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "13px",
              color: "#000",
              backgroundColor: "white",
            }}
          >
            {/* Header */}
            <div style={{
              borderBottom: "3px solid #000",
              paddingBottom: "12px",
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h1 style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  margin: 0,
                  letterSpacing: "1px"
                }}>
                  VIRAL ADS MEDIA
                </h1>
                <p style={{
                  fontSize: "11px",
                  margin: "4px 0 0 0",
                  color: "#333"
                }}>
                  B-27, Budh Vihar Phase 1, New Delhi-110086
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <img
                  src="/blackLogo.png"
                  alt="Logo"
                  style={{ height: "90px", marginBottom: "8px" }}
                />
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{
                fontSize: "18px",
                fontWeight: "bold",
                textDecoration: "underline",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                margin: "0 0 6px 0"
              }}>
                Salary Payslip
              </h2>
              <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                For the month of {data.month || "—"}
              </p>
            </div>

            {/* Employee Details */}
            <div style={{
              marginBottom: "22px",
              border: "1px solid #444",
              padding: "12px",
              backgroundColor: "#f9f9f9"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 16px", fontSize: "12.5px" }}>
                <div><strong>Employee Name:</strong> {data.name || "—"}</div>
                <div><strong>Emp ID:</strong> {data.empId || "—"}</div>
                <div><strong>Designation:</strong> {data.designation || "—"}</div>
                <div><strong>DOJ:</strong> {data.doj || "—"}</div>
                <div><strong>PAN No:</strong> {data.pan || "—"}</div>
                <div><strong>Aadhaar No:</strong> {data.aadhar || "—"}</div>
                <div><strong>Bank A/c No:</strong> {data.accNo || "—"}</div>
                <div><strong>IFSC Code:</strong> {data.ifsc || "—"}</div>
                <div><strong>Phone:</strong> {data.phone || "—"}</div>
              </div>

              {/* Attendance */}
              <div style={{
                marginTop: "14px",
                paddingTop: "10px",
                borderTop: "1px dashed #666",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12.5px"
              }}>
                <div><strong>NOD (No. of Days):</strong> {data.nod || "30"}</div>
                <div><strong>NDP (Days Present):</strong> {Number(data.nod || 30) - Number(data.totalLeaveDays || 0)}</div>
                <div><strong>LOP Days:</strong> {data.totalLeaveDays || "0"}</div>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1.5px solid #000",
              fontSize: "13px",
              marginBottom: "20px"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", borderRight: "1px solid #fff" }}>Earnings</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", width: "120px" }}>Amount (₹)</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", borderLeft: "2px solid #000", borderRight: "1px solid #fff" }}>Deductions</th>
                  <th style={{ padding: "8px 10px", textAlign: "right", width: "120px" }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #aaa" }}>
                  <td style={{ padding: "8px 10px", borderRight: "1px solid #000" }}>Basic Salary</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(data.basic || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: "8px 10px", borderLeft: "2px solid #000" }}>Loss of Pay (LOP)</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{leaveDeduction.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #aaa" }}>
                  <td style={{ padding: "8px 10px", borderRight: "1px solid #000" }}>Allowance</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(data.allowance || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: "8px 10px", borderLeft: "2px solid #000" }}>Other Deduction</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(data.otherDeduction || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #aaa" }}>
                  <td style={{ padding: "8px 10px", borderRight: "1px solid #000" }}>Bonus</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{Number(data.bonus || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: "8px 10px", borderLeft: "2px solid #000" }}></td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}></td>
                </tr>
                <tr style={{ height: "60px" }}>
                  <td style={{ borderRight: "1px solid #000" }}></td>
                  <td style={{ borderRight: "1px solid #000" }}></td>
                  <td style={{ borderLeft: "2px solid #000" }}></td>
                  <td></td>
                </tr>
              </tbody>
              <tfoot style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
                <tr>
                  <td style={{ padding: "10px", borderRight: "1px solid #000", textAlign: "left" }}>Gross Earnings</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>₹{totalEarnings.toLocaleString('en-IN')}</td>
                  <td style={{ padding: "10px", borderLeft: "2px solid #000", textAlign: "left" }}>Total Deductions</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>₹{totalDeductions.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>

            {/* Net Pay */}
            <div style={{ textAlign: "right", marginTop: "auto" }}>
              <div style={{
                display: "inline-block",
                backgroundColor: "#000",
                color: "#fff",
                padding: "14px 28px",
                borderRadius: "4px"
              }}>
                <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                  Net Pay: ₹ {netSalary.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: "11px", marginTop: "6px", opacity: 0.9 }}>
                  (Rupees {netSalary.toLocaleString('en-IN')} Only)
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div style={{
              marginTop: "50px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px"
            }}>
              <div style={{ textAlign: "center", width: "45%" }}>
                <div style={{ borderBottom: "1px solid #000", height: "30px", marginBottom: "6px" }}></div>
                <div>Employee Signature</div>
              </div>
              <div style={{ textAlign: "center", width: "45%" }}>
                <div style={{ borderBottom: "1px solid #000", height: "30px", marginBottom: "6px" }}></div>
                <div>Authorised Signatory</div>
                <div style={{ marginTop: "4px", fontWeight: "bold" }}>For Viral Ads Media</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Recipient Email</h3>
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
};

export default SalarySlip;