import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const SalarySlip = () => {
  const [data, setData] = useState({
    name: "",
    designation: "",
    month: "",
    basic: "",
    allowance: "",
    bonus: "",
    pf: "",
    totalWorkingDay: "",
    totalLeaveDays: "",
    otherDeduction: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Total Earnings
  const totalEarnings =
    Number(data.basic || 0) +
    Number(data.allowance || 0) +
    Number(data.bonus || 0);

  // Per Day Salary FIXED (Divide by 30)
  const perDaySalary = totalEarnings / 30;

  // Leave Deduction = (Salary / 30) × Leave Days
  const leaveDeduction =
    perDaySalary * Number(data.totalLeaveDays || 0);

  // Total Deductions
  const totalDeductions =
    Number(data.pf || 0) +
    leaveDeduction +
    Number(data.otherDeduction || 0);

  const netSalary = totalEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 p-10">
        <div className="print:hidden">
          <h1 className="text-3xl font-bold mb-6">
            Salary Slip Generator
          </h1>

          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Salary Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input name="name" placeholder="Employee Name" className="border p-3 rounded-lg" onChange={handleChange} />
              <input name="designation" placeholder="Designation" className="border p-3 rounded-lg" onChange={handleChange} />
              <input name="month" placeholder="Salary Month" className="border p-3 rounded-lg" onChange={handleChange} />

              <input type="number" name="basic" placeholder="Basic Salary" className="border p-3 rounded-lg" onChange={handleChange} />
              <input type="number" name="allowance" placeholder="Other Allowances" className="border p-3 rounded-lg" onChange={handleChange} />
              <input type="number" name="bonus" placeholder="Bonus" className="border p-3 rounded-lg" onChange={handleChange} />

              <input type="number" name="totalWorkingDay" placeholder="Total Working Days (Optional)" className="border p-3 rounded-lg" onChange={handleChange} />
              <input type="number" name="totalLeaveDays" placeholder="Total Leave Days" className="border p-3 rounded-lg" onChange={handleChange} />

              <input type="number" name="pf" placeholder="PF Deduction" className="border p-3 rounded-lg" onChange={handleChange} />
              <input type="number" name="otherDeduction" placeholder="Other Deductions" className="border p-3 rounded-lg" onChange={handleChange} />
            </div>

            <button
              onClick={handlePrint}
              className="mt-6 bg-orange-500 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
            >
              Print Salary Slip
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="bg-white p-10 rounded-xl shadow-md print:shadow-none print:p-0 print:max-w-full print:mx-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Viral Ads Media</h2>
            <p className="text-gray-500">Salary Slip</p>
          </div>

          <p><strong>Employee Name:</strong> {data.name || "Employee Name"}</p>
          <p><strong>Designation:</strong> {data.designation || "Designation"}</p>
          <p><strong>Month:</strong> {data.month || "Month"}</p>

          <div className="mt-6 grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Earnings</h3>

              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>₹ {data.basic || 0}</span>
              </div>

              <div className="flex justify-between">
                <span>Allowances</span>
                <span>₹ {data.allowance || 0}</span>
              </div>

              <div className="flex justify-between">
                <span>Bonus</span>
                <span>₹ {data.bonus || 0}</span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between font-semibold">
                <span>Total Earnings</span>
                <span>₹ {totalEarnings.toFixed(2)}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Deductions</h3>

              <div className="flex justify-between">
                <span>PF</span>
                <span>₹ {data.pf || 0}</span>
              </div>

              <div className="flex justify-between">
                <span>Leave Deduction</span>
                <span>₹ {leaveDeduction.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Other Deductions</span>
                <span>₹ {data.otherDeduction || 0}</span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between font-semibold text-red-500">
                <span>Total Deductions</span>
                <span>₹ {totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-4 flex justify-between font-bold text-lg">
            <span>Net Salary</span>
            <span className="text-green-600">
              ₹ {netSalary.toFixed(2)}
            </span>
          </div>

          <div className="mt-12">
            <p>Authorized By</p>
            <br /><br />
            <p className="font-semibold">HR Department</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySlip;