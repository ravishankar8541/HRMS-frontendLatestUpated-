import { useLocation } from 'react-router-dom';
import { vaultForm } from '../utils/vaultForm';
import VaultEditNotice from '../components/VaultEditNotice';
import DocumentPreview from "../components/DocumentPreview";
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const DESIGNATION_OPTIONS = [
  "Business Development Manager", "Sales Executive", "Frontend Developer",
  "Full Stack Developer", "Graphic Designer (Intern)", "Software Developer (Intern)",
  "Social Media Manager", "SEO Specialist", "Graphic Designer", "Shopify Developer",
  "Digital Ads Manager", "Accountant", "Human Resources Executive", "Relationship Manager", 
  "Telecaller","Branch Manager Sales", "Territory Manager Sales"
];

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

export default function AppointmentLetter() {
  const location = useLocation();
  const { createAppointmentLetter, sendAppointmentEmail } = useEmployee();

  const [formData, setFormData] = useState(() => vaultForm({
    name: "", fathersName: "", address: "", designation: "", salary: "",
    effectiveDate: "", manager: "", phone: "", personalEmail: ""
  }, location.state?.vaultDocument, {name:'employeeName',designation:'position',effectiveDate:'joiningDate',manager:'hrName',personalEmail:'email'}));

  const [preview, setPreview] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const printRef = useRef(null);

  const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm";

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;
    if (name === "salary") cleanValue = value.replace(/[^0-9]/g, "");
    setSavedId(null);
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const [pdfOpen,setPdfOpen]=useState(false);
  const handlePrint = async () => { if (!savedId && !(await handleSaveToDB())) return; setPdfOpen(true); };

  const getPayload = () => ({
    employeeName: formData.name,
    fathersName: formData.fathersName,
    address: formData.address,
    position: formData.designation,
    salary: Number(formData.salary),
    joiningDate: formData.effectiveDate,
    hrName: formData.manager,
    phone: formData.phone,
    email: formData.personalEmail
  });

  const handleSaveToDB = async () => {
    try {
      setIsSubmitting(true);
      const result = await createAppointmentLetter(getPayload());
      const newId = result.id || result.data?._id;
      setSavedId(newId);
      alert("Appointment details saved to database!");
      return newId;
    } catch (err) {
      alert("Error saving: " + err.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return alert("Please enter an email");
    try {
      setIsSubmitting(true);
      let currentId = savedId;
      if (!currentId) currentId = await handleSaveToDB();
      if (currentId) {
        await sendAppointmentEmail(currentId, email);
        alert("Letter sent successfully to " + email);
        setShowEmailModal(false);
      }
    } catch (err) {
      alert("Failed to send: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedJoiningDate = formData.effectiveDate
    ? new Date(formData.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';
  const formattedSalary = Number(formData.salary || 0).toLocaleString('en-IN');

  // ==================== PROFESSIONAL LETTERHEAD (All Pages) ====================
  const LetterHead = () => (
    <div style={{ borderBottom: "3px solid #f27022", paddingBottom: "12px", marginBottom: "25px" }}>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ width: "60%", verticalAlign: "middle" }}>
              <img src="/blackLogo.png" alt="Logo" style={{ width: "185px", height: "auto" }} />
            </td>
            <td style={{ textAlign: "right", fontSize: "11.5px", color: "#333", verticalAlign: "middle" }}>
              Ref: HRMS/2026<br />
              Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Simple Footer (Page 1 & 2)
  const SimpleFooter = ({ pageNum }) => (
    <div style={{ textAlign: "center", fontSize: "10.5px", color: "#777", paddingTop: "12px", borderTop: "1px solid #eee", marginTop: "auto" }}>
      Viral Ads Media | Digital Creative Agency &nbsp;&nbsp;•&nbsp;&nbsp; Page {pageNum} of 3
    </div>
  );

  // Full Footer with Complete Address (Only on Last Page)
  const FullFooter = () => (
    <div style={{ textAlign: "center", fontSize: "10.5px", color: "#777", paddingTop: "12px", borderTop: "1px solid #eee", marginTop: "auto" }}>
      <strong>Viral Ads Media </strong><br />
      B-27, Budh Vihar Phase 1, New Delhi-86 | Tel: 9354491934
    </div>
  );

  const pageBaseStyle = {
    width: "210mm",
    minHeight: "297mm",
    padding: "12mm 18mm",
    margin: "0 auto",
    backgroundColor: "white",

    position: "relative",
    overflow: "hidden",

    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "14px",
    lineHeight: "1.55",
    color: "#1a1a1a",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
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

      {pdfOpen && savedId && <DocumentPreview type="Appointment Letter" id={savedId} onClose={()=>setPdfOpen(false)}/>}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
        <VaultEditNotice />
        <div className="w-full">

          {!preview ? (
            <div className="bg-white rounded-xl shadow-md p-8 no-print border border-slate-200">
              <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-orange-600 pl-4">Generate Appointment Letter</h1>
              <form onSubmit={async (e) => { e.preventDefault(); if(await handleSaveToDB()){setPreview(true);setPdfOpen(true);} }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-1">Employee Name</label><input name="name" value={formData.name} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block text-sm font-medium mb-1">Father's Name</label><input name="fathersName" value={formData.fathersName} onChange={handleChange} className={inputClass} required /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Full Address</label><input name="address" value={formData.address} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block text-sm font-medium mb-1">Phone Number</label><input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block text-sm font-medium mb-1">Email Id</label><input name="personalEmail" type="email" value={formData.personalEmail} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block text-sm font-medium mb-1">Designation</label><CustomDropdown name="designation" value={formData.designation} onChange={handleChange} options={DESIGNATION_OPTIONS} placeholder="Select Designation" /></div>
                <div><label className="block text-sm font-medium mb-1">Monthly Salary (₹)</label><input name="salary" type="number" value={formData.salary} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block text-sm font-medium mb-1">Effective Date</label><input name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block text-sm font-medium mb-1">Reporting Manager</label><input name="manager" value={formData.manager} onChange={handleChange} className={inputClass} required /></div>

                <button type="submit" className="md:col-span-2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md">
                  Generate Letter Preview
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div ref={printRef} className="print:m-0">

                {/* ====================== PAGE 1 ====================== */}
                <div style={pageBaseStyle} className="shadow-2xl print:shadow-none mb-8">
                  

                  <img
                    src="/blackLogo.png"
                    alt="watermark"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(-35deg)",
                      width: "900px",
                      opacity: 0.09,
                      zIndex: 0,
                      pointerEvents: "none",
                      userSelect: "none"
                    }}
                  />


                  <LetterHead />

                  {/* Recipient "To" Address - Only on Page 1 (Professional Standard) */}
                  <div style={{ marginBottom: "22px", lineHeight: "1.45" }}>
                    To,<br />
                    <strong style={{ fontSize: "15.5px" }}>{formData.name}</strong><br />
                    S/O {formData.fathersName}<br />
                    {formData.address}<br />
                    {formData.phone}<br />
                    {formData.personalEmail}
                  </div>

                  <h1 style={{ textAlign: "center", fontSize: "23px", margin: "22px 0 18px", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                    APPOINTMENT LETTER
                  </h1>

                  <p><strong>Subject: Appointment for the post of {formData.designation}</strong></p>
                  <p style={{ marginTop: "18px" }}>Dear {formData.name.split(" ")[0] || formData.name},</p>
                  <p>We are pleased to offer you the position of <strong>{formData.designation}</strong> with <strong>VIRAL ADS MEDIA</strong> on the following terms and conditions:</p>

                  <div style={{ marginTop: "18px", textAlign: "justify" }}>
                    <p><strong>1. Commencement of employment:</strong> Your employment will be effective as of <strong>{formattedJoiningDate}</strong>.</p>
                    <p><strong>2. Job title:</strong> Your job title will be <strong>{formData.designation}</strong> and you will report to <strong>{formData.manager}</strong>.</p>
                    <p><strong>3. Salary:</strong> You will draw a gross stipend of <strong>Rs. {formattedSalary}/- Per Month</strong> (w.e.f. {formattedJoiningDate}).</p>
                    <p><strong>4. Place of posting:</strong> You will be posted at Rohini, Delhi. You may however be required to work at any place of business which the Company has, or may later acquire.</p>
                    <p><strong>5. Nature of duties:</strong> You will perform to the best of your ability all the duties as are inherent in your post and such additional duties as the company may call upon you to perform, from time to time. Your specific duties are set out in Schedule II hereto.</p>
                  </div>

                  <h2 style={{ color: "#f27022", margin: "32px 0 14px", textDecoration: "underline", fontSize: "18px" }}>OFFICE HOURS RULES AND REGULATIONS</h2>
                  <div style={{ textAlign: "justify" }}>
                    <p><strong>1. Office Timings:</strong> Employees must report no later than 9:30 AM and should not leave before 6:30 PM without prior permission. A grace period of 10 minutes (up to 9:40 AM) is allowed only twice a month. Any additional late arrival will be considered a half-day.</p>
                    <p><strong>2. Attendance and Punctuality:</strong> Three late marks in a month will result in a half-day leave deduction. Repeated late arrivals may lead to disciplinary action. Biometric attendance is mandatory.</p>
                    <p><strong>3. Leave Policy:</strong> All leaves must be pre-approved by the reporting manager. Emergency leaves must be informed via call or message before 09:00 AM. Any unapproved leave will be marked as LWP (Leave Without Pay). The Company shall notify a list of declared holidays in the beginning of each year.</p>
                    <p><strong>4. Sandwich Leave Policy:</strong> If an employee takes leave on both sides of a weekend or holiday, all consecutive days including the weekend/holiday will be counted as leave. <em>Example: If you take leave on Saturday and Monday, then Saturday, Sunday, and Monday will be considered as 3 days leave. This rule applies to both paid and unpaid leaves.</em></p>

                  </div>


                </div>

                {/* ====================== PAGE 2 ====================== */}
                <div style={pageBaseStyle} className="shadow-2xl print:shadow-none mb-8">
                   <img
                    src="/blackLogo.png"
                    alt="watermark"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(-35deg)",
                      width: "900px",
                      opacity: 0.09,
                      zIndex: 0,
                      pointerEvents: "none",
                      userSelect: "none"
                    }}
                  />

                  <div style={{ flex: 1, textAlign: "justify" }}>
                    <p><strong>5. Early Leave and Half Day:</strong> Early leave or late arrival beyond 2 hours without approval will be marked as half-day leave. Half-day working is allowed only in exceptional cases with prior approval.</p>
                    <p><strong>6. Work Discipline:</strong> No personal work during office hours. Avoid unnecessary breaks and maintain workplace decorum. Maintain silence and a professional environment.</p>
                    <p><strong>7. Consequences of Rule Violation:</strong> Verbal warning for the first-time violation. Written warning and leave deduction for repeated violations. Continued disregard may lead to suspension or termination.</p>
                    <p><strong>8. Company property:</strong> You will always maintain in good condition Company property, which may be entrusted to you for official use and shall return all such property to the Company prior to relinquishment of your charge, failing which the cost will be recovered from you.</p>
                    <p><strong>9. Borrowing/accepting gifts:</strong> You will not borrow or accept any money, gift, reward or compensation for your personal gains from any person/client with whom you may be having official dealings.</p>

                    <h2 style={{ color: "#f27022", margin: "32px 0 14px", textDecoration: "underline", fontSize: "18px" }}>TERMINATION</h2>
                    <p><strong>10.1</strong> You may terminate your employment by giving no less than 30 Days prior notice or salary for unsaved period, left after adjustment of pending leaves, as on date.</p>
                    <p><strong>10.2</strong> The Company reserves the right to terminate your employment summarily without any notice period or termination payment, if it has reasonable ground to believe you are guilty of misconduct or negligence, or have committed any fundamental breach of contract or caused any loss to the Company.</p>
                    <p><strong>10.3</strong> On the termination of your employment for whatever reason, you will return to the Company all property; documents and paper, both original and copies thereof, including any samples, literature, contracts, records, lists, drawings, blueprints, letters, notes, data and the like; and Confidential Information, in your possession or under your control relating to your employment or to clients’ business affairs.</p>

                    <h2 style={{ color: "#f27022", margin: "32px 0 14px", textDecoration: "underline", fontSize: "18px" }}>CONFIDENTIAL INFORMATION</h2>
                    <p><strong>11.1</strong> During your employment with the Company you will devote your whole time, attention and skill to the best of your ability for its business. You shall not, directly or indirectly, engage or associate yourself with, be connected with, concerned, employed or engaged in any other business or activities or any other post or work part time or pursue any course of study whatsoever, without the prior permission of the Company.</p>
                    <p><strong>11.2</strong> You must always maintain the highest degree of confidentiality and keep as confidential the records, documents and other Confidential Information relating to the business of the Company which may be known to you or confided in you by any means and you will use such records, documents and information only in a duly authorized manner in the interest of the Company. For the purposes of this clause ‘Confidential Information’ means information about the Company’s business and that of its customers which is not available to the general public and which may be learnt by you in the course of your employment. This includes, but is not limited to, information relating to the organization, its customer lists, employment policies, personnel, and information about the Company’s products, processes including ideas, concepts, projections, technology, manuals, drawing, designs, specifications, and all papers, resumes, records and other documents containing such Confidential Information.</p>
                    <p><strong>11.3</strong> At no time, will you remove any Confidential Information from the office without permission.</p>
                    <p><strong>11.4</strong> Your duty to safeguard and not disclose Confidential Information will survive the expiration or termination of this Agreement and/or your employment with the Company.</p>
                    <p><strong>11.5</strong> Breach of the conditions of this clause will render you liable to summary dismissal under clause above in addition to any other remedy the Company may have against you in law.</p>
                  </div>


                </div>

                {/* ====================== PAGE 3 (Last Page - Full Company Address in Footer) ====================== */}
                <div style={{ ...pageBaseStyle, pageBreakAfter: "avoid" }} className="shadow-2xl print:shadow-none">
                   <img
                    src="/blackLogo.png"
                    alt="watermark"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotate(-35deg)",
                      width: "900px",
                      opacity: 0.09,
                      zIndex: 0,
                      pointerEvents: "none",
                      userSelect: "none"
                    }}
                  />
                  <LetterHead />

                  <div style={{ flex: 1, textAlign: "justify" }}>
                    <h2 style={{ color: "#f27022", margin: "25px 0 14px", textDecoration: "underline", fontSize: "18px" }}>NOTICE PERIOD</h2>
                    <p><strong>12.</strong> Please note that this offer includes a mandatory notice period of 30 days. Should you choose to resign from your position, you are required to provide 30 days' written notice prior to your intended last working day, ensuring a smooth transition of responsibilities. The salary will be disbursed within 45 days from the employee’s last working day.</p>
                    <p><strong>13.</strong> Handover Obligations: Hand over all files and assets properly. Complete ongoing projects or document pending tasks clearly. Failure to do so may result in withholding of final settlement.</p>
                    <p><strong>14.</strong> Applicability of Company Policy: The Company shall be entitled to make policy declarations from time to time pertaining to matters like leave entitlement, maternity leave, employees’ benefits, working hours, transfer policies, etc., and may alter the same from time to time at its sole discretion. All such policy decisions of the Company shall be binding on you and shall override this Agreement to that extent.</p>
                    <p><strong>15.</strong> Governing Law/Jurisdiction: Your employment with the Company is subject to Indian laws. All disputes shall be subject to the jurisdiction of High Court, Delhi only.</p>
                    <p><strong>16.</strong> Acceptance of our offer: Please confirm your acceptance of this Contract of Employment by signing and returning the duplicate copy.</p>
                    <p style={{ marginTop: "32px" }}>We welcome you, and look forward to receiving your acceptance and to working with you.</p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-100px", position: "relative", top: "-50px" }}>
                    <div>
                      <p>Yours Sincerely,<br />For <strong>VIRAL ADS MEDIA</strong></p>
                      <div style={{ height: "68px" }}></div>
                      
                    </div>

                  </div>

                  <FullFooter />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 no-print pb-10">
                <button onClick={() => setPreview(false)} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all border border-gray-300">Edit Details</button>
                <button onClick={handleSaveToDB} disabled={isSubmitting} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md">{isSubmitting ? "Saving..." : "Save Record"}</button>
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
            <input type="email" placeholder="employee@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEmailModal(false)} className="text-gray-500 text-sm">Cancel</button>
              <button onClick={handleSendEmail} disabled={isSubmitting} className="bg-orange-600 text-white px-4 py-2 rounded-md font-bold">
                {isSubmitting ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
