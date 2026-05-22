import React, { useState, useRef, useEffect } from "react";
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

// Reusable Custom Dropdown to match Appointment Letter design
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

const TerminationLetter = () => {
  const { employees, createTerminationRecord, sendTerminationEmail } = useEmployee();
  const location = useLocation();

  const [formData, setFormData] = useState({
    employeeId: "", 
    name: "",
    email: "",
    phoneNumber: "",
    designation: "", 
    dateOfJoining: "",
    lastWorkingDate: "",
    reason: "",
    hrName: "",
  });

  const [preview, setPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get("employeeId");

    if (employeeId && employees && employees.length > 0) {
      const selectedEmp = employees.find((emp) => emp._id === employeeId);
      if (selectedEmp) {
        setFormData((prev) => ({
          ...prev,
          employeeId: selectedEmp._id,
          name: selectedEmp.name || "",
          email: selectedEmp.email || "",
          phoneNumber: selectedEmp.phoneNumber || "",
          // FIXED: Changed from .position to .designation to match your Mongoose schema
          designation: selectedEmp.designation || "",
          dateOfJoining: selectedEmp.dateOfJoining
            ? new Date(selectedEmp.dateOfJoining).toISOString().split("T")[0]
            : "", 
        }));
      }
    }
  }, [location.search, employees]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Termination_Letter_${formData.name || "Employee"}`,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendEmail = async () => {
    if (!formData.email.trim()) return alert("Please enter a recipient email");
    
    setLoading(true);
    try {
      const recordRes = await createTerminationRecord({
        employeeId: formData.employeeId || "60d0fe4f5311236168a109ca",
        employeeName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        designation: formData.designation,
        lastWorkingDate: formData.lastWorkingDate,
        reason: formData.reason,
        hrName: formData.hrName
      });

      const mongoId = recordRes.data?._id || recordRes._id;
      if (!mongoId) throw new Error("Failed to retrieve record ID");

      await sendTerminationEmail(mongoId, formData.email);

      alert(`Termination Letter sent to ${formData.email} successfully!`);
      setShowEmailModal(false);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const LetterHead = () => (
    <div style={{ borderBottom: "2px solid #f27022", paddingBottom: "10px", marginBottom: "20px" }}>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ width: "60%" }}>
              <img src="/blackLogo.png" alt="Logo" style={{ width: "180px", height: "auto" }} />
            
            </td>
            <td style={{ textAlign: "right", fontSize: "11px", color: "#333", verticalAlign: "middle" }}>
              <strong>OFFICIAL NOTICE</strong><br />
              
              Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const Footer = () => (
    <div style={{ position: "absolute", bottom: "15mm", left: 0, right: 0, textAlign: "center", fontSize: "10.5px", color: "#777" }}>
      <div style={{ borderTop: "1px solid #eee", width: "90%", margin: "0 auto 8px auto" }}></div>
      <strong>Viral Ads Media | Digital Creative Agency</strong><br />
      B-27, Budh Vihar Phase 1, New Delhi-86 | Tel: 9354491934
    </div>
  );

  const pageBaseStyle = {
    width: "210mm",
    minHeight: "297mm",
    padding: "15mm 20mm",
    margin: "0 auto",
    backgroundColor: "white",
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#1a1a1a",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden"
  };

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
            <div className="bg-white rounded-xl shadow-md p-8 no-print border border-slate-200">
              <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-orange-600 pl-4">Generate Termination Letter</h1>
              <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <CustomDropdown name="designation" value={formData.designation} onChange={handleChange} options={DESIGNATION_OPTIONS} placeholder="Select Designation" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Working Date</label>
                  <input name="lastWorkingDate" type="date" value={formData.lastWorkingDate} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Authorized HR Name</label>
                  <input name="hrName" value={formData.hrName} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Reason for Termination</label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" className={inputClass} placeholder="Reason..." />
                </div>

                <button type="submit" className="md:col-span-2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md">
                  Generate Letter Preview
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div ref={printRef} className="print:m-0">
                <div style={pageBaseStyle} className="shadow-2xl print:shadow-none mb-8">
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
      opacity: "0.15"
    }}
  />
</div>
{/* WATERMARK END */}

                  <LetterHead />
                  
                  <div style={{ marginBottom: "20px" }}>
                    To,<br />
                    <span style={{ fontWeight: "bold", fontSize: "15px", color: "#000" }}>{formData.name}</span><br />
                    {formData.designation && <div>Designation: {formData.designation}</div>}
                    {formData.email && <div>{formData.email}</div>}
                    {formData.phoneNumber && <div>{formData.phoneNumber}</div>}
                  </div>

                  <h1 style={{ textAlign: "center", fontSize: "22px", margin: "20px 0", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                    TERMINATION OF EMPLOYMENT
                  </h1>

                  <div style={{ marginTop: "20px", textAlign: "justify" }}>
                    <p>Dear {formData.name.split(" ")[0] || "Employee"},</p>
                    <p>This letter serves as formal notification that your employment as <strong>{formData.designation || "Employee"}</strong> with <strong>VIRAL ADS MEDIA</strong> is terminated effective <strong>{formData.lastWorkingDate ? new Date(formData.lastWorkingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "Immediate Effect"}</strong>.</p>
                    
                    <p style={{ marginTop: "15px" }}>
                      {formData.reason ? `This decision follows a review concerning ${formData.reason}.` : "This decision follows a thorough review of organizational requirements and performance standards."}
                    </p>
                    
                    <p style={{ marginTop: "15px" }}>
                      Please ensure that all company property, including but not limited to laptop, access cards, and company documents, are returned to the HR department by your final working date. Your final settlement will be processed within the standard company timelines following a full clearance from all departments.
                    </p>
                  </div>

                  <div style={{ marginTop: "180px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <p>For <strong>VIRAL ADS MEDIA</strong></p>
                      <div style={{ height: "40px" }}></div>
                      <p>__________________________<br />Authorised Signatory</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p><strong>Acknowledgment</strong></p>
                      <div style={{ height: "40px" }}></div>
                      <p>__________________________<br /><strong>Employee Signature</strong></p>
                    </div>
                  </div>

                  <Footer />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 no-print pb-10">
                <button onClick={() => setPreview(false)} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all border border-gray-300">Edit Details</button>
                <button onClick={handlePrint} className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md">Print / Save PDF</button>
                <button onClick={() => setShowEmailModal(true)} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md">Send to Email</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Recipient Email</h3>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
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

export default TerminationLetter;