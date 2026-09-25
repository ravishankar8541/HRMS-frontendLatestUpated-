import DocumentPreview from "../components/DocumentPreview";
import PrivateImage from "../components/PrivateImage";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";
import { getServerBase } from "../utils/serverBase";

const Onboarding = () => {
    const printRef = useRef();

    const [searchParams] = useSearchParams();
    const employeeIdParam = searchParams.get("employeeId");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeIdParam || "");

    const { employees, submitOnboarding } = useEmployee();
    const employeeId = selectedEmployeeId || employeeIdParam;

    const [formData, setFormData] = useState({
        empId: "",
        name: "",
        designation: "",
        department: "",
        joiningDate: "",
        pan: "",
        bankAccount: "",
        bankName: "",
        ifsc: "",
        adhar: "",
        photo: null,
        idProof: null,
        addressProof: null,
        educationProof: null,
        experienceLetter: null,
        bgVerification: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Match the input style from Termination Letter
    const inputClass = "block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-sm bg-white";

    // Helper to generate full URL for existing uploaded files
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith("http")) return photoPath;
        const normalized = photoPath.replace(/\\/g, "/");
        const filename = normalized.split("/").pop() || "";
        return `${getServerBase()}/uploads/${filename}`;
    };

    useEffect(() => {
        if (employeeIdParam) {
            setSelectedEmployeeId(employeeIdParam);
        }
    }, [employeeIdParam]);

    useEffect(() => {
        if (employeeId && employees.length > 0) {
            const emp = employees.find((e) => String(e._id) === String(employeeId));
            if (emp) {
                setFormData((prev) => ({
                    ...prev,
                    empId: emp.empId || `VAM-${String(emp._id).slice(-4).toUpperCase()}`,
                    name: emp.name || "",
                    designation: emp.designation || "",
                    department: emp.department || "",
                    joiningDate: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
                    pan: emp.panNumber || "",
                    bankAccount: emp.accountNumber || "", 
                    bankName: emp.bankName || "",
                    ifsc: emp.ifscCode || "",
                    adhar: emp.adharNumber || "",

                    // Auto-fill existing files (string paths from DB)
                    photo: emp.photo || null,
                    idProof: emp.adharCardDoc || null,
                    addressProof: emp.panCardDoc || null,
                    educationProof: emp.educationProof || null,
                    experienceLetter: emp.experienceLetter || null,
                }));
            }
        }
    }, [employeeId, employees]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size should be less than 5MB");
                return;
            }
            setFormData((prev) => ({ ...prev, [field]: file }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.designation.trim()) newErrors.designation = "Designation is required";
        if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required";

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (formData.pan && !panRegex.test(formData.pan)) {
            newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
        }

        if (!formData.idProof) newErrors.idProof = "Adhar Card is required";
        if (!formData.addressProof) newErrors.addressProof = "Pan Card is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [pdfOpen,setPdfOpen]=useState(false);
    const handleSubmitAndPrint = async () => {
        if (!validateForm()) {
            alert("Please fill all required fields and upload mandatory documents.");
            return;
        }

        if (!employeeId) {
            alert("Employee ID not found in URL.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitOnboarding(employeeId, formData);
            const savedEmp = result?.data || result?.employee;
            if (savedEmp?.empId) {
                setFormData((prev) => ({ ...prev, empId: savedEmp.empId }));
            }
            alert("Onboarding data saved to database successfully!");
            setPdfOpen(true);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to save data to backend.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Shared Header/Footer logic for Print
    const LetterHead = () => (
        <div style={{ borderBottom: "2px solid #f27022", paddingBottom: "10px", marginBottom: "20px" }}>
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        <td style={{ width: "60%" }}>
                            <img src="/blackLogo.png" alt="Viral Ads Media" loading="eager" style={{ width: "180px", height: "auto", display: "block" }} />
                            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#666", letterSpacing: "1px", marginTop: "4px" }}>DIGITAL CREATIVE AGENCY</div>
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

            {pdfOpen && <DocumentPreview type="Onboarding Report" id={employeeId} onClose={()=>setPdfOpen(false)}/>}
            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
                <div className="w-full">

                    {/* FORM SECTION - DESIGN MATCHED */}
                    <div className="bg-white rounded-xl shadow-md p-8 no-print border border-slate-200">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-orange-600 pl-4">
                            Employee Onboarding
                        </h1>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Select Employee <span className="text-red-500">*</span></label>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">— Choose employee —</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.name} ({emp.email}) — {emp.onboardingStatus || "Pending"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Employee ID (VAM)</label>
                                <input
                                    name="empId"
                                    value={formData.empId || ""}
                                    readOnly
                                    className={`${inputClass} bg-slate-50 text-slate-600`}
                                    placeholder="Assigned after save if new"
                                />
                            </div>
                            {[
                                { name: "name", label: "Full Name", type: "text", required: true },
                                { name: "designation", label: "Designation", type: "text", required: true },
                                { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
                                { name: "pan", label: "PAN Number", type: "text", required: true, placeholder: "ABCDE1234F" },
                                { name: "adhar", label: "Aadhaar Number", type: "text" },
                                { name: "bankName", label: "Bank Name", type: "text", placeholder: "e.g. HDFC Bank" },
                                { name: "bankAccount", label: "Bank Account Number", type: "text" },
                                { name: "ifsc", label: "IFSC Code", type: "text", placeholder: "SBIN0001234" },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium mb-1">
                                        {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name] || ""}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className={inputClass}
                                    />
                                    {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium mb-1">Employee Photo</label>
                                <div className="flex items-center gap-4">
                                    {formData.photo && (
                                        <PrivateImage
                                            src={
                                                formData.photo instanceof File
                                                    ? URL.createObjectURL(formData.photo)
                                                    : getPhotoUrl(formData.photo)
                                            }
                                            alt="Preview"
                                            className="w-10 h-10 object-cover rounded-full border border-orange-200"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/40?text=No+Photo";
                                            }}
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, "photo")}
                                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                </div>
                                {formData.photo && typeof formData.photo === "string" && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Current: {formData.photo.split("/").pop()}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Required Documents</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { field: "idProof", label: "Adhar Card", accept: ".pdf,.jpg,.jpeg,.png" },
                                        { field: "addressProof", label: "Pan Card", accept: ".pdf,.jpg,.jpeg,.png" },
                                        { field: "educationProof", label: "Educational Certificates", accept: ".pdf" },
                                        { field: "experienceLetter", label: "Experience Letter (optional)", accept: ".pdf" },
                                    ].map((doc) => (
                                        <div key={doc.field} className="p-3 border border-gray-100 rounded-lg bg-slate-50">
                                            <label className="block text-xs font-bold mb-2">
                                                {doc.label} {(doc.field === "idProof" || doc.field === "addressProof") && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                type="file"
                                                accept={doc.accept}
                                                onChange={(e) => handleFileChange(e, doc.field)}
                                                className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-white file:shadow-sm"
                                            />
                                            {formData[doc.field] && (
                                                <p className="text-[10px] text-green-600 mt-1">
                                                    ✓ {formData[doc.field] instanceof File 
                                                        ? formData[doc.field].name 
                                                        : formData[doc.field].split("/").pop() || "Existing document"}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-3 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        name="bgVerification"
                                        checked={formData.bgVerification}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                    />
                                    Background Verification Completed
                                </label>
                            </div>

                            <button
                                onClick={handleSubmitAndPrint}
                                disabled={isSubmitting}
                                className="md:col-span-2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-all shadow-md disabled:bg-gray-400"
                            >
                                {isSubmitting ? "Saving Data..." : "Save & Print Onboarding Report"}
                            </button>
                        </div>
                    </div>

                    {/* PRINT SECTION - DESIGN MATCHED */}
                    <div ref={printRef} className="hidden print:block">
                        <div style={{
                            width: "210mm",
                            minHeight: "297mm",
                            padding: "15mm 20mm",
                            margin: "0 auto",
                            backgroundColor: "white",
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            color: "#1a1a1a",
                            position: "relative"
                        }}>
                            <LetterHead />

                            <h1 style={{ textAlign: "center", fontSize: "22px", margin: "20px 0", textDecoration: "underline", textTransform: "uppercase", fontWeight: "bold" }}>
                                ONBOARDING CONFIRMATION REPORT
                            </h1>

                            <div style={{ marginTop: "30px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: "10px 0", width: "75%" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                                    <p><strong>Employee ID:</strong> {formData.empId || "-"}</p>
                                                    <p><strong>Full Name:</strong> {formData.name || "-"}</p>
                                                    <p><strong>Designation:</strong> {formData.designation || "-"}</p>
                                                    <p><strong>Department:</strong> {formData.department || "-"}</p>
                                                    <p><strong>Joining Date:</strong> {formData.joiningDate || "-"}</p>
                                                    <p><strong>PAN:</strong> {formData.pan || "-"}</p>
                                                    <p><strong>Aadhaar:</strong> {formData.adhar || "-"}</p>
                                                    <p><strong>Bank Account:</strong> {formData.bankAccount || "-"}</p>
                                                    <p><strong>IFSC Code:</strong> {formData.ifsc || "-"}</p>
                                                </div>
                                            </td>
                                            <td style={{ width: "25%", textAlign: "right", verticalAlign: "top" }}>
                                                {formData.photo && (
                                                    <PrivateImage
                                                        src={formData.photo instanceof File 
                                                            ? URL.createObjectURL(formData.photo) 
                                                            : getPhotoUrl(formData.photo)}
                                                        alt="Employee"
                                                        style={{ width: "100px", height: "120px", objectFit: "cover", border: "1px solid #ddd", padding: "2px" }}
                                                        onError={(e) => e.target.src = "https://via.placeholder.com/100?text=No+Photo"}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #eee", borderRadius: "8px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "15px" }}>Document Verification Checklist</h3>
                                <ul style={{ listStyle: "none", padding: 0 }}>
                                    <li style={{ marginBottom: "8px" }}>{formData.idProof ? "✓" : "☐"} Aadhaar Card Verification</li>
                                    <li style={{ marginBottom: "8px" }}>{formData.addressProof ? "✓" : "☐"} PAN Card Verification</li>
                                    <li style={{ marginBottom: "8px" }}>{formData.educationProof ? "✓" : "☐"} Educational Certificates Collected</li>
                                    <li style={{ marginBottom: "8px" }}>{formData.bgVerification ? "✓" : "☐"} Background Verification Status</li>
                                </ul>
                            </div>

                            <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <p>Prepared By,</p>
                                    <div style={{ height: "40px" }}></div>
                                    <p>__________________________<br /><strong>HR Department</strong><br />Viral Ads Media</p>
                                </div>
                             
                            </div>

                            <div style={{ position: "absolute", bottom: "15mm", left: 0, right: 0, textAlign: "center", fontSize: "10.5px", color: "#777" }}>
                                <div style={{ borderTop: "1px solid #eee", width: "90%", margin: "0 auto 8px auto" }}></div>
                                <strong>Viral Ads Media | Digital Creative Agency</strong><br />
                                B-27, Budh Vihar Phase 1, New Delhi-86 | Tel: 9354491934
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Onboarding;
