import React, { useEffect, useState, useMemo } from "react";
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
  Sparkles,
  TrendingUp,
  FolderArchive,
  Search,
  ArrowUpRight,
  Clock,
  FileText,
  BadgeCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useEmployee } from "../context/EmployeeContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { employees, loading: isLoading, fetchEmployees } = useEmployee();
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchEmployees();
    // Trigger entrance animations after first paint
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Time-based dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Real-time metric computations
  const totalEmployees = employees?.length ?? 0;

  const pendingOnboarding = useMemo(
    () => employees?.filter((e) => e.onboardingStatus !== "Completed")?.length ?? 0,
    [employees]
  );

  const completedOnboarding = useMemo(
    () => employees?.filter((e) => e.onboardingStatus === "Completed")?.length ?? 0,
    [employees]
  );

  const totalMonthlyPayroll = useMemo(() => {
    return employees?.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
  }, [employees]);

  // Live filter for quick search
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!searchTerm.trim()) return employees.slice(0, 7);

    const term = searchTerm.toLowerCase();
    return employees
      .filter(
        (emp) =>
          emp.name?.toLowerCase().includes(term) ||
          emp.email?.toLowerCase().includes(term) ||
          emp.designation?.toLowerCase().includes(term)
      )
      .slice(0, 10);
  }, [employees, searchTerm]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-orange-500 selection:text-white font-sans antialiased">
      {/* Advanced Keyframes – GPU-friendly, no layout thrashing */}
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(28px, -18px, 0) scale(1.06); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translate3d(0, 18px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.72; }
        }
        @keyframes rowReveal {
          from { opacity: 0; transform: translate3d(-8px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes badgePop {
          0% { transform: scale(0.85); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        .animate-float-glow {
          animation: floatGlow 16s ease-in-out infinite;
          will-change: transform;
        }
        .shimmer-mask {
          position: relative;
          overflow: hidden;
        }
        .shimmer-mask::after {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0,
            rgba(0, 0, 0, 0.04) 20%,
            rgba(0, 0, 0, 0.09) 60%,
            rgba(0, 0, 0, 0)
          );
          animation: shimmerSweep 1.8s infinite;
          content: '';
          pointer-events: none;
        }

        /* Staggered entrance – pure CSS, zero JS cost after mount */
        .enter-ready .enter-item {
          opacity: 0;
          animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .enter-ready .enter-item:nth-child(1) { animation-delay: 0.04s; }
        .enter-ready .enter-item:nth-child(2) { animation-delay: 0.09s; }
        .enter-ready .enter-item:nth-child(3) { animation-delay: 0.14s; }
        .enter-ready .enter-item:nth-child(4) { animation-delay: 0.19s; }
        .enter-ready .enter-item:nth-child(5) { animation-delay: 0.24s; }
        .enter-ready .enter-item:nth-child(6) { animation-delay: 0.29s; }

        .enter-ready .stat-enter {
          opacity: 0;
          animation: scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .enter-ready .stat-enter:nth-child(1) { animation-delay: 0.12s; }
        .enter-ready .stat-enter:nth-child(2) { animation-delay: 0.18s; }
        .enter-ready .stat-enter:nth-child(3) { animation-delay: 0.24s; }
        .enter-ready .stat-enter:nth-child(4) { animation-delay: 0.30s; }

        .enter-ready .header-enter {
          opacity: 0;
          animation: fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .enter-ready .table-enter {
          opacity: 0;
          animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.28s forwards;
        }

        .row-animate {
          animation: rowReveal 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .badge-pop {
          animation: badgePop 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }

        /* Smooth hover micro-interactions */
        .card-lift {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 0.3s ease;
        }
        .card-lift:hover {
          transform: translateY(-4px);
        }
        .icon-spin-hover {
          transition: transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .group:hover .icon-spin-hover {
          transform: scale(1.12) rotate(6deg);
        }
      `}</style>

      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {/* Ambient Soft Orange Background Orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-orange-400/10 blur-[120px] animate-float-glow" />
          <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-amber-300/15 blur-[130px] animate-float-glow [animation-delay:4s]" />
          <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-orange-300/10 blur-[110px]" />
        </div>

        <main
          className={`relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 ${
            mounted ? "enter-ready" : ""
          }`}
        >
          {/* Header Banner */}
          <header className="header-enter flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200 text-orange-700 text-xs font-semibold mb-2 shadow-sm">
                <Sparkles size={13} className="text-orange-600 animate-pulse" />
                <span>HR & Payroll Control Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                {greeting},{" "}
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Administrator
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                Live workspace data as of{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/documents"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/40 transition-all duration-300 shadow-sm active:scale-[0.97]"
              >
                <FolderArchive size={16} className="text-orange-500" />
                <span>Document Vault</span>
              </Link>

              <Link
                to="/employees/add"
                className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700 active:scale-[0.97]"
              >
                <UserPlus size={17} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <span>Add Employee</span>
              </Link>
            </div>
          </header>

          {/* Quick Workflows Navigation Bar */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <QuickActionCard title="Offer Letter" path="/offer" icon={FileText} />
            <QuickActionCard title="Appointment" path="/appointment" icon={BadgeCheck} />
            <QuickActionCard title="Increment" path="/increment" icon={TrendingUp} />
            <QuickActionCard title="Salary Slip" path="/salary" icon={Receipt} />
            <QuickActionCard title="Onboarding" path="/onboarding" icon={ShieldCheck} />
            <QuickActionCard title="F&F Statement" path="/fnf" icon={FileWarning} />
          </section>

          {/* KPI Analytics Metric Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              caption="Active Registered Staff"
              icon={Users}
              badgeText="Directory"
              loading={isLoading}
              onClick={() => navigate("/employees")}
              accentColor="orange"
            />
            <StatCard
              title="Monthly Payroll"
              value={`₹${(totalMonthlyPayroll / 1000).toFixed(1)}k`}
              caption="Gross Disbursed Monthly"
              icon={IndianRupee}
              badgeText="Total Salary"
              loading={isLoading}
              onClick={() => navigate("/salary")}
              accentColor="amber"
            />
            <StatCard
              title="Pending Onboard"
              value={pendingOnboarding}
              caption={`${completedOnboarding} Completed`}
              icon={ShieldCheck}
              badgeText={pendingOnboarding > 0 ? "Action Required" : "All Clear"}
              attention={pendingOnboarding > 0}
              loading={isLoading}
              onClick={() => navigate("/onboarding")}
              accentColor="orange"
            />
            <StatCard
              title="Pending F&F"
              value={2}
              caption="Clearances Awaiting"
              icon={FileWarning}
              badgeText="Exit Flow"
              attention={true}
              loading={isLoading}
              onClick={() => navigate("/fnf")}
              accentColor="amber"
            />
          </div>

          {/* Recent Employees Table Section */}
          <section className="table-enter rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-300">
            {/* Table Header Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm transition-transform duration-300 hover:scale-105">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Recent Staff Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing latest active onboarding and team profiles
                  </p>
                </div>
              </div>

              {/* Fast Real-Time Search */}
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Quick search staff..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all duration-300 shadow-inner"
                  />
                </div>

                <Link
                  to="/employees"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors duration-300 whitespace-nowrap px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-200 shadow-sm hover:bg-orange-100/70 active:scale-[0.97]"
                >
                  <span>View All</span>
                  <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="divide-y divide-slate-100 p-4">
                {[...Array(5)].map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 py-16 text-slate-400">
                <AlertCircle size={48} className="text-orange-400" />
                <p className="text-base font-bold text-slate-700">No matching employees</p>
                <p className="text-xs text-slate-500">Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/75">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Employee
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Contact Info
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Designation
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Salary
                      </th>
                      <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Date Joined
                      </th>
                      <th className="px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Onboarding
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredEmployees.map((emp, idx) => (
                      <tr
                        key={emp._id}
                        className="group hover:bg-orange-50/30 transition-all duration-200 cursor-pointer row-animate"
                        style={{ animationDelay: `${idx * 0.04}s` }}
                        onClick={() => navigate(`/employees`)}
                      >
                        {/* Profile Info */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-700 text-sm shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                              {emp.photo ? (
                                <img
                                  src={getPhotoUrl(emp.photo)}
                                  alt={emp.name || ""}
                                  className="h-full w-full object-cover"
                                  onError={(e) => (e.target.style.display = "none")}
                                  loading="lazy"
                                />
                              ) : (
                                emp.name?.charAt(0)?.toUpperCase() || "E"
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm group-hover:text-orange-600 transition-colors duration-200">
                                {emp.name || "—"}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                ID: #{emp._id?.slice(-6).toUpperCase() || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Mail size={13} className="text-slate-400" />
                              <span>{emp.email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Phone size={13} className="text-slate-400" />
                              <span>{emp.phoneNumber || "—"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 group-hover:bg-orange-50 group-hover:border-orange-200 group-hover:text-orange-800 transition-all duration-200">
                            {emp.designation || "Not Assigned"}
                          </span>
                        </td>

                        {/* Salary */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900 font-mono">
                          {emp.salary ? `₹${Number(emp.salary).toLocaleString("en-IN")}` : "—"}
                        </td>

                        {/* Date Joined */}
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {emp.dateOfJoining
                              ? new Date(emp.dateOfJoining).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </div>
                        </td>

                        {/* Onboarding Status Badge */}
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 badge-pop ${
                              emp.onboardingStatus === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-orange-50 text-orange-700 border border-orange-200 animate-pulse"
                            }`}
                            style={{ animationDelay: `${idx * 0.05 + 0.15}s` }}
                          >
                            <ShieldCheck size={13} />
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

// -------------------------------------------------------------
// Quick Action Workflow Tile (Light Theme + Advanced Motion)
// -------------------------------------------------------------
function QuickActionCard({ title, path, icon: Icon }) {
  return (
    <Link
      to={path}
      className="enter-item group relative flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200/90 hover:border-orange-400 hover:bg-orange-50/40 card-lift shadow-sm hover:shadow-md"
    >
      <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 mb-2 shadow-sm icon-spin-hover">
        <Icon size={18} />
      </div>
      <span className="text-xs font-bold text-slate-700 group-hover:text-orange-800 transition-colors duration-300 text-center">
        {title}
      </span>
    </Link>
  );
}

// -------------------------------------------------------------
// Metric Stat Card (White & Orange Theme + Advanced Motion)
// -------------------------------------------------------------
function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  badgeText,
  accentColor = "orange",
  attention = false,
  loading = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="stat-enter group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-md shadow-slate-100 card-lift hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10"
    >
      {/* Ambient Orange Corner Flare */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br from-orange-200/40 via-orange-100/20 to-transparent blur-xl transition-all duration-500 group-hover:scale-150 group-hover:bg-orange-300/30" />

      {/* Top Row: Icon + Badge */}
      <div className="flex items-center justify-between w-full mb-4 relative z-10">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${
            accentColor === "amber"
              ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25"
              : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/25"
          } shadow-md transition-transform duration-400 ease-out group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon size={22} />
        </div>

        {badgeText && (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all duration-300 ${
              attention
                ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-orange-50 group-hover:text-orange-700 group-hover:border-orange-200"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Numerical Data */}
      <div className="relative z-10">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          {title}
        </h4>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <div className="h-9 w-24 rounded-lg bg-slate-200 animate-pulse my-0.5" />
          ) : (
            <h3 className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
              {value}
            </h3>
          )}
        </div>
        {caption && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{caption}</p>
        )}
      </div>
    </button>
  );
}

// -------------------------------------------------------------
// Shimmer Skeleton Loader (Light Theme)
// -------------------------------------------------------------
function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 px-6 shimmer-mask">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 rounded bg-slate-200" />
          <div className="h-2.5 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-3 w-36 rounded bg-slate-200 hidden md:block" />
      <div className="h-6 w-24 rounded-lg bg-slate-200" />
      <div className="h-3.5 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>
  );
}

// -------------------------------------------------------------
// Safe Photo URL Generator
// -------------------------------------------------------------
function getPhotoUrl(photoPath) {
  if (!photoPath) return null;
  if (photoPath.startsWith("http")) return photoPath;
  const normalized = photoPath.replace(/\\/g, "/");
  const filename = normalized.split("/").pop() || "";
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${base}/uploads/${filename}`;
}