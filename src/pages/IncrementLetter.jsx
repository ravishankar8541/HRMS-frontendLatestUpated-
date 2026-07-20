import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import Sidebar from "../components/Sidebar";

const DESIGNATION_OPTIONS = [
  "Sales Executive", "Frontend Developer", "Full Stack Developer",
  "Graphic Designer (Intern)", "Software Developer (Intern)",
  "Social Media Manager", "SEO Specialist", "Graphic Designer",
  "Shopify Developer", "Digital Ads Manager", "Accountant",
  "Human Resources Executive", "Relationship Manager", "Telecaller",
  "Business Development Manager",
];

const initialFormData = {
  employeeName: "",
  fathersName: "",
  address: "",
  position: "",
  currentSalary: "",
  newSalary: "",
  incrementPercentage: "",
  effectiveDate: "",
  hrName: "",
  phoneNumber: "",
  emailId: "",
  employeeId: "",
  department: "",
  performanceRemarks: "",
  reasonForIncrement: "Based on performance and contribution to the organization"
};

function CustomDropdown({ name, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && wrapperRef.current.contains && !wrapperRef.current.contains(event.target)) {
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

export default function IncrementLetter() {
  const [formData, setFormData] = useState(initialFormData);
  const [preview, setPreview] = useState(false);
  const [incrementId, setIncrementId] = useState("");
  const [loading, setLoading] = useState(false);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Increment_Letter_${formData.employeeName || "Employee"}`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "currentSalary" || name === "newSalary") {
      const current = name === "currentSalary" ? parseFloat(value) : parseFloat(formData.currentSalary);
      const newSal = name === "newSalary" ? parseFloat(value) : parseFloat(formData.newSalary);
      if (current && newSal && current > 0) {
        const percentage = ((newSal - current) / current) * 100;
        setFormData((prev) => ({
          ...prev,
          incrementPercentage: percentage.toFixed(2)
        }));
      }
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const id = `INC-${Date.now().toString().slice(-6)}`;
      setIncrementId(id);
      setPreview(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setLoading(false);
    }, 500);
  };

  const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <style>{`
        @media print {
          @page { size: A4; margin: 0mm; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print"><Sidebar /></div>

      <main className="flex-1 p-8 print:p-0">
        <div className="max-w-4xl mx-auto">
          {!preview ? (
            <div className="bg-white rounded-xl shadow-md p-8 no-print">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">Generate Increment Letter</h1>
              <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Name *</label>
                  <input name="employeeName" value={formData.employeeName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Father's Name *</label>
                  <input name="fathersName" value={formData.fathersName} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <input name="address" value={formData.address} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Id *</label>
                  <input name="emailId" value={formData.emailId} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input name="employeeId" value={formData.employeeId} onChange={handleChange} className={inputClass} placeholder="e.g., VAM-2024-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input name="department" value={formData.department} onChange={handleChange} className={inputClass} placeholder="e.g., Technology, Sales" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation *</label>
                  <CustomDropdown name="position" value={formData.position} onChange={handleChange} options={DESIGNATION_OPTIONS} placeholder="Select Designation" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Salary (INR) *</label>
                  <input type="number" name="currentSalary" value={formData.currentSalary} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Salary (INR) *</label>
                  <input type="number" name="newSalary" value={formData.newSalary} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Increment Percentage (%)</label>
                  <input name="incrementPercentage" value={formData.incrementPercentage} className={inputClass} readOnly placeholder="Auto-calculated" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Effective Date *</label>
                  <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HR Name *</label>
                  <input name="hrName" value={formData.hrName} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Performance Remarks</label>
                  <textarea 
                    name="performanceRemarks" 
                    value={formData.performanceRemarks} 
                    onChange={handleChange} 
                    className={`${inputClass} min-h-[80px]`} 
                    placeholder="Brief remarks about employee's performance"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Reason for Increment</label>
                  <input 
                    name="reasonForIncrement" 
                    value={formData.reasonForIncrement} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Reason for salary increment"
                  />
                </div>
                <button type="submit" disabled={loading} className="md:col-span-2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-all">
                  {loading ? "Processing..." : "Generate Preview"}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div
                ref={printRef}
                className="bg-white mx-auto shadow-2xl print:shadow-none"
                style={{
                  width: "210mm",
                  height: "297mm",
                  padding: "15mm 18mm",
                  fontFamily: "'Times New Roman', Times, serif",
                  color: "#1a1a1a",
                  lineHeight: "1.4",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* WATERMARK START */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-35deg) scale(1.8)",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <img
                    src="/blackLogo.png"
                    alt="Watermark Logo"
                    style={{
                      width: "400px",
                      height: "auto",
                      opacity: "0.12"
                    }}
                  />
                </div>
                {/* WATERMARK END */}

                {/* Header - Reduced top margin */}
                <div style={{ borderBottom: "2px solid #f27022", paddingBottom: "8px", marginBottom: "15px", marginTop: "-25px" }}>
                  <table style={{ width: "100%" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "60%" }}>
                          <img src="/blackLogo.png" alt="Logo" style={{ width: "150px", height: "auto" }} />
                        </td>
                        <td style={{ textAlign: "right", fontSize: "11px", color: "#444", verticalAlign: "middle" }}>
                          <strong>Ref No:</strong> {incrementId}<br />
                          <strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Address section - Compact */}
                <div style={{ marginBottom: "12px", fontSize: "12.5px" }}>
                  To,<br />
                  <span style={{ fontWeight: "bold", fontSize: "14px", color: "#000" }}>{formData.employeeName}</span><br />
                  {formData.address}
                  <br />
                  {formData.phoneNumber}
                  <br />
                  {formData.emailId}
                </div>

                {/* Title */}
                <div style={{ textAlign: "center", fontSize: "17px", fontWeight: "bold", margin: "12px 0", textTransform: "uppercase", letterSpacing: "1px", color: "#000" }}>
                  Letter of Salary Increment
                </div>

                {/* Content - Compact */}
                <div style={{ textAlign: "justify", flex: 1 }}>
                  <p style={{ marginBottom: "6px" }}>Dear <span style={{ fontWeight: "bold", color: "#000" }}>{formData.employeeName}</span>,</p>
                  <p style={{ marginBottom: "6px", fontSize: "12.5px" }}>
                    We are pleased to inform you that based on your performance and contribution to <span style={{ fontWeight: "bold", color: "#000" }}>Viral Ads Media</span>, 
                    we have decided to revise your salary effective from <span style={{ fontWeight: "bold", color: "#000" }}>
                    {new Date(formData.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                  </p>

                  <p style={{ fontWeight: "bold", margin: "10px 0", fontStyle: "italic", textDecoration: "underline", color: "#333", fontSize: "12.5px" }}>
                    Subject: Salary Increment for the position of {formData.position}
                  </p>

                  <p style={{ fontSize: "12.5px" }}>Your revised compensation details are as follows:</p>

                  {/* Salary Table - More compact */}
                  <div style={{ margin: "10px 0", padding: "8px 12px", background: "#f9f9f9", borderLeft: "4px solid #f27022" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: "4px 6px", width: "35%", fontWeight: "bold" }}>Employee Name</td>
                          <td style={{ padding: "4px 6px", width: "65%" }}>{formData.employeeName}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold" }}>Employee ID</td>
                          <td style={{ padding: "4px 6px" }}>{formData.employeeId || "To be assigned"}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold" }}>Designation</td>
                          <td style={{ padding: "4px 6px" }}>{formData.position}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold" }}>Department</td>
                          <td style={{ padding: "4px 6px" }}>{formData.department || "As per requirement"}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold" }}>Current Salary</td>
                          <td style={{ padding: "4px 6px" }}>₹{Number(formData.currentSalary).toLocaleString('en-IN')}/- per month</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold", color: "#f27022" }}>Revised Salary</td>
                          <td style={{ padding: "4px 6px", color: "#f27022", fontWeight: "bold" }}>₹{Number(formData.newSalary).toLocaleString('en-IN')}/- per month</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold" }}>Increment Percentage</td>
                          <td style={{ padding: "4px 6px" }}>{formData.incrementPercentage}%</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 6px", fontWeight: "bold" }}>Effective Date</td>
                          <td style={{ padding: "4px 6px" }}>{new Date(formData.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {formData.performanceRemarks && (
                    <>
                      <p style={{ fontWeight: "bold", marginTop: "8px", marginBottom: "2px", fontSize: "12.5px" }}>Performance Remarks:</p>
                      <p style={{ marginBottom: "6px", fontStyle: "italic", color: "#555", fontSize: "12px" }}>"{formData.performanceRemarks}"</p>
                    </>
                  )}

                  <p style={{ fontWeight: "bold", marginTop: "6px", marginBottom: "2px", fontSize: "12.5px" }}>Reason for Increment:</p>
                  <p style={{ marginBottom: "6px", fontSize: "12px" }}>{formData.reasonForIncrement}</p>

                  <p style={{ margin: "8px 0", fontSize: "12.5px" }}>
                    This increment is a testament to your dedication and valuable contributions to our organization. We look forward to your continued growth and success with us.
                  </p>

                  <p style={{ margin: "6px 0", fontStyle: "italic", color: "#555", fontSize: "12px" }}>
                    Please note that this revised salary will be reflected in your next payroll cycle.
                  </p>
                </div>

                {/* Signatures - Reduced margin top */}
                <div style={{ marginTop: "25px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "50%", verticalAlign: "bottom" }}>
                          <p style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "14px" }}>
                            For Viral Ads Media
                          </p>
                          <div style={{ height: "50px" }}></div>
                          <div style={{ borderTop: "1px solid #000", width: "220px", paddingTop: "4px" }}>
                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px" }}>
                             
                            </p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>
                              Authorized Signatory
                            </p>
                          </div>
                        </td>

                        <td style={{ width: "50%", textAlign: "right", verticalAlign: "bottom" }}>
                          <p style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "14px" }}>
                            Accepted & Agreed
                          </p>
                          <div style={{ height: "50px" }}></div>
                          <div style={{ borderTop: "1px solid #000", width: "220px", marginLeft: "auto", paddingTop: "4px" }}>
                           
                            <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>
                              Employee Signature
                            </p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer - Positioned at bottom */}
                <div style={{ 
                  marginTop: "auto", 
                  textAlign: "center", 
                  fontSize: "10px", 
                  color: "#777",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee"
                }}>
                  <strong>Viral Ads Media | Digital Creative Agency</strong><br />
                  B-27, Budh Vihar Phase 1, New Delhi - 110086 | +91 93544 91934
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 no-print pb-10">
                <button onClick={() => setPreview(false)} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all border border-gray-300">
                  Edit Details
                </button>
                <button onClick={handlePrint} className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md">
                  Print / Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}