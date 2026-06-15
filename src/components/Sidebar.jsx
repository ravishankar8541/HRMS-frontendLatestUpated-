import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  BadgeCheck,
  Receipt,
  UserX,
  UserPlus,
  UserMinus,
  FileSpreadsheet,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    name: "Employees",
    icon: Users,
    children: [
      { name: "Add Employee", path: "/employees/add", icon: UserPlus },
      { name: "Manage Employees", path: "/employees", icon: Users },
    ],
  },
  { name: "Offer Letter", path: "/offer", icon: FileText },
  { name: "Appointment", path: "/appointment", icon: BadgeCheck },
  { name: "Salary Slip", path: "/salary", icon: Receipt },
  { name: "Termination Letter", path: "/termination", icon: UserX },
  { name: "Onboarding", path: "/onboarding", icon: UserPlus },
  { name: "Offboarding", path: "/offboarding", icon: UserMinus },
  { name: "FNF", path: "/fnf", icon: FileSpreadsheet },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isEmployeesOpen, setIsEmployeesOpen] = useState(
    location.pathname.startsWith("/employees")
  );

  useEffect(() => {
    setIsEmployeesOpen(location.pathname.startsWith("/employees"));
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (base) => location.pathname.startsWith(base);

  const baseItemClasses =
    "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-300";

  const activeClasses =
    "bg-orange-500/10 text-orange-500 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.2)]";

  const inactiveClasses =
    "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100";

  return (
    <aside
      className={`
        hidden lg:flex lg:flex-col lg:w-72 
        bg-[#0f172a] text-slate-100 h-screen sticky top-0 
        border-r border-slate-800/50 
        shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)] select-none
      `}
    >
      {/* Logo Section */}
      <div className="px-8 pt-8 pb-10">
        <div className="flex items-center gap-3">
         
          <h2 className="text-2xl font-black tracking-tight text-white leading-none">
            HR<span className="text-orange-500">MS</span>
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
        <div className="mb-4 px-4 text-[11px] font-bold uppercase tracking-widest text-slate-600">
          Main Menu
        </div>
        
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.children) {
              const isOpen = isEmployeesOpen;
              const isActiveSection = isSectionActive("/employees");

              return (
                <li key={item.name} className="relative">
                  {isActiveSection && (
                    <div className="absolute left-[-16px] top-2 bottom-2 w-1 bg-orange-500 rounded-r-full shadow-[2px_0_10px_rgba(249,115,22,0.5)]" />
                  )}

                  <div
                    onClick={() => setIsEmployeesOpen((prev) => !prev)}
                    className={`
                      ${baseItemClasses} w-full justify-between cursor-pointer
                      ${isActiveSection ? activeClasses : inactiveClasses}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={`${isActiveSection ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className={isActiveSection ? "font-bold" : ""}>{item.name}</span>
                    </div>
                    <ChevronRight 
                      size={14} 
                      className={`transition-transform duration-300 ${isOpen ? "rotate-90 text-orange-500" : "text-slate-600"}`} 
                    />
                  </div>

                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                      ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                    `}
                  >
                    <ul className="ml-4 mt-1 border-l border-slate-800/80 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.name} className="pl-4 pt-1">
                          <Link
                            to={child.path}
                            className={`
                              ${baseItemClasses}
                              ${isActive(child.path) 
                                ? "text-orange-500 font-bold bg-orange-500/5" 
                                : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30"}
                            `}
                          >
                            <child.icon size={16} />
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.name} className="relative">
                {isActive(item.path) && (
                  <div className="absolute left-[-16px] top-2 bottom-2 w-1 bg-orange-500 rounded-r-full shadow-[2px_0_10px_rgba(249,115,22,0.5)]" />
                )}
                <Link
                  to={item.path}
                  className={`
                    ${baseItemClasses}
                    ${isActive(item.path) ? activeClasses : inactiveClasses}
                  `}
                >
                  <item.icon 
                    size={18} 
                    className={`${isActive(item.path) ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'}`} 
                  />
                  <span className={isActive(item.path) ? "font-bold" : ""}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

     {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/20">
        <button
          onClick={logout}
          className={`
            w-full flex items-center justify-center gap-2.5 
            py-3.5 px-4 rounded-xl 
            bg-gradient-to-r from-orange-500 to-orange-600 
            hover:from-orange-600 hover:to-orange-700
            text-white font-bold text-sm
            shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)]
            hover:shadow-[0_15px_25px_-5px_rgba(249,115,22,0.5)]
            active:scale-[0.97]
            transition-all duration-300 group
          `}
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;