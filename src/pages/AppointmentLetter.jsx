import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";

const AppointmentLetter = () => {
  const printRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    department: "",
    salary: "",
    joiningDate: "",
    manager: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      
      {/* Hide Sidebar in Print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold mb-8 text-slate-800 print:hidden">
          Appointment Letter Generator
        </h1>

        {/* ================= FORM SECTION ================= */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-10 print:hidden">
          <h2 className="text-xl font-semibold mb-6 text-slate-700">
            Employee Details
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="name"
              placeholder="Employee Name"
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="designation"
              placeholder="Designation"
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="department"
              placeholder="Department"
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="salary"
              placeholder="Salary (Monthly)"
              type="number"
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="joiningDate"
              type="date"
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="manager"
              placeholder="Reporting Manager"
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handlePrint}
            className="mt-8 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            Print Appointment Letter
          </button>
        </div>

        {/* ================= LETTER PREVIEW ================= */}
        <div
          ref={printRef}
          className="bg-white p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto print:shadow-none print:rounded-none print:p-10"
        >
          {/* Company Header */}
          <div className="text-center border-b pb-6 mb-8">
            <h2 className="text-3xl font-bold tracking-wide text-slate-800">
              Viral Ads Media
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Corporate Office – India | www.viraladsmedia.com
            </p>
          </div>

          <p className="mb-6 text-right text-slate-600">
            Date: {new Date().toLocaleDateString()}
          </p>

          <p className="mb-6">
            To, <br />
            <span className="font-semibold">
              {formData.name || "Employee Name"}
            </span>
          </p>

          <p className="mb-6 font-semibold">
            Subject: Appointment as {formData.designation || "Designation"}
          </p>

          <p className="mb-6">
            Dear {formData.name || "Employee"},
          </p>

          <p className="mb-6 leading-relaxed">
            We are pleased to appoint you as{" "}
            <span className="font-semibold">
              {formData.designation || "Designation"}
            </span>{" "}
            in the{" "}
            <span className="font-semibold">
              {formData.department || "Department"}
            </span>{" "}
            department with effect from{" "}
            <span className="font-semibold">
              {formData.joiningDate || "Joining Date"}
            </span>.
          </p>

          <p className="mb-6 leading-relaxed">
            Your monthly gross salary will be ₹
            <span className="font-semibold">
              {formData.salary
                ? Number(formData.salary).toLocaleString("en-IN")
                : "0"}
            </span>
            . You will report directly to{" "}
            <span className="font-semibold">
              {formData.manager || "Reporting Manager"}
            </span>.
          </p>

          <p className="mb-6 leading-relaxed">
            You will be on probation for a period of Two (2) months from the date
            of joining. Your employment shall be governed by the policies,
            rules, and regulations of the company.
          </p>

          <p className="mb-10 leading-relaxed">
            We welcome you to Viral Ads Media and wish you a successful career
            with us.
          </p>

          {/* Signature */}
          <div className="mt-16">
            <p className="font-semibold">For Viral Ads Media</p>
            <div className="h-16"></div>
            <p className="font-semibold">HR Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentLetter;