import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Receipt,
  FileWarning,
  Phone,
  Mail,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { employees, loading: isLoading, fetchEmployees } = useEmployee();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const totalEmployees = employees?.length ?? 0;
  const pendingOnboarding = employees?.filter(
    (e) => e.onboardingStatus !== "Completed"
  )?.length ?? 0;

  // Replace with real computed values later
  const pendingSalarySlips = 7;
  const pendingFnF = 2;

  const recentEmployees = employees?.slice(0, 6) ?? [];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-12 animate-fade-up opacity-0 [animation-delay:100ms] [animation-duration:800ms]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-2.5 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Dashboard
                </h1>
              </div>

              <Link
                to="/employees/add"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <UserPlus size={18} className="transition-transform group-hover:rotate-12" />
                Add Employee
              </Link>
            </div>
          </header>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              icon={Users}
              color="orange"
              loading={isLoading}
              onClick={() => navigate("/employees")}
              delay={200}
            />
            <StatCard
              title="Onboarding Pending"
              value={pendingOnboarding}
              icon={UserPlus}
              color="amber"
              attention={pendingOnboarding > 0}
              onClick={() => navigate("/onboarding")}
              delay={300}
            />
            <StatCard
              title="Salary Slips Pending"
              value={pendingSalarySlips}
              icon={Receipt}
              color="orange"
              attention={pendingSalarySlips > 0}
              onClick={() => navigate("/salary")}
              delay={400}
            />
            <StatCard
              title="F&F Pending"
              value={pendingFnF}
              icon={FileWarning}
              color="amber"
              attention={pendingFnF > 0}
              onClick={() => navigate("/fnf")}
              delay={500}
            />
          </div>

          {/* Recent Employees */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden animate-fade-up opacity-0 [animation-delay:600ms] [animation-duration:900ms]">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <Briefcase size={20} className="text-orange-600" />
                Recent Employees
              </h2>
              <Link
                to="/employees"
                className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
              >
                View All <ChevronRight size={16} />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Loading records...
                  </p>
                </div>
              </div>
            ) : recentEmployees.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-20 text-gray-500">
                <AlertCircle size={56} className="text-orange-400/70 animate-pulse" />
                <p className="text-xl font-medium">No employees found</p>
                <p className="text-sm">Add team members to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        Employee
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        Position
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        Salary
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        Joined
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentEmployees.map((emp, index) => (
                      <tr
                        key={emp._id}
                        className="group hover:bg-gray-50/80 transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${index * 80 + 700}ms` }}
                      >
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200/50 transition-transform duration-300 group-hover:scale-110">
                              {emp.photo ? (
                                <img
                                  src={getPhotoUrl(emp.photo)}
                                  alt={emp.name || ""}
                                  className="h-full w-full object-cover"
                                  onError={(e) => (e.target.src = "")}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-600 font-medium text-lg">
                                  {emp.name?.charAt(0) || "?"}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {emp.name || "—"}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                ID: #{emp._id?.slice(-6) || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              {emp.email || "—"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              {emp.phoneNumber || "—"}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-700">
                          {emp.designation || "Not Assigned"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-gray-900">
                          {emp.salary
                            ? `₹${Number(emp.salary).toLocaleString("en-IN")}`
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-600">
                          {emp.dateOfJoining
                            ? new Date(emp.dateOfJoining).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-300 group-hover:scale-105 ${
                              emp.onboardingStatus === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800 animate-pulse-slow"
                            }`}
                          >
                            <ShieldCheck size={14} />
                            {emp.onboardingStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  if (photoPath.startsWith("http")) return photoPath;
  const normalized = photoPath.replace(/\\/g, "/");
  const filename = normalized.split("/").pop() || "";
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${base}/uploads/${filename}`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color = "orange",
  attention = false,
  loading = false,
  onClick,
  delay = 0,
}) {
  const colorClasses = {
    orange: "bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col overflow-visible rounded-2xl 
        border border-gray-200 bg-white p-7 shadow-md
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1 hover:border-orange-300/50
        animate-fade-up opacity-0
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Corner hover circle - now visible and smooth */}
      <div 
        className={`
          absolute -right-20 -top-20 h-64 w-64 rounded-full 
          bg-gradient-to-br from-orange-100/40 via-orange-50/20 to-transparent
          opacity-0 scale-90 blur-sm
          transition-all duration-700 ease-out
          group-hover:opacity-100 group-hover:scale-100 group-hover:blur-none
          pointer-events-none z-0
        `}
      />

      {/* Subtle card glow on hover */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-50/10 
          opacity-0 transition-opacity duration-500
          group-hover:opacity-100 pointer-events-none z-0
        `}
      />

      <div className="relative z-10">
        <div
          className={`
            mb-6 flex h-16 w-16 items-center justify-center rounded-xl 
            ${colorClasses[color]} text-white 
            shadow-lg transition-all duration-300
            group-hover:rotate-6 group-hover:scale-110
          `}
        >
          <Icon size={28} />
        </div>

        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
          {title}
        </p>

        <div className="flex items-end gap-3">
          <h3 className="text-4xl font-extrabold text-gray-900">
            {loading ? "—" : value ?? "0"}
          </h3>
          {attention && value > 0 && (
            <div className="mb-1 h-3 w-3 rounded-full bg-orange-500 animate-pulse"></div>
          )}
        </div>
      </div>
    </button>
  );
}