import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const EmployeeContext = createContext();
const API_URL = "http://localhost:5000/api"; 

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username: credentials.username.trim(),
        password: credentials.password,
      });
      const { token: authToken, user: userData } = res.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      // Throw so Login page knows it failed and doesn't redirect
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEmployees([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const fetchEmployees = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.data || res.data || []);
    } catch (error) {
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/employee`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const newEmp = res.data.data || res.data;
      setEmployees((prev) => [newEmp, ...prev]);
      return newEmp;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to add employee");
    }
  };

  const updateEmployee = async (id, data) => {
    try {
      const res = await axios.put(`${API_URL}/employee/${id}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const updatedEmp = res.data.data || res.data;
      setEmployees((prev) =>
        prev.map((emp) => (emp._id === id ? updatedEmp : emp))
      );
      return updatedEmp;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update employee");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`${API_URL}/employee/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const createOfferLetter = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/offer-letters`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create offer letter");
    }
  };

  const sendOfferLetterEmail = async (mongoId, email) => {
    try {
      const res = await axios.post(
        `${API_URL}/offer-letters/${mongoId}/send`, 
        { email },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send email");
    }
  };

  const createAppointmentLetter = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/appointment-letters/appointment/create`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create appointment letter");
    }
  };

  const sendAppointmentEmail = async (mongoId, email) => {
    try {
      const res = await axios.post(
        `${API_URL}/appointment-letters/appointment/send/${mongoId}`, 
        { email },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send appointment email");
    }
  };

  const createSalarySlip = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/salarySlip`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to generate salary slip");
    }
  };

  const sendSalarySlipEmail = async (mongoId) => {
    try {
      const res = await axios.post(
        `${API_URL}/salarySlip/${mongoId}/send`, 
        {}, 
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send salary email");
    }
  };

  const createTerminationRecord = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/termination-letters`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create termination record");
    }
  };

  const sendTerminationEmail = async (mongoId, email) => {
    try {
      const res = await axios.post(
        `${API_URL}/termination-letters/${mongoId}/send`, 
        { email },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send termination email");
    }
  };

  const createFNFRecord = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/fnf`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create FNF record");
    }
  };

  const sendFNFEmail = async (mongoId, email) => {
    try {
      const res = await axios.post(
        `${API_URL}/fnf/${mongoId}/send`,
        { email },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send FNF email");
    }
  };

  const submitOnboarding = async (employeeId, formData) => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post(`${API_URL}/onboarding/submit/${employeeId}`, data, {
        headers: { 
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "multipart/form-data" 
        },
      });
      fetchEmployees();
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Onboarding submission failed");
    }
  };

  useEffect(() => {
    if (token) fetchEmployees();
  }, [token]);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        user,
        token,
        login,
        logout,
        addEmployee,
        fetchEmployees,
        updateEmployee, 
        deleteEmployee, 
        createOfferLetter,      
        sendOfferLetterEmail,
        submitOnboarding,
        createAppointmentLetter, 
        sendAppointmentEmail,   
        createSalarySlip,
        sendSalarySlipEmail,
        createTerminationRecord,
        sendTerminationEmail,
        createFNFRecord,
        sendFNFEmail
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error("useEmployee must be used within EmployeeProvider");
  return context;
};