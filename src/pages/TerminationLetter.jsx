import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const TerminationLetter = () => {
  const today = new Date().toLocaleDateString("en-IN");

  const [formData, setFormData] = useState({
    name: "",
    lastWorkingDate: "",
    reason: "",
  });

  const [generatedData, setGeneratedData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    setGeneratedData(formData);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      
      {/* ❌ Hide Sidebar in Print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 p-10">
        
        {/* ❌ Hide Header in Print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-3xl font-bold text-slate-800">
            Termination Letter Generator
          </h1>

          <button
            onClick={() => window.print()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
          >
            Print Letter
          </button>
        </div>

        {/* ❌ Hide Form Section in Print */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-8 rounded-2xl shadow-xl mb-10 print:hidden">
          <h2 className="text-xl font-semibold mb-6 text-slate-700">
            Employee Details
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            <input
              type="text"
              name="name"
              placeholder="Employee Name"
              value={formData.name}
              onChange={handleChange}
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition"
            />

            <input
              type="date"
              name="lastWorkingDate"
              value={formData.lastWorkingDate}
              onChange={handleChange}
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition"
            />

            <input
              type="text"
              name="reason"
              placeholder="Reason (Optional)"
              value={formData.reason}
              onChange={handleChange}
              className="p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none transition"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="mt-8 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
          >
            Generate Letter
          </button>
        </div>

        {/* ✅ Only This Section Will Print */}
        {generatedData && (
          <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-4xl mx-auto print:shadow-none print:p-0 print:max-w-full print:mx-0">

            <div className="text-center border-b pb-6 mb-8">
              <h2 className="text-3xl font-bold tracking-wide text-slate-800">
                Viral Ads Media
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Corporate Office – Delhi | hr@viraladsmedia.com
              </p>
            </div>

            <p className="text-right mb-6 text-slate-600">
              Date: {today}
            </p>

            <p className="mb-6">
              To,<br />
              <span className="font-semibold text-slate-800">
                {generatedData.name}
              </span>
            </p>

            <p className="font-semibold mb-6 text-slate-700">
              Subject: Termination of Employment
            </p>

            <p className="mb-6 text-slate-700 leading-relaxed">
              Dear {generatedData.name},
            </p>

            <p className="mb-6 text-slate-700 leading-relaxed">
              This letter is to formally inform you that your employment with 
              <span className="font-semibold"> Viral Ads Media </span>
              will end effective 
              <span className="font-semibold">
                {" "}{generatedData.lastWorkingDate}
              </span>.
            </p>

            <p className="mb-6 text-slate-700 leading-relaxed">
              {generatedData.reason
                ? `This decision has been made due to ${generatedData.reason}.`
                : "This decision has been made after careful consideration of company policies and requirements."}
            </p>

            <p className="mb-6 text-slate-700 leading-relaxed">
              Your final settlement will include all outstanding salary,
              applicable leave encashment, and other dues as per company policy.
            </p>

            <p className="mb-10 text-slate-700 leading-relaxed">
              We appreciate your contributions and wish you success in your
              future endeavors.
            </p>

            <div className="mt-16">
              <p className="font-semibold text-slate-800">
                For Viral Ads Media
              </p>
              <div className="h-16"></div>
              <p className="font-semibold">HR Manager</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminationLetter;