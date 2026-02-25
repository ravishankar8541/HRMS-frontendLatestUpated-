import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const API_URL = "http://localhost:500/api"; // make sure port is correct

  // ===============================
  // 🔐 AUTH FUNCTIONS
  // ===============================

  // ... other imports and code remain the same ...

const login = async (credentials) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      username: credentials.username,
      password: credentials.password,
      // Do NOT send role here – backend doesn't need it for login
    });

    const { token, user } = res.data;

    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // ← FIX: save user too!

    return { success: true };
  } catch (error) {
    const message =
      error.response?.data?.message || "Login failed. Please check credentials.";
    console.error("Login error:", error);
    return { success: false, message };
  }
};

// In logout – also clear user
const logout = () => {
  setUser(null);
  setToken(null);
  setEmployees([]);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};



  // ===============================
  // 👨‍💼 EMPLOYEE FUNCTIONS
  // ===============================

  const fetchEmployees = async () => {
    if (!token) return;

    const res = await axios.get(`${API_URL}/employee`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setEmployees(res.data.data);
  };

 const addEmployee = async (data) => {
  try {
    console.log("Sending payload to backend:", data);

    const res = await axios.post(`${API_URL}/employee`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Backend success response:", res.data); // ← add this

    setEmployees((prev) => [res.data.data || res.data, ...prev]);
  } catch (error) {
    console.log("Add employee FAILED with full details:", {
      status: error.response?.status,
      message: error.message,
      backendMessage: error.response?.data?.message || error.response?.data,
      fullResponse: error.response?.data,
      sentPayload: data,
    });

    const errorMsg = error.response?.data?.message || "Failed to add employee";
    alert(errorMsg);
    throw error;
  }
};

  const deleteEmployee = async (id) => {
    await axios.delete(`${API_URL}/employee/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setEmployees((prev) =>
      prev.filter((emp) => emp._id !== id)
    );
  };

  // Fetch employees when token changes
  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token]);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        fetchEmployees,
        addEmployee,
        deleteEmployee,
        user,
        token,
        login,
        
        logout,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => useContext(EmployeeContext);