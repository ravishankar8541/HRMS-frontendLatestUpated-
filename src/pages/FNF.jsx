import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const FNF = () => {
  const [data, setData] = useState({
    name: "",
    lastWorkingDay: "",
    pendingSalary: "",
    leaveEncashment: "",
    bonus: "",
    deductions: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const totalAmount =
    Number(data.pendingSalary || 0) +
    Number(data.leaveEncashment || 0) +
    Number(data.bonus || 0) -
    Number(data.deductions || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex bg-orange-50 min-h-screen">

      {/* Hide Sidebar in Print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 p-10">

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6 text-orange-700 print:hidden">
          Full & Final Settlement (FNF)
        </h1>

        {/* FORM SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 print:hidden border border-orange-100">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            Employee Settlement Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Employee Name"
              className="border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none"
              onChange={handleChange}
            />
            <input
              name="lastWorkingDay"
              type="date"
              className="border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none"
              onChange={handleChange}
            />
            <input
              name="pendingSalary"
              placeholder="Pending Salary"
              className="border border-orange-200 p-3 rounded-lg"
              onChange={handleChange}
            />
            <input
              name="leaveEncashment"
              placeholder="Leave Encashment"
              className="border border-orange-200 p-3 rounded-lg"
              onChange={handleChange}
            />
            <input
              name="bonus"
              placeholder="Bonus / Incentive"
              className="border border-orange-200 p-3 rounded-lg"
              onChange={handleChange}
            />
            <input
              name="deductions"
              placeholder="Deductions"
              className="border border-orange-200 p-3 rounded-lg"
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handlePrint}
            className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl shadow-md transition-all"
          >
            Print FNF Statement
          </button>
        </div>

        {/* PRINTABLE AREA */}
        <div
          className="
            bg-white
            print:w-[210mm]
            print:max-w-[210mm]
            print:mx-auto
            print:p-8
            print:text-[14px]
          "
        >
          {/* Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h2 className="text-3xl font-bold text-orange-700 tracking-wide">
              VIRAL ADS MEDIA
            </h2>
            <p className="text-gray-600">
              Full & Final Settlement Statement
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>

          {/* Employee Info */}
          <div className="mb-6">
            <p>
              <strong>Employee Name:</strong>{" "}
              {data.name || "Employee Name"}
            </p>
            <p>
              <strong>Last Working Day:</strong>{" "}
              {data.lastWorkingDay || "N/A"}
            </p>
          </div>

          {/* Settlement Table */}
          <div className="border border-orange-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-orange-100">
                <tr>
                  <th className="p-3 text-left">Particulars</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Pending Salary</td>
                  <td className="p-3 text-right">
                    {data.pendingSalary || 0}
                  </td>
                </tr>

                <tr className="border-t">
                  <td className="p-3">Leave Encashment</td>
                  <td className="p-3 text-right">
                    {data.leaveEncashment || 0}
                  </td>
                </tr>

                <tr className="border-t">
                  <td className="p-3">Bonus / Incentive</td>
                  <td className="p-3 text-right">
                    {data.bonus || 0}
                  </td>
                </tr>

                <tr className="border-t text-red-600">
                  <td className="p-3">Deductions</td>
                  <td className="p-3 text-right">
                    - {data.deductions || 0}
                  </td>
                </tr>

                <tr className="border-t bg-orange-50 font-bold text-lg">
                  <td className="p-3">Net Payable Amount</td>
                  <td className="p-3 text-right text-orange-700">
                    ₹ {totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration */}
          <div className="mt-8 text-sm text-gray-600">
            This statement confirms that the above-mentioned amount is
            payable to the employee as part of Full & Final Settlement.
          </div>

          {/* Signature */}
          <div className="flex justify-between mt-16">
            <div>
              <p className="mb-10">Employee Signature</p>
              <div className="border-t border-gray-400 w-48"></div>
            </div>

            <div className="text-right">
              <p className="mb-10">Authorized Signatory</p>
              <div className="border-t border-gray-400 w-48 ml-auto"></div>
              <p className="mt-2 font-semibold">HR Department</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FNF;