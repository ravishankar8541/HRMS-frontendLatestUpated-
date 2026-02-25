import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";

const Onboarding = () => {
    const printRef = useRef();

    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        department: "",
        joiningDate: "",
        pan: "",
        bankAccount: "",
        ifsc: "",
        photo: null,
        idProof: null,
        addressProof: null,
        educationProof: null,
        experienceLetter: null,
        bgVerification: false,
    });

    const [errors, setErrors] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});

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
            setUploadStatus((prev) => ({ ...prev, [field]: "done" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.designation.trim()) newErrors.designation = "Designation is required";
        if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required";
        if (!formData.pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
            newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
        }
        if (!formData.idProof) newErrors.idProof = "ID Proof is required";
        if (!formData.addressProof) newErrors.addressProof = "Address Proof is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePrint = () => {
        if (!validateForm()) {
            alert("Please fill all required fields and upload mandatory documents.");
            return;
        }
        window.print();
    };

    const isCompleted =
        formData.idProof &&
        formData.addressProof &&
        formData.bgVerification;

    const getFileName = (file) => (file ? file.name : "Not uploaded");

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="print:hidden">
                <Sidebar />
            </div>

            <div className="flex-1 p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-10 print:hidden">
                    Employee Onboarding
                </h1>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden mb-12 print:hidden">
                    <div className="px-8 py-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                        <h2 className="text-2xl font-bold">Onboarding Details</h2>
                        <p className="text-orange-100 mt-1">Complete information & upload documents</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: "name", label: "Full Name", type: "text", required: true },
                                { name: "designation", label: "Designation", type: "text", required: true },
                                { name: "department", label: "Department", type: "text" },
                                { name: "joiningDate", label: "Date of Joining", type: "date", required: true },
                                { name: "pan", label: "PAN Number", type: "text", required: true, placeholder: "ABCDE1234F" },
                                { name: "bankAccount", label: "Bank Account Number", type: "text" },
                                { name: "ifsc", label: "IFSC Code", type: "text", placeholder: "SBIN0001234" },
                            ].map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors[field.name] ? "border-red-400" : "border-slate-200"
                                            } bg-white/60 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none transition-all`}
                                    />
                                    {errors[field.name] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                                    )}
                                </div>
                            ))}

                            {/* Photo Upload */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-slate-700">Employee Photo</label>
                                <div className="flex items-center gap-4">
                                    {formData.photo && (
                                        <img
                                            src={URL.createObjectURL(formData.photo)}
                                            alt="Preview"
                                            className="w-20 h-20 object-cover rounded-full border-2 border-orange-200"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, "photo")}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="mt-10">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Required Documents</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { field: "idProof", label: "ID Proof (Aadhaar / Passport / Voter ID)", accept: ".pdf,.jpg,.jpeg,.png" },
                                    { field: "addressProof", label: "Address Proof (Aadhaar / Utility Bill / Passport)", accept: ".pdf,.jpg,.jpeg,.png" },
                                    { field: "educationProof", label: "Educational Certificates", accept: ".pdf" },
                                    { field: "experienceLetter", label: "Experience / Relieving Letter (optional)", accept: ".pdf" },
                                ].map((doc) => (
                                    <div key={doc.field} className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            {doc.label}
                                            {(doc.field === "idProof" || doc.field === "addressProof") && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        <input
                                            type="file"
                                            accept={doc.accept}
                                            onChange={(e) => handleFileChange(e, doc.field)}
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                        />
                                        {formData[doc.field] && (
                                            <p className="text-sm text-green-600 mt-1">
                                                Uploaded: {formData[doc.field].name}
                                            </p>
                                        )}
                                        {errors[doc.field] && (
                                            <p className="text-red-500 text-sm">{errors[doc.field]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div className="mt-8 space-y-3">
                            <label className="flex items-center gap-3 text-slate-700">
                                <input
                                    type="checkbox"
                                    name="bgVerification"
                                    checked={formData.bgVerification}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                                />
                                Background Verification Completed
                            </label>
                        </div>

                        <button
                            onClick={handlePrint}
                            className="mt-10 w-full md:w-auto px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 transform hover:-translate-y-1 transition-all duration-300"
                        >
                            Generate & Print Onboarding Report
                        </button>
                    </div>
                </div>

               {/* Printable Report - SINGLE PAGE A4 */}
<div
  ref={printRef}
  className="
  bg-white
  print:w-[210mm]
  print:max-w-[210mm]
  print:min-h-[260mm]
  print:p-6
  print:mx-auto
  print:overflow-visible
  print:text-[13px]
"
>

  {/* Header */}
  <div className="text-center border-b pb-3 mb-4">
    <h2 className="text-2xl font-bold tracking-wide text-gray-800">
      VIRAL ADS MEDIA
    </h2>
    <p className="text-sm text-gray-600">
      Employee Onboarding Confirmation
    </p>
    <p className="text-[11px] text-gray-500">
      Date: {new Date().toLocaleDateString("en-IN")}
    </p>
  </div>

  {/* Top Section */}
  <div className="flex justify-between items-start mb-4">

    {/* Employee Details */}
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1">
      <p><strong>Name:</strong> {formData.name || "-"}</p>
      <p><strong>Designation:</strong> {formData.designation || "-"}</p>
      <p><strong>Department:</strong> {formData.department || "-"}</p>
      <p><strong>Joining Date:</strong> {formData.joiningDate || "-"}</p>
      <p><strong>PAN:</strong> {formData.pan || "-"}</p>
      <p><strong>Bank A/C:</strong> {formData.bankAccount || "-"}</p>
      <p><strong>IFSC:</strong> {formData.ifsc || "-"}</p>
    </div>

    {/* Photo */}
    {formData.photo && (
      <div className="ml-4">
        <img
          src={URL.createObjectURL(formData.photo)}
          alt="Employee"
          className="w-24 h-24 object-cover border border-gray-300"
        />
      </div>
    )}
  </div>

  {/* Document Table */}
  <div className="mb-4">
    <h3 className="font-semibold mb-2 border-b pb-1">
      Document Verification Status
    </h3>

    <table className="w-full border border-gray-300 text-[12px]">
      <tbody>
        {[
          { label: "ID Proof", value: formData.idProof ? "Submitted" : "Pending" },
          { label: "Address Proof", value: formData.addressProof ? "Submitted" : "Pending" },
          { label: "Educational Certificates", value: formData.educationProof ? "Submitted" : "Not Submitted" },
          { label: "Experience Letter", value: formData.experienceLetter ? "Submitted" : "Not Submitted" },
          { label: "Background Verification", value: formData.bgVerification ? "Completed" : "Pending" },
        ].map((item, index) => (
          <tr key={index}>
            <td className="border p-2 w-1/2">{item.label}</td>
            <td
              className={`border p-2 font-medium ${
                item.value === "Submitted" || item.value === "Completed"
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {item.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Status */}
  <div className="text-center my-4">
    <p className="text-lg font-bold">
      Status:
      <span
        className={`ml-2 ${
          isCompleted ? "text-green-700" : "text-orange-600"
        }`}
      >
        {isCompleted ? "COMPLETED" : "PENDING"}
      </span>
    </p>
  </div>

  {/* Declaration */}
  <div className="text-[12px] text-gray-600 mb-6">
    This document confirms completion of employee onboarding
    process as per HR compliance guidelines.
  </div>

  {/* Signatures */}
  <div className="flex justify-between mt-10">
    <div>
      <p className="mb-8">Employee Signature</p>
      <div className="border-t border-gray-400 w-40"></div>
    </div>

    <div className="text-right">
      <p className="mb-8">Authorized Signatory</p>
      <div className="border-t border-gray-400 w-40 ml-auto"></div>
      <p className="mt-1 font-semibold text-sm">HR Department</p>
    </div>
  </div>

</div>
            </div>
        </div>
    );
};

export default Onboarding;