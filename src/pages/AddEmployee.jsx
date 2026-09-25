// src/pages/AddEmployee.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
  "Branch Manager Sales", 
  "Territory Manager Sales"
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const MARITAL_OPTIONS = ["Single", "Married"];

// New: Dropdown options for Contact Relation (customize as needed)
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

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  designation: "",
  salary: "",
  dateOfJoining: "",
  dob: "",
  gender: "",
  address: "",
  phoneNumber: "",
  fatherName: "",
  emergencyContactNumber: "",
  contactRelation: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  maritalStatus: "",
  adharNumber: "",
  panNumber: "",
};

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

export default function AddEmployee() {
  const { addEmployee, loading } = useEmployee();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatLabel = (text) =>
    text
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name?.trim() || !form.email?.trim() || !form.designation) {
        throw new Error("Name, Email and Designation are required fields.");
      }

      const payload = { ...form };

      // Convert salary to number if provided
      if (payload.salary) {
        payload.salary = Number(payload.salary);
      }

      // Remove empty / null values before sending
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      await addEmployee(payload);
      alert("Employee added successfully!");
      navigate("/employees");
    } catch (err) {
      setError(err.message || "Failed to add employee. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm " +
    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 " +
    "focus:outline-none transition-all shadow-sm";

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const requiredMark = <span className="text-red-600 ml-1">*</span>;

  const renderField = (field) => {
    const label = formatLabel(field);

    // Date fields
    if (["dob", "dateOfJoining"].includes(field)) {
      return (
        <input
          type="date"
          name={field}
          value={form[field] || ""}
          onChange={handleChange}
          className={inputClass}
        />
      );
    }

    // Salary (number)
    if (field === "salary") {
      return (
        <input
          type="number"
          name="salary"
          value={form.salary ?? ""}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="₹ 0"
          className={inputClass}
        />
      );
    }

    // Dropdowns
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

    // Contact Relation - now using dropdown
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

    // Default text input
    return (
      <input
        type="text"
        name={field}
        value={form[field] ?? ""}
        onChange={handleChange}
        placeholder={`Enter ${label}`}
        className={inputClass}
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Employee</h1>
        <p className="text-gray-600 mb-8">Enter employee details below</p>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 lg:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-8">
            {Object.keys(INITIAL_FORM_STATE).map((field) => (
              <div key={field} className="space-y-1.5">
                <label className={labelClass}>
                  {formatLabel(field)}
                  {requiredMark}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className={`
                px-8 py-2.5 min-w-[160px] font-medium rounded-lg text-white shadow-sm transition-all
                bg-orange-600 hover:bg-orange-700 disabled:opacity-60 cursor-not-allowed
              `}
            >
              {submitting || loading ? "Saving..." : "Add Employee"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}