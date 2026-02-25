import Sidebar from "../components/Sidebar";
import { Users, UserCheck, UserPlus, FileWarning } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-10">

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            HRMS Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Welcome back 👋 Here's your workforce overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <StatCard
            title="Total Employees"
            value="25"
            icon={<Users size={28} />}
            color="from-indigo-500 to-indigo-700"
          />

          <StatCard
            title="Active Employees"
            value="20"
            icon={<UserCheck size={28} />}
            color="from-green-500 to-green-700"
          />

          <StatCard
            title="Onboarding"
            value="3"
            icon={<UserPlus size={28} />}
            color="from-blue-500 to-blue-700"
          />

          <StatCard
            title="FNF Pending"
            value="2"
            icon={<FileWarning size={28} />}
            color="from-red-500 to-red-700"
          />

        </div>

        {/* Bottom Section */}
        <div className="mt-14 bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Quick Overview
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Manage employee onboarding, offer letters, salary slips,
            and full & final settlements efficiently through this HRMS system.
            Monitor workforce data in real-time with a secure and scalable platform.
          </p>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl blur opacity-30 group-hover:opacity-50 transition`}></div>

      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:-translate-y-2 transition duration-300">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {value}
            </h3>
          </div>

          <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white shadow-md`}>
            {icon}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;