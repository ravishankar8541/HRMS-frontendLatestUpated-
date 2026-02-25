import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

const designationOptions = [
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

const initialFormState = {
  name: "",
  email: "",
  designation: "",
  salary: "",
  dateOfJoining: "",
  dateOfExit: "",
  dob: "",
  gender: "",
  address: "",
  phoneNumber: "",
  fatherName: "",
  emergencyContactNumber: "",
  contactRelation: "",
  bankName: "",
  ifscCode: "",
  maritalStatus: "",
  adharNumber: "",
  panNumber: "",
};

const Employees = () => {
  const { employees, addEmployee, deleteEmployee, fetchEmployees } = useEmployee();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const formatLabel = (text) =>
    text
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.designation.trim()) {
      alert("Please fill required fields: Name, Email, Designation");
      return;
    }

    try {
      // Only send non-empty fields
      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, value]) => value !== "" && value != null)
      );

      if (payload.salary) payload.salary = Number(payload.salary); // Convert salary to number

      await addEmployee(payload); // Call context function

      setForm(initialFormState);
      setEditId(null);
    } catch (error) {
      console.error("Failed to add employee:", error);
      alert("Failed to add employee. Check console for details.");
    }
  };

  const handleEdit = (employee) => {
    setForm(employee);
    setEditId(employee._id || employee.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    deleteEmployee(id);
  };

  const filteredEmployees = employees?.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  const renderField = (field) => {
    if (["dob", "dateOfJoining", "dateOfExit"].includes(field)) {
      return (
        <input
          type="date"
          name={field}
          value={form[field]}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-orange-500"
        />
      );
    }

    if (field === "salary") {
      return (
        <input
          type="number"
          name="salary"
          value={form.salary}
          onChange={handleChange}
          placeholder="Enter Salary"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-orange-500"
        />
      );
    }

    if (field === "gender" || field === "maritalStatus") {
      const options = field === "gender" ? ["Male", "Female", "Other"] : ["Single", "Married"];
      return (
        <select
          name={field}
          value={form[field]}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-orange-500"
        >
          <option value="">Select {formatLabel(field)}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field === "designation") {
      return (
        <>
          <input
            list="designationList"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            placeholder="Type or select designation"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-orange-500"
          />
          <datalist id="designationList">
            {designationOptions.map((opt, i) => (
              <option key={i} value={opt} />
            ))}
          </datalist>
        </>
      );
    }

    return (
      <input
        type="text"
        name={field}
        value={form[field]}
        onChange={handleChange}
        placeholder={`Enter ${formatLabel(field)}`}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:ring-orange-500"
      />
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(initialFormState).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {formatLabel(field)}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg text-white ${
                editId ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {editId ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          placeholder="Search by name, email or designation..."
          className="mb-4 w-full md:w-1/3 border px-4 py-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Designation</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-left">Joining Date</th>
                <th className="px-4 py-3 text-left">Exit Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id || emp.id} className="border-t">
                    <td className="px-4 py-3">{emp.name}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.designation}</td>
                    <td className="px-4 py-3">₹ {emp.salary}</td>
                    <td className="px-4 py-3">{emp.dateOfJoining}</td>
                    <td className="px-4 py-3">{emp.dateOfExit || "-"}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id || emp.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;