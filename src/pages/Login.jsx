import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useEmployee } from "../context/EmployeeContext";



const Login = () => {
  const navigate = useNavigate();
  const { login } = useEmployee();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "admin",
  });

  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "hr", label: "HR Manager" },
    { value: "employee", label: "Employee" },
  ];

  const selectedLabel =
    roleOptions.find((opt) => opt.value === formData.role)?.label ||
    "Select role";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    const { username, password } = formData;

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    try {
      setError("");

      await login({
        username: username.trim(),
        password,
        role: formData.role,
      });

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6 text-center rounded-t-xl">
          <div className="mx-auto h-10 w-10 bg-white rounded-lg flex items-center justify-center text-orange-600 font-bold text-xl">
            HR
          </div>
          <h2 className="mt-3 text-xl font-bold text-white">
            HRMS Portal
          </h2>
          <p className="mt-1 text-orange-100 text-xs">
            Secure HR Management
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          {error && (
            <div className="mb-5 bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500 focus:outline-none text-sm"
                placeholder="Username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500 focus:outline-none text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* Role Dropdown */}
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>

              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-left flex justify-between items-center focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                {selectedLabel}
                <span>{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <ul className="mt-1 border border-gray-200 rounded-lg shadow-md bg-white">
                  {roleOptions.map((option) => (
                    <li
                      key={option.value}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          role: option.value,
                        });
                        setIsOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer text-sm ${
                        formData.role === option.value
                          ? "bg-orange-600 text-white"
                          : "hover:bg-orange-50"
                      }`}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Button */}
          <div className="mt-7">
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
            >
              Sign In
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} HRMS System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;