import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const FNF = () => {
    const { employees, createFNFRecord, sendFNFEmail } = useEmployee();
    const location = useLocation();
    const printRef = useRef(null);

    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        dateOfJoining: "",
        lastWorkingDay: "",
        pendingSalary: "",
        leaveEncashment: "0",
        bonus: "0",
        deductions: "0",
        empId: "",
        designation: "",
        address: "",
        bankAccount: "",
        ifsc: "",
    });

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm bg-white";

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const employeeId = params.get("employeeId");

        if (employeeId && employees.length > 0) {
            const emp = employees.find((e) => String(e._id) === employeeId);

            if (emp) {
                setData((prev) => ({
                    ...prev,
                    name: emp.name || "",
                    email: emp.email || "",
                    phone: emp.phoneNumber || emp.phone || "",
                    dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
                    lastWorkingDay: emp.dateOfExit ? emp.dateOfExit.split("T")[0] : "",
                    pendingSalary: emp.salary || "",

                    // ✅ SAME ID SYSTEM AS PAYSLIP
                    empId: emp.empId || `VAM-${emp._id.slice(-4).toUpperCase()}`,

                    designation: emp.designation || "",
                    address: emp.address || "",
                    bankAccount: emp.accountNumber || emp.bankAccountNo || "",
                    ifsc: emp.ifscCode || emp.ifsc || "",
                }));
            }
        }
    }, [location.search, employees]);


    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const totalAmount =
        Number(data.pendingSalary || 0) +
        Number(data.leaveEncashment || 0) +
        Number(data.bonus || 0) -
        Number(data.deductions || 0);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `FNF_Statement_${data.name || "Employee"}`,
    });
    const handleSendEmail = async () => {
        if (!data.email.trim()) return alert("Please enter a recipient email");

        // Required fields check
        if (!data.empId || !data.name || !data.phone || !data.dateOfJoining ||
            !data.lastWorkingDay || !data.pendingSalary) {
            return alert("❌ Missing required fields!\n\nPlease fill:\n• Employee ID\n• Name\n• Phone\n• Date of Joining\n• Last Working Day\n• Pending Salary");
        }

        // ====================== FIXED PAYLOAD (this was the bug) ======================


        setLoading(true);
        try {
            const recordRes = await createFNFRecord({
                employeeId: data.empId,
                employeeName: data.name,
                email: data.email,
                phone: data.phone,
                dateOfJoining: data.dateOfJoining,
                lastWorkingDay: data.lastWorkingDay,
                pendingSalary: data.pendingSalary,
                leaveEncashment: data.leaveEncashment,
                incentive: data.bonus,
                deductions: data.deductions,
                totalPayable: totalAmount,

                // ←←← THESE 4 LINES WERE MISSING → NOW ADDED
                designation: data.designation || "N/A",
                address: data.address || "N/A",
                bankAccount: data.bankAccount || "N/A",
                ifsc: data.ifsc || "N/A"
            });

            const mongoId = recordRes.data?._id || recordRes._id;
            if (!mongoId) throw new Error("Failed to retrieve Record ID");

            await sendFNFEmail(mongoId, data.email);

            alert(`✅ FNF Statement sent to ${data.email} successfully!`);
            setShowEmailModal(false);
        } catch (error) {
            console.error("❌ FULL Backend Error:", error.response?.data || error);
            alert(error.response?.data?.message || error.response?.data?.error || "Failed to create FNF record");
        } finally {
            setLoading(false);
        }
    };

    const LetterHead = () => (
        <div style={{ borderBottom: "2px solid #f27022", paddingBottom: "10px", marginBottom: "20px", marginTop: "-50px" }}>
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td style={{ width: "60%" }}>
                            <img src="/blackLogo.png" alt="Logo" style={{ width: "180px", height: "auto" }} />

                        </td>
                        <td style={{ textAlign: "right", fontSize: "11px", color: "#333", verticalAlign: "middle" }}>
                            <strong>VIRAL ADS MEDIA</strong><br />
                            B-27, Budh Vihar Phase 1, New Delhi - 110086<br />
                            Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-100">
            <style>{`
                @media print {
                    @page { size: A4; margin: 0mm; }
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="no-print">
                <Sidebar />
            </div>

            <main className="flex-1 p-4 md:p-10 print:p-0">
                <div className="max-w-5xl mx-auto space-y-10">

                    {/* FORM SECTION */}
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 no-print border border-slate-200">
                        <h1 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-orange-600 pl-4">
                            Full & Final Settlement (FNF)
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Employee ID</label>
                                <input name="empId" value={data.empId} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Employee Name</label>
                                <input name="name" value={data.name} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Designation</label>
                                <input name="designation" value={data.designation} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Email</label>
                                <input name="email" value={data.email} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Phone Number</label>
                                <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Address</label>
                                <input name="address" value={data.address} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Date of Joining</label>
                                <input type="date" name="dateOfJoining" value={data.dateOfJoining} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Last Working Day</label>
                                <input name="lastWorkingDay" type="date" value={data.lastWorkingDay} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Bank Account Number</label>
                                <input name="bankAccount" value={data.bankAccount} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">IFSC Code</label>
                                <input name="ifsc" value={data.ifsc} onChange={handleChange} className={inputClass} placeholder="e.g. SBIN0001234" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Pending Salary (₹)</label>
                                <input name="pendingSalary" type="number" value={data.pendingSalary} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Leave Encashment (₹)</label>
                                <input name="leaveEncashment" type="number" value={data.leaveEncashment} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Bonus / Incentive (₹)</label>
                                <input name="bonus" type="number" value={data.bonus} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-600">Deductions (₹)</label>
                                <input name="deductions" type="number" value={data.deductions} onChange={handleChange} className={inputClass} />
                            </div>

                            <div className="md:col-span-2 flex gap-4 mt-6">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md active:scale-[0.98]"
                                >
                                    Print FNF Statement
                                </button>
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
                                >
                                    Send to Email
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="no-print text-center text-gray-400 text-sm font-medium uppercase tracking-widest mb-4">
                        --- Document Preview ---
                    </div>

                    <div ref={printRef} className="bg-white shadow-lg mx-auto overflow-hidden rounded-sm">
                        <div style={{
                            width: "210mm",
                            minHeight: "297mm",
                            padding: "20mm",
                            margin: "0 auto",
                            backgroundColor: "white",
                            position: "relative",   // ⭐ ADD THIS
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            color: "#1a1a1a",
                        }}>
                          
                          {/* PERFECT WATERMARK */}
<div
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-35deg)",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0
  }}
>
  <img
    src="/blackLogo.png"
    alt="Watermark"
    style={{
      width: "850px",
      height: "auto",
      opacity: 0.05,
      objectFit: "contain"
    }}
  />
</div>

                            <LetterHead />
                            <h1 style={{ textAlign: "center", fontSize: "22px", margin: "20px 0", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                                FULL & FINAL SETTLEMENT STATEMENT
                            </h1>

                            <div style={{ marginTop: "30px", marginBottom: "30px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Emp ID:</strong> {data.empId || "---"}</td>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Name:</strong> {data.name}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Designation:</strong> {data.designation || "---"}</td>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Email:</strong> {data.email}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Phone:</strong> {data.phone}</td>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>DOJ:</strong> {data.dateOfJoining}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Address:</strong> {data.address || "---"}</td>
                                            <td style={{ padding: "12px", border: "1px solid #eee" }}><strong>Last Working Day:</strong> {data.lastWorkingDay}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" style={{ padding: "12px", border: "1px solid #eee" }}>
                                                <strong>Bank Details:</strong> {data.bankAccount ? `${data.bankAccount}  |  IFSC: ${data.ifsc || "---"}` : "---"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: "20px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid #f27022" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f27022", color: "white" }}>
                                            <th style={{ padding: "12px", textAlign: "left" }}>Particulars</th>
                                            <th style={{ padding: "12px", textAlign: "right" }}>Amount (INR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px" }}>Pending Salary</td>
                                            <td style={{ padding: "12px", textAlign: "right" }}>{Number(data.pendingSalary || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px" }}>Leave Encashment</td>
                                            <td style={{ padding: "12px", textAlign: "right" }}>{Number(data.leaveEncashment || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "12px" }}>Bonus / Incentive</td>
                                            <td style={{ padding: "12px", textAlign: "right" }}>{Number(data.bonus || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee", color: "#d32f2f" }}>
                                            <td style={{ padding: "12px" }}>Deductions</td>
                                            <td style={{ padding: "12px", textAlign: "right" }}>- {Number(data.deductions || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr style={{ backgroundColor: "#fff5f0" }}>
                                            <td style={{ padding: "15px", fontWeight: "bold", color: "#f27022" }}>NET PAYABLE</td>
                                            <td style={{ padding: "15px", textAlign: "right", fontWeight: "bold", fontSize: "18px", color: "#f27022" }}>
                                                ₹ {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: "80px", display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <p>Prepared By,</p>
                                    <div style={{ height: "20px" }}></div>
                                    <p><br /><strong>HR Department</strong></p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p>Employee Acknowledgment,</p>
                                    <div style={{ height: "50px" }}></div>
                                    <p>__________________________<br /></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* EMAIL MODAL */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 no-print backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-2">Send Statement</h3>
                        <p className="text-gray-500 text-sm mb-4">Confirm the recipient's email address below.</p>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData({ ...data, email: e.target.value })}
                            className={inputClass}
                        />
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                            <button onClick={handleSendEmail} disabled={loading} className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700">
                                {loading ? "Sending..." : "Send Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FNF;