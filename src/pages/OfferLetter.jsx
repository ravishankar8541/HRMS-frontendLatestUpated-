import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useEmployee } from "../context/EmployeeContext";
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
  salary: "",
  joiningDate: "",
  hrName: "",
  phoneNumber: "",
  emailId: ""

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

export default function OfferLetter() {
  const { createOfferLetter, sendOfferLetterEmail } = useEmployee();
  const [formData, setFormData] = useState(initialFormData);
  const [preview, setPreview] = useState(false);
  const [offerId, setOfferId] = useState("");
  const [dbId, setDbId] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Offer_Letter_${formData.employeeName || "Candidate"}`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createOfferLetter(formData);
      setOfferId(result.offerId);
      setDbId(result.data._id);
      setPreview(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err.message || "Error generating offer letter");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) return alert("Please enter an email");
    setLoading(true);
    try {
      await sendOfferLetterEmail(dbId, email);
      alert("Offer Letter sent successfully!");
      setShowEmailModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold mb-6 text-gray-800">Generate Offer Letter</h1>
              <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Name</label>
                  <input name="employeeName" value={formData.employeeName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Father's Name</label>
                  <input name="fathersName" value={formData.fathersName} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Id</label>
                  <input name="emailId" value={formData.emailId} onChange={handleChange} className={inputClass} required />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <CustomDropdown name="position" value={formData.position} onChange={handleChange} options={DESIGNATION_OPTIONS} placeholder="Select Designation" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Salary (INR)</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Joining Date</label>
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HR Name</label>
                  <input name="hrName" value={formData.hrName} onChange={handleChange} className={inputClass} required />
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
                  padding: "15mm 20mm",
                  fontFamily: "'Times New Roman', Times, serif",
                  color: "#1a1a1a",
                  lineHeight: "1.5",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  position: "relative",
                  overflow: "hidden"
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
      opacity: "0.15"
    }}
  />
</div>
{/* WATERMARK END */}





                {/* Header Table */}
                <div style={{ borderBottom: "2px solid #f27022", paddingBottom: "10px", marginBottom: "20px", marginTop: "-40px" }}>
                  <table style={{ width: "100%" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "60%" }}>
                          <img src="/blackLogo.png" alt="Logo" style={{ width: "180px", height: "auto" }} />
                        </td>
                        <td style={{ textAlign: "right", fontSize: "12px", color: "#444", verticalAlign: "middle" }}>
                          <strong>Ref No:</strong> {offerId}<br />
                          <strong>Date:</strong> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  To,<br />
                  <span style={{ fontWeight: "bold", fontSize: "15px", color: "#000" }}>{formData.employeeName}</span><br />
                  {formData.address}
                  <br />
                  {formData.phoneNumber}
                  <br />
                  {formData.emailId}
                </div>

                <div style={{ textAlign: "center", fontSize: "19px", fontWeight: "bold", margin: "20px 0", textTransform: "uppercase", letterSpacing: "1px", color: "#000" }}>
                  Letter of Employment Offer
                </div>

                <div style={{ textAlign: "justify" }}>
                  <p style={{ marginBottom: "10px" }}>Dear <span style={{ fontWeight: "bold", color: "#000" }}>{formData.employeeName}</span>,</p>
                  <p style={{ marginBottom: "10px" }}>We are pleased to formally offer you the position of <span style={{ fontWeight: "bold", color: "#000" }}>{formData.position}</span> at <span style={{ fontWeight: "bold", color: "#000" }}>Viral Ads Media</span>. Based on our evaluation of your skills and experience, we are confident that you will make significant contributions to our team's creative excellence.</p>

                  <p style={{ fontWeight: "bold", margin: "15px 0", fontStyle: "italic", textDecoration: "underline", color: "#333" }}>Subject: Appointment for the position of {formData.position}</p>

                  <p>Your employment will be governed by the following key terms and conditions:</p>
                  <ul style={{ paddingLeft: "20px", margin: "10px 0", listStyleType: "none" }}>
                    {[
                      { label: "Commencement", val: new Date(formData.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { label: "Remuneration", val: `₹${Number(formData.salary).toLocaleString('en-IN')}/- (Inclusive of all statutory allowances)` },
                      { label: "Probation", val: "Three (3) Months" },
                      { label: "Location", val: "Delhi" }
                    ].map((item, i) => (
                      <li key={i} style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#f27022", fontWeight: "bold", marginRight: "8px" }}>•</span>
                        <strong>{item.label}:</strong> {item.val}
                      </li>
                    ))}
                  </ul>

                  <div style={{ background: "#fcfcfc", border: "1px solid #efefef", padding: "12px", margin: "20px 0", fontSize: "12.5px", borderLeft: "4px solid #f27022" }}>
                    <strong>Professional Standards:</strong> You are expected to maintain high levels of confidentiality and integrity. All intellectual property created during your tenure remains the property of the agency.
                  </div>

                  
                </div>

                {/* Signatures */}
                <table style={{ width: "100%", marginTop: "90px", borderCollapse: "collapse" }}>
  <tbody>
  <tr>

    {/* Company Signature */}
    <td style={{ width: "50%", verticalAlign: "top" }}>

      <p style={{ margin: "0 0 12px 0", fontWeight: "bold", fontSize: "15px" }}>
        For Viral Ads Media
      </p>

      {/* Space for manual signature */}
      <div style={{ height: "80px" }}></div>

      <div
        style={{
          borderTop: "1px solid #000",
          width: "250px",
          paddingTop: "6px"
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>
          Authorized Signatory
        </p>
      </div>

    </td>

    {/* Employee Signature */}
    <td style={{ width: "50%", textAlign: "right", verticalAlign: "top" }}>

      <p style={{ margin: "0 0 12px 0", fontWeight: "bold", fontSize: "15px" }}>
        Accepted & Agreed
      </p>

      {/* Space for employee signature */}
      <div style={{ height: "80px" }}></div>

      <div
        style={{
          borderTop: "1px solid #000",
          width: "250px",
          marginLeft: "auto",
          paddingTop: "6px"
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold" }}>
          Employee Signature
        </p>
      </div>

    </td>

  </tr>
</tbody>


</table>

                {/* Footer */}
                <div style={{ position: "absolute", bottom: "15mm", left: 0, right: 0, textAlign: "center", fontSize: "10.5px", color: "#777" }}>
                  <div style={{ borderTop: "1px solid #eee", width: "90%", margin: "0 auto 8px auto" }}></div>
                  <strong>Viral Ads Media | Digital Creative Agency</strong><br />
                  B-27, Budh Vihar Phase 1, New Delhi - 110086 | +91 93544 91934
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 no-print pb-10">
                <button onClick={() => setPreview(false)} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all border border-gray-300">Edit Details</button>
                <button onClick={handlePrint} className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md">Print / Download PDF</button>
                <button onClick={() => setShowEmailModal(true)} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md">Send via Email</button>
              </div>
            </div>
          )}

          {showEmailModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">Email PDF to Candidate</h3>
                <input type="email" placeholder="candidate@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowEmailModal(false)} className="text-gray-500 text-sm">Cancel</button>
                  <button onClick={handleSendEmail} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-md">
                    {loading ? "Sending..." : "Send Now"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}