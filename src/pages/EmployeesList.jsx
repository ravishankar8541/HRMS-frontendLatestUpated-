import EmployeeDirectory from '../components/EmployeeDirectory';
import EmployeeDialog from '../components/EmployeeDialog';
import { getServerBase } from "../utils/serverBase";
import api from "../../services/api";
import PrivateImage from "../components/PrivateImage";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const DESIGNATION_OPTIONS = [
  "Sales",
  "Frontend Developer",
  "Full Stack Developer",
  "Intern (Graphics Designer)",
  "Intern (Developer)",
  "Social Media Manager",
  "SEO Executive",
  "Graphics Designer",
  "Shopify Developer",
  "Ads Manager",
  "Accountant",
  "HR",
  "Relationship Manager",
  "Telecaller",
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const MARITAL_OPTIONS = ["Single", "Married"];
const CONTACT_RELATION_OPTIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Son",
  "Daughter",
  "Friend",
  "Colleague",
  "Relative",
  "Guardian",
  "Other",
];

function CustomDropdown({ name, value, onChange, options, placeholder }) {
  const values = [...new Set([...(value ? [value] : []), ...options])];
  return <select id={name} name={name} value={value || ''} onChange={onChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
    <option value="">{placeholder}</option>
    {values.map(option => <option key={option} value={option}>{option}</option>)}
  </select>;
}

const EmployeesList = () => {
  const location = useLocation();
  const openedVaultRecord = useRef(null);
  const { employees, updateEmployee, deleteEmployee, loading } = useEmployee();


  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  const [editId, setEditId] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const formatLabel = (text) =>
    text
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles?.[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: selectedFiles[0],
      }));
      setForm((prev) => ({
        ...prev,
        [name]: selectedFiles[0].name,
      }));
    }
  };

  const handleEdit = (emp) => {
    setError(null);
    setForm({
      name: emp.name || "",
      email: emp.email || "",
      designation: emp.designation || "",
      salary: emp.salary ?? "",
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
      dateOfExit: emp.dateOfExit ? emp.dateOfExit.split("T")[0] : "",
      dob: emp.dob ? emp.dob.split("T")[0] : "",
      gender: emp.gender || "",
      address: emp.address || "",
      phoneNumber: emp.phoneNumber || "",
      fatherName: emp.fatherName || "",
      emergencyContactNumber: emp.emergencyContactNumber || "",
      contactRelation: emp.contactRelation || "",
      bankName: emp.bankName || "",
      accountNumber: emp.accountNumber || "",
      ifscCode: emp.ifscCode || "",
      maritalStatus: emp.maritalStatus || "",
      adharNumber: emp.adharNumber || "",
      panNumber: emp.panNumber || "",
      photo: emp.photo || "",
      adharCardDoc: emp.adharCardDoc || "",
      panCardDoc: emp.panCardDoc || "",
      educationProof: emp.educationProof || "",
      experienceLetter: emp.experienceLetter || "",
    });
    setFiles({});
    setEditId(emp._id);
  };

  useEffect(() => {
    const record = location.state?.vaultDocument;
    if (record && openedVaultRecord.current !== record._id) {
      openedVaultRecord.current = record._id;
      handleEdit(record);
    }
  }, [location.state]);

  const handleUpdate = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name?.trim() || !form.email?.trim() || !form.designation?.trim()) {
        throw new Error("Name, Email and Designation are required fields");
      }

      const formData = new FormData();

      const textFields = [
        "name", "email", "designation", "salary", "dateOfJoining", "dateOfExit",
        "dob", "gender", "address", "phoneNumber", "fatherName",
        "emergencyContactNumber", "contactRelation", "bankName",
        "accountNumber", "ifscCode", "maritalStatus", "adharNumber", "panNumber"
      ];

      textFields.forEach((key) => {
        if (form[key] !== "" && form[key] !== null && form[key] !== undefined) {
          if (key === "salary") {
            formData.append(key, Number(form[key]));
          } else {
            formData.append(key, form[key]);
          }
        }
      });

      if (files.photo)              formData.append("photo", files.photo);
      if (files.adharCardDoc)       formData.append("adharCardDoc", files.adharCardDoc);
      if (files.panCardDoc)         formData.append("panCardDoc", files.panCardDoc);
      if (files.educationProof)     formData.append("educationProof", files.educationProof);
      if (files.experienceLetter)   formData.append("experienceLetter", files.experienceLetter);

      await updateEmployee(editId, formData);

      setEditId(null);
      setForm({});
      setFiles({});
    } catch (err) {
      setError(err.message || "Failed to update employee record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (submitting) return;
    setEditId(null);
    setForm({});
    setFiles({});
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this employee?")) return;
    try {
      await deleteEmployee(id);
      return true;
    } catch (err) {
      alert(err.message || "Failed to delete employee");
      return false;
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    const normalizedPath = photoPath.replace(/\\/g, '/');
    const filename = normalizedPath.split('/').pop() || "";
    const baseUrl = getServerBase();
    return `${baseUrl}/uploads/${filename}`;
  };

  const inputClass = `
    block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 
    text-sm text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 
    outline-none transition-all placeholder:text-gray-400
  `;

  const btnPrimary = `
    px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white 
    font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200
  `;

  const renderEditField = (field, type = "text") => {
    if (field === "gender") {
      return (
        <CustomDropdown
          name="gender"
          value={form.gender}
          onChange={handleChange}
          options={GENDER_OPTIONS}
          placeholder="Select Gender"
        />
      );
    }

    if (field === "maritalStatus") {
      return (
        <CustomDropdown
          name="maritalStatus"
          value={form.maritalStatus}
          onChange={handleChange}
          options={MARITAL_OPTIONS}
          placeholder="Select Marital Status"
        />
      );
    }

    if (field === "designation") {
      return (
        <CustomDropdown
          name="designation"
          value={form.designation}
          onChange={handleChange}
          options={DESIGNATION_OPTIONS}
          placeholder="Select Designation"
        />
      );
    }

    if (field === "contactRelation") {
      return (
        <CustomDropdown
          name="contactRelation"
          value={form.contactRelation}
          onChange={handleChange}
          options={CONTACT_RELATION_OPTIONS}
          placeholder="Select Relation"
        />
      );
    }

    if (type === "date") {
      return (
        <input
          type="date"
          id={field}
          name={field}
          value={form[field] ?? ""}
          onChange={handleChange}
          className={inputClass}
        />
      );
    }

    if (field === "salary") {
      return (
        <input
          type="number"
          id={field}
          name={field}
          value={form[field] ?? ""}
          onChange={handleChange}
          min="0"
          step="1"
          className={inputClass}
        />
      );
    }

    return (
      <input
        type={type}
        id={field}
        name={field}
        value={form[field] ?? ""}
        onChange={handleChange}
        className={inputClass}
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6f8] text-slate-800">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8">
        <EmployeeDirectory employees={employees} loading={loading} onView={setViewEmployee} onEdit={handleEdit} onDelete={handleDelete} getPhotoUrl={getPhotoUrl} />

        {/* VIEW DETAILS MODAL */}
        {viewEmployee && (
          <EmployeeDialog label="Employee profile" onClose={() => setViewEmployee(null)}>
              <div className="px-5 sm:px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#101b30]">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-orange-700 text-lg">
                    {viewEmployee.photo ? (
                      <PrivateImage
                        src={getPhotoUrl(viewEmployee.photo)}
                        alt={viewEmployee.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      viewEmployee.name?.charAt(0)?.toUpperCase() || "E"
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{viewEmployee.name || "—"}</h2>
                    <p className="mt-1 text-xs text-orange-300 font-medium">{viewEmployee.designation || "Not Assigned"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewEmployee(null)}
                  aria-label="Close employee profile" className="rounded-lg px-2 text-2xl font-light text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto min-h-0 flex-1 space-y-6 text-sm break-words">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Personal & Employment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 block text-xs">Full Name</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Father's Name</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.fatherName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Email</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Phone Number</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.phoneNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Designation</span>
                      <span className="font-semibold text-orange-600">{viewEmployee.designation || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Monthly Salary</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.salary ? `₹${Number(viewEmployee.salary).toLocaleString()}` : "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Date of Joining</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.dateOfJoining ? new Date(viewEmployee.dateOfJoining).toLocaleDateString("en-IN") : "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Date of Exit</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.dateOfExit ? new Date(viewEmployee.dateOfExit).toLocaleDateString("en-IN") : "Active / Present"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Date of Birth (DOB)</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.dob ? new Date(viewEmployee.dob).toLocaleDateString("en-IN") : "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Gender</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.gender || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Marital Status</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.maritalStatus || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Onboarding Status</span>
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${viewEmployee.onboardingStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {viewEmployee.onboardingStatus || "Pending"}
                      </span>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <span className="text-gray-500 block text-xs">Full Address</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.address || "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 block text-xs">Emergency Phone</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.emergencyContactNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Relationship</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.contactRelation || "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Bank & Identity Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 block text-xs">Bank Name</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.bankName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Account Number</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.accountNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">IFSC Code</span>
                      <span className="font-semibold text-gray-800 uppercase">{viewEmployee.ifscCode || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">PAN Card Number</span>
                      <span className="font-semibold text-gray-800 uppercase">{viewEmployee.panNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Aadhaar Number</span>
                      <span className="font-semibold text-gray-800">{viewEmployee.adharNumber || "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Uploaded Documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { label: "Profile Photo", file: viewEmployee.photo },
                      { label: "Aadhaar Card", file: viewEmployee.adharCardDoc },
                      { label: "PAN Card", file: viewEmployee.panCardDoc },
                      { label: "Education Proof", file: viewEmployee.educationProof },
                      { label: "Experience Letter", file: viewEmployee.experienceLetter },
                    ].map((doc, idx) => (
                      <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
                        <div className="truncate mr-2">
                          <span className="text-xs font-semibold text-gray-700 block">{doc.label}</span>
                          <span className="text-[11px] text-gray-400 truncate block">
                            {doc.file ? doc.file.split("/").pop() : "Not Uploaded"}
                          </span>
                        </div>
                        {doc.file ? (
                          <a
                            href={getPhotoUrl(doc.file)}
                            onClick={async event => {
                              if (!getPhotoUrl(doc.file).includes('/uploads/')) return;
                              event.preventDefault();
                              try { const response=await api.get(getPhotoUrl(doc.file),{responseType:'blob'}); const url=URL.createObjectURL(response.data); const link=document.createElement('a');link.href=url;link.download=doc.label;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); } catch { alert('Unable to download file'); }
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded text-xs font-semibold shrink-0"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic shrink-0">N/A</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    const emp = viewEmployee;
                    setViewEmployee(null);
                    handleEdit(emp);
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
                >
                  Edit Employee
                </button>
                <button
                  onClick={() => setViewEmployee(null)}
                  className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </EmployeeDialog>
        )}

        {/* Edit Modal */}
        {editId && (
          <EmployeeDialog label="Edit employee" onClose={handleCancelEdit} busy={submitting} wide>
              <div className="px-5 sm:px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#101b30]">
                <div>
                  <h2 className="text-xl font-semibold text-white">Edit Employee</h2>
                  <p className="text-xs text-slate-400 mt-1">Update profile, employment details and documents</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  disabled={submitting} aria-label="Close employee editor" className="rounded-lg px-3 text-2xl font-light text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto min-h-0 flex-1 bg-white">
                {error && (
                  <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: "name", type: "text" },
                    { key: "email", type: "email" },
                    { key: "designation" },
                    { key: "salary", type: "number" },
                    { key: "dob", type: "date" },
                    { key: "dateOfJoining", type: "date" },
                    { key: "dateOfExit", type: "date" },
                    { key: "gender" },
                    { key: "address", type: "text" },
                    { key: "phoneNumber", type: "tel" },
                    { key: "fatherName", type: "text" },
                    { key: "emergencyContactNumber", type: "tel" },
                    { key: "contactRelation" },
                    { key: "bankName", type: "text" },
                    { key: "accountNumber", type: "text" },
                    { key: "ifscCode", type: "text" },
                    { key: "maritalStatus" },
                    { key: "adharNumber", type: "text" },
                    { key: "panNumber", type: "text" },
                  ].map(({ key, type }) => (
                    <div key={key} className="space-y-1.5">
                      <label htmlFor={key} className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {formatLabel(key)}
                      </label>
                      {renderEditField(key, type)}
                    </div>
                  ))}

                  {[
                    { key: "photo", label: "Profile Photo", accept: "image/*" },
                    { key: "adharCardDoc", label: "Aadhaar Card", accept: ".pdf,image/*" },
                    { key: "panCardDoc", label: "PAN Card", accept: ".pdf,image/*" },
                    { key: "educationProof", label: "Education Proof", accept: ".pdf" },
                    { key: "experienceLetter", label: "Experience Letter", accept: ".pdf" },
                  ].map(({ key, label, accept }) => (
                    <div key={key} className="space-y-1.5">
                      <label htmlFor={key} className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {label}
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="file"
                          id={key}
                          name={key}
                          accept={accept}
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-lg file:border-0
                                     file:text-sm file:font-semibold
                                     file:bg-orange-50 file:text-orange-700
                                     hover:file:bg-orange-100 cursor-pointer"
                        />
                        {form[key] && (
                          <p className="text-xs text-gray-500 truncate">
                            {files[key]
                              ? `New: ${form[key]}`
                              : `Current: ${form[key].split('/').pop() || form[key]}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={handleCancelEdit}
                  disabled={submitting} className="text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={submitting}
                  className={`${btnPrimary} min-w-[140px] ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </EmployeeDialog>
        )}
      </main>
    </div>
  );
};

export default EmployeesList;
