import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

// Dropdown options (same as AddEmployee for consistency)
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
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        className="w-full px-4 py-2.5 text-left text-sm rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all flex items-center justify-between"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === option
                  ? "bg-orange-100 text-orange-800 font-medium"
                  : "hover:bg-orange-50 hover:text-orange-700"
              }`}
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

const EmployeesList = () => {
  const { employees, updateEmployee, deleteEmployee, fetchEmployees, loading } = useEmployee();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});           // new files selected by user
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [openMoreMenu, setOpenMoreMenu] = useState(null);

  const menuRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMoreMenu(null);
      }
    };
    if (openMoreMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMoreMenu]);

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
      // Show selected filename in form (visual feedback only)
      setForm((prev) => ({
        ...prev,
        [name]: selectedFiles[0].name,
      }));
    }
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name || "",
      email: emp.email || "",
      designation: emp.designation || "",
      salary: emp.salary || "",
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

  const handleUpdate = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name?.trim() || !form.email?.trim() || !form.designation?.trim()) {
        throw new Error("Name, Email and Designation are required fields");
      }

      const formData = new FormData();

      // Append all text / number / date fields (skip file fields)
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

      // Append new files only if user selected something new
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
    setEditId(null);
    setForm({});
    setFiles({});
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this employee?")) return;
    try {
      await deleteEmployee(id);
    } catch (err) {
      alert(err.message || "Failed to delete employee");
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    const normalizedPath = photoPath.replace(/\\/g, '/');
    const filename = normalizedPath.split('/').pop() || "";
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}/uploads/${filename}`;
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.name || ""} ${emp.email || ""} ${emp.designation || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
    // Dropdown fields
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

    // Date fields
    if (type === "date") {
      return (
        <input
          type="date"
          name={field}
          value={form[field] ?? ""}
          onChange={handleChange}
          className={inputClass}
        />
      );
    }

    // Number fields (salary)
    if (field === "salary") {
      return (
        <input
          type="number"
          name={field}
          value={form[field] ?? ""}
          onChange={handleChange}
          min="0"
          step="1"
          className={inputClass}
        />
      );
    }

    // Default text input
    return (
      <input
        type={type}
        name={field}
        value={form[field] ?? ""}
        onChange={handleChange}
        className={inputClass}
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 xl:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <div className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-1">
              Employee Management
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          </div>

          <Link
            to="/employees/add"
            className={`${btnPrimary} flex items-center gap-2 shadow-sm`}
          >
            <span className="text-lg font-bold">+</span>
            Add Employee
          </Link>
        </div>

        {/* Edit Modal */}
        {editId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
                  <p className="text-sm text-gray-500 mt-0.5">ID: {editId}</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-light px-3"
                >
                  ×
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 bg-white">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: "name", type: "text" },
                    { key: "email", type: "email" },
                    { key: "designation" }, // dropdown
                    { key: "salary", type: "number" },
                    { key: "dob", type: "date" },
                    { key: "dateOfJoining", type: "date" },
                    { key: "dateOfExit", type: "date" },
                    { key: "gender" }, // dropdown
                    { key: "address", type: "text" },
                    { key: "phoneNumber", type: "tel" },
                    { key: "fatherName", type: "text" },
                    { key: "emergencyContactNumber", type: "tel" },
                    { key: "contactRelation" }, // dropdown
                    { key: "bankName", type: "text" },
                    { key: "accountNumber", type: "text" },
                    { key: "ifscCode", type: "text" },
                    { key: "maritalStatus" }, // dropdown
                    { key: "adharNumber", type: "text" },
                    { key: "panNumber", type: "text" },
                  ].map(({ key, type }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {formatLabel(key)}
                      </label>
                      {renderEditField(key, type)}
                    </div>
                  ))}

                  {/* File upload fields */}
                  {[
                    { key: "photo", label: "Profile Photo", accept: "image/*" },
                    { key: "adharCardDoc", label: "Aadhaar Card", accept: ".pdf,image/*" },
                    { key: "panCardDoc", label: "PAN Card", accept: ".pdf,image/*" },
                    { key: "educationProof", label: "Education Proof", accept: ".pdf" },
                    { key: "experienceLetter", label: "Experience Letter", accept: ".pdf" },
                  ].map(({ key, label, accept }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {label}
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="file"
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
                  className="text-gray-600 hover:text-gray-900 font-medium"
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
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search by name, email or designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
              <p>Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg">No employees found</p>
              <p className="text-sm mt-2">Try adjusting your search or add a new employee.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Designation
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Salary
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative">
                            {emp.photo && (
                              <img
                                src={getPhotoUrl(emp.photo)}
                                alt={emp.name || "Employee"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const fallback = e.target.parentElement.querySelector(".avatar-fallback");
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            )}
                            <div
                              className={`
                                avatar-fallback
                                absolute inset-0 flex items-center justify-center 
                                font-semibold text-lg text-orange-700 bg-orange-100
                                ${emp.photo ? "hidden" : "flex"}
                              `}
                            >
                              {emp.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          </div>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{emp.name || "—"}</div>
                            <div className="text-sm text-gray-500">{emp.email || "—"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          {emp.designation || "Not assigned"}
                        </span>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                        {emp.salary ? `₹${Number(emp.salary).toLocaleString()}` : "—"}
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString("en-IN") : "—"}
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/onboarding?employeeId=${emp._id}`}
                            className="text-orange-600 hover:text-orange-800 font-medium"
                          >
                            Onboard
                          </Link>

                          <button
                            onClick={() => handleEdit(emp)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMoreMenu(openMoreMenu === emp._id ? null : emp._id);
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>

                            {openMoreMenu === emp._id && (
                              <div
                                ref={menuRef}
                                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100"
                              >
                                <div className="py-1">
                                  <Link
                                    to={`/salary?employeeId=${emp._id}`}
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Generate Salary Slip
                                  </Link>
                                  <Link
                                    to={`/termination?employeeId=${emp._id}`}
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Mark as Terminated
                                  </Link>
                                  <Link
                                    to={`/fnf?employeeId=${emp._id}`}
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    Full & Final Settlement
                                  </Link>
                                </div>
                                <div className="py-1">
                                  <button
                                    onClick={() => handleDelete(emp._id)}
                                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Delete Employee
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeesList;