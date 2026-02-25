import { Link, useNavigate, useLocation } from "react-router-dom";
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
  LogOut 
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Employees", path: "/employees", icon: <Users size={18} /> },
    { name: "Offer Letter", path: "/offer", icon: <FileText size={18} /> },
    { name: "Appointment", path: "/appointment", icon: <BadgeCheck size={18} /> },
    { name: "Salary Slip", path: "/salary", icon: <Receipt size={18} /> },
    { name: "Termination Letter", path: "/termination", icon: <UserX size={18} /> },
    { name: "Onboarding", path: "/onboarding", icon: <UserPlus size={18} /> },
    { name: "Offboarding", path: "/offboarding", icon: <UserMinus size={18} /> },
    { name: "FNF", path: "/fnf", icon: <FileSpreadsheet size={18} /> },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen sticky top-0 shadow-2xl flex flex-col justify-between">

      {/* Top Section */}
      <div className="px-10 pt-6">
        <h2 className="text-2xl font-extrabold mb-6 text-orange-500 tracking-wide">
          HRMS
        </h2>

        <ul className="space-y-4">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm
                    ${isActive 
                      ? "bg-orange-500 shadow-md" 
                      : "hover:bg-slate-700"
                    }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Fixed Logout */}
      <div className="px-10 pb-3 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full h-11 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-700 transition-all duration-200 rounded-lg font-semibold text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;