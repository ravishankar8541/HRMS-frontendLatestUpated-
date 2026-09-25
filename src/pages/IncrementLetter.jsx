import { vaultForm } from '../utils/vaultForm';
import VaultEditNotice from '../components/VaultEditNotice';
import DocumentPreview from "../components/DocumentPreview";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const DESIGNATION_OPTIONS = [
  "Sales Executive", "Frontend Developer", "Full Stack Developer",
  "Graphic Designer (Intern)", "Software Developer (Intern)",
  "Social Media Manager", "SEO Specialist", "Graphic Designer",
  "Shopify Developer", "Digital Ads Manager", "Accountant",
  "Human Resources Executive", "Relationship Manager", "Telecaller",
  "Business Development Manager", "Branch Manager Sales", "Territory Manager Sales"
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

export default function IncrementLetter() {
  const { employees, createIncrementLetter, sendIncrementLetterEmail } = useEmployee();
  const location = useLocation();
  
  const [formData, setFormData] = useState(() => vaultForm(initialFormData, location.state?.vaultDocument, {}));
  const [preview, setPreview] = useState(false);
  const [incrementId, setIncrementId] = useState("");
  const [savedDbId, setSavedDbId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const printRef = useRef(null);

  // Auto-fill employee data from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const empIdParam = params.get("employeeId");

    if (empIdParam && employees && employees.length > 0) {
      const emp = employees.find((e) => String(e._id) === String(empIdParam));
      if (emp) {
        setFormData((prev) => ({
          ...prev,
          employeeName: emp.name || "",
          fathersName: emp.fatherName || "",
          address: emp.address || "",
          position: emp.designation || "",
          currentSalary: emp.salary || "",
          phoneNumber: emp.phoneNumber || "",
          emailId: emp.email || "",
          employeeId: emp.empId || `VAM-${emp._id.slice(-4).toUpperCase()}`,
          department: emp.department || "Sales",
          effectiveDate: new Date().toISOString().split("T")[0],
          hrName: "HR Manager",
        }));
      }
    }
  }, [location.search, employees]);

  const [pdfOpen,setPdfOpen]=useState(false);
  const handlePrint = async () => {  setPdfOpen(true); };

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createIncrementLetter(formData);
      setIncrementId(res.incrementId);
      setSavedDbId(res.data._id);
      setRecipientEmail(formData.emailId);
      setPreview(true);
      setPdfOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err.message || "Failed to save Increment Letter");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) return alert("Please specify an email address.");
    try {
      setLoading(true);
      await sendIncrementLetterEmail(savedDbId, recipientEmail);
      alert(`Increment Letter successfully dispatched to ${recipientEmail}!`);
      setShowEmailModal(false);
    } catch (err) {
      alert("Failed to send email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="no-print"><Sidebar /></div>

      {pdfOpen && savedDbId && <DocumentPreview type="Increment Letter" id={savedDbId} onClose={()=>setPdfOpen(false)}/>}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
        <VaultEditNotice />
        <div className="w-full">
          {!preview ? (
            <div className="bg-white rounded-xl shadow-md p-8 no-print border border-slate-200">
              <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-orange-600 pl-4">
                Generate Increment Letter
              </h1>
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
                  <input name="emailId" type="email" value={formData.emailId} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <input name="employeeId" value={formData.employeeId} onChange={handleChange} className={inputClass} placeholder="e.g., VAM-03B7" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input name="department" value={formData.department} onChange={handleChange} className={inputClass} placeholder="e.g., Sales" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation *</label>
                  <select name="position" value={formData.position} onChange={handleChange} className={inputClass} required>
                    <option value="">Select Designation</option>
                    {DESIGNATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    {formData.position && !DESIGNATION_OPTIONS.includes(formData.position) && (
                      <option value={formData.position}>{formData.position}</option>
                    )}
                  </select>
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
                  <textarea name="performanceRemarks" value={formData.performanceRemarks} onChange={handleChange} className={inputClass} rows="2" />
                </div>
                <button type="submit" disabled={loading} className="md:col-span-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all shadow-md">
                  {loading ? "Saving to Database..." : "Generate Preview & Save"}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Printable Area */}
              <div 
                ref={printRef} 
                className="bg-white p-12 shadow-2xl mx-auto rounded-lg text-slate-900 border border-slate-200"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  boxSizing: "border-box",
                  position: "relative",
                  fontFamily: "'Times New Roman', Times, serif"
                }}
              >
                {/* Header */}
                <div className="border-b-2 border-orange-500 pb-3 mb-6 flex justify-between items-center">
                  <img src="/blackLogo.png" alt="Logo" className="w-40 h-auto" />
                  <div className="text-right text-xs text-slate-600 leading-relaxed">
                    <strong>Ref No:</strong> {incrementId}<br />
                    <strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="text-sm mb-5 leading-relaxed">
                  To,<br />
                  <strong>{formData.employeeName}</strong><br />
                  {formData.fathersName && <span>S/O {formData.fathersName}<br /></span>}
                  {formData.address}<br />
                  {formData.phoneNumber}<br />
                  {formData.emailId}
                </div>

                <h2 className="text-center font-bold text-lg uppercase my-5 tracking-wide">
                  Letter of Salary Increment
                </h2>

                {/* Letter Body */}
                <div className="text-sm leading-relaxed space-y-3 text-justify">
                  <p>Dear <strong>{formData.employeeName}</strong>,</p>
                  <p>
                    We are pleased to inform you that based on your performance and contribution to <strong>Viral Ads Media</strong>, your compensation has been revised with effect from <strong>{new Date(formData.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                  </p>

                  <p className="font-bold">
                    Subject: Salary Increment for the position of {formData.position}
                  </p>

                  <table className="w-full border-collapse my-4 text-xs border border-slate-200">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-1/3 bg-slate-50 p-2 font-bold border-r border-slate-200">Employee ID</td>
                        <td className="p-2">{formData.employeeId || "N/A"}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2 font-bold border-r border-slate-200">Designation</td>
                        <td className="p-2">{formData.position}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2 font-bold border-r border-slate-200">Department</td>
                        <td className="p-2">{formData.department || "Sales"}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2 font-bold border-r border-slate-200">Previous Salary</td>
                        <td className="p-2">Rs. {Number(formData.currentSalary).toLocaleString('en-IN')}/- per month</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2 font-bold border-r border-slate-200">Revised Salary</td>
                        <td className="p-2 text-orange-600 font-bold">Rs. {Number(formData.newSalary).toLocaleString('en-IN')}/- per month</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2 font-bold border-r border-slate-200">Increment Percentage</td>
                        <td className="p-2 font-bold">{formData.incrementPercentage}%</td>
                      </tr>
                      <tr>
                        <td className="bg-slate-50 p-2 font-bold border-r border-slate-200">Effective Date</td>
                        <td className="p-2">{new Date(formData.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                    </tbody>
                  </table>

                  {formData.performanceRemarks && (
                    <p><strong>Performance Remarks:</strong> <em>"{formData.performanceRemarks}"</em></p>
                  )}

                  <p>
                    All other terms and conditions of your employment contract remain unchanged. We appreciate your dedication and look forward to your continued contribution to the growth of Viral Ads Media.
                  </p>
                </div>

                {/* Only Yours Sincerely / Regards */}
                <div style={{ marginTop: "35px" }}>
                  <p style={{ margin: "0 0 3px 0", fontSize: "14px" }}>Yours Sincerely,</p>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>For Viral Ads Media</p>
                </div>

                {/* Bottom Address Footer */}
                <div 
                  style={{
                    position: "absolute",
                    bottom: "10mm",
                    left: "15mm",
                    right: "15mm",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#666",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "8px"
                  }}
                >
                  Viral Ads Media | B-27, Budh Vihar Phase 1, New Delhi - 110086 | +91 93544 91934
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 no-print pb-10">
                <button onClick={() => setPreview(false)} className="bg-slate-200 text-slate-800 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-300">
                  Edit Form
                </button>
                <button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md">
                  Print PDF
                </button>
                <button onClick={() => setShowEmailModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md">
                  Send Email
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-base font-bold mb-3">Send Increment Letter</h3>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={inputClass}
              placeholder="recipient@domain.com"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowEmailModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button onClick={handleSendEmail} disabled={loading} className="bg-orange-600 text-white px-4 py-1.5 rounded text-xs font-bold">
                {loading ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
