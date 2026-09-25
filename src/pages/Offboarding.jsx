import api from '../../services/api';
import { getApiUrl } from '../utils/serverBase';
import { useEmployee } from '../context/EmployeeContext';
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const Offboarding = () => {
  const {employees}=useEmployee();
  const [saving,setSaving]=useState(false);
  const [data, setData] = useState({
    employee: "",
    name: "",
    designation: "",
    lastWorkingDay: "",
    reason: "",
    laptopReturned: false,
    idCardReturned: false,
    clearanceApproved: false,
    exitInterview: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData({
      ...data,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const isCompleted =
    data.laptopReturned &&
    data.idCardReturned &&
    data.clearanceApproved;

  return (
    <div className="flex bg-slate-100 min-h-screen">

      {/* Hide Sidebar in Print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 p-10">

        {/* Hide Form in Print */}
        <div className="print:hidden">
          <h1 className="text-3xl font-bold mb-6">
            Employee Offboarding Process
          </h1>

          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Offboarding Details
            </h2>

            <select className="border p-3 rounded-lg w-full mb-4" value={data.employee} onChange={e=>{const emp=employees.find(v=>v._id===e.target.value);setData({...data,employee:e.target.value,name:emp?.name || '',designation:emp?.designation || ''});}}><option value="">Select employee</option>{employees.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                value={data.name}
                name="name"
                placeholder="Employee Name"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                value={data.designation}
                name="designation"
                placeholder="Designation"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="date"
                name="lastWorkingDay"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                name="reason"
                placeholder="Reason for Leaving"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="laptopReturned"
                  onChange={handleChange}
                />
                Laptop Returned
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="idCardReturned"
                  onChange={handleChange}
                />
                ID Card Returned
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="clearanceApproved"
                  onChange={handleChange}
                />
                Clearance Approved
              </label>
            </div>

            <textarea
              name="exitInterview"
              placeholder="Exit Interview Notes"
              className="border p-3 rounded-lg w-full mb-4"
              rows="3"
              onChange={handleChange}
            ></textarea>

            <button disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg mr-3" onClick={async()=>{if(!data.employee || !data.lastWorkingDay)return alert('Select an employee and last working day');setSaving(true);try{await api.post(getApiUrl()+'/offboarding',data);alert('Offboarding saved');}catch(e){alert(e.response?.data?.message || 'Save failed');}finally{setSaving(false);}}}>Save offboarding</button>
            <button
              onClick={handlePrint}
              className="bg-orange-500 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
            >
              Print Offboarding Report
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA ONLY */}
        <div className="bg-white p-10 rounded-xl shadow-md print:shadow-none print:p-0 print:max-w-full print:mx-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              Viral Ads Media
            </h2>
            <p className="text-gray-500">
              Employee Offboarding Report
            </p>
          </div>

          <p><strong>Name:</strong> {data.name || "Employee Name"}</p>
          <p><strong>Designation:</strong> {data.designation || "Designation"}</p>
          <p><strong>Last Working Day:</strong> {data.lastWorkingDay || "N/A"}</p>
          <p><strong>Reason:</strong> {data.reason || "N/A"}</p>

          <div className="mt-6 border rounded-lg p-6 space-y-2">
            <p>
              Laptop Returned:{" "}
              <span className={data.laptopReturned ? "text-green-600" : "text-red-500"}>
                {data.laptopReturned ? "Yes" : "No"}
              </span>
            </p>

            <p>
              ID Card Returned:{" "}
              <span className={data.idCardReturned ? "text-green-600" : "text-red-500"}>
                {data.idCardReturned ? "Yes" : "No"}
              </span>
            </p>

            <p>
              Clearance Approved:{" "}
              <span className={data.clearanceApproved ? "text-green-600" : "text-red-500"}>
                {data.clearanceApproved ? "Yes" : "No"}
              </span>
            </p>

            <hr />

            <p className="font-semibold">
              Final Status:{" "}
              <span className={isCompleted ? "text-green-600" : "text-yellow-500"}>
                {isCompleted ? "Process Completed" : "Pending Clearance"}
              </span>
            </p>
          </div>

          <div className="mt-6">
            <p><strong>Exit Interview Notes:</strong></p>
            <p className="mt-2 text-gray-700">
              {data.exitInterview || "No remarks provided."}
            </p>
          </div>

          <div className="mt-12">
            <p>Authorized By</p>
            <br />
            <br />
            <p className="font-semibold">HR Department</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Offboarding;