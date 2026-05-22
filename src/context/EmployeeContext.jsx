import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const EmployeeContext = createContext();

// NOTE: Your backend is set to PORT 500. 
// If it's actually 5000, change it here.
const API_URL = "https://hrmsbackendfresh.onrender.com/api"; 

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

  // Auth Methods
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
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEmployees([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Employee CRUD
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
    if (!token) throw new Error("Not authenticated");
    try {
      const res = await axios.post(`${API_URL}/employee`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newEmp = res.data.data || res.data;
      setEmployees((prev) => [newEmp, ...prev]);
      return newEmp;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to add employee");
    }
  };

  const updateEmployee = async (id, data) => {
    if (!token) throw new Error("Not authenticated");
    try {
      const res = await axios.put(`${API_URL}/employee/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
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
    if (!token) throw new Error("Not authenticated");
    try {
      await axios.delete(`${API_URL}/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete employee");
    }
  };

  // OFFER LETTER METHODS
  const createOfferLetter = async (formData) => {
    if (!token) throw new Error("Not authenticated");
    try {
      const res = await axios.post(`${API_URL}/offer-letters`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create offer letter");
    }
  };

  

  

  const sendOfferLetterEmail = async (mongoId, email) => {
    if (!token) throw new Error("Not authenticated");
    try {
      const res = await axios.post(
        `${API_URL}/offer-letters/${mongoId}/send`, 
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send email");
    }
  };

// Appointment Letter Methods (Aligned with your Backend)
  const createAppointmentLetter = async (formData) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Endpoint matches: router.post('/appointment/create', createAppointment);
      const res = await axios.post(`${API_URL}/appointment-letters/appointment/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create appointment letter");
    }
  };

  const sendAppointmentEmail = async (mongoId, email) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Endpoint matches: router.post('/appointment/send/:id', sendEmail);
      const res = await axios.post(
        `${API_URL}/appointment-letters/appointment/send/${mongoId}`, 
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send appointment email");
    }
  };

  // ────────────────────────────────────────────────────────────────
  // SALARY SLIP METHODS
  // ────────────────────────────────────────────────────────────────
  
  const createSalarySlip = async (formData) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Endpoint matches: router.post('/', createSalarySlip);
      const res = await axios.post(`${API_URL}/salarySlip`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to generate salary slip");
    }
  };

  const sendSalarySlipEmail = async (mongoId) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Endpoint matches: router.post('salarySlip/:id/send', sendSalaryEmail);
      const res = await axios.post(
        `${API_URL}/salarySlip/${mongoId}/send`, 
        {}, // Body is empty as ID is in params
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send salary email");
    }
  };
   
  // ────────────────────────────────────────────────────────────────
  // TERMINATION LETTER METHODS
  // ────────────────────────────────────────────────────────────────

  const createTerminationRecord = async (formData) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Matches backend: router.post('/api/termination-letters', createTermination);
      const res = await axios.post(`${API_URL}/termination-letters`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data; 
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create termination record");
    }
  };

  const sendTerminationEmail = async (mongoId, email) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Matches backend: router.post('/api/termination-letters/:id/send', sendEmail);
      const res = await axios.post(
        `${API_URL}/termination-letters/${mongoId}/send`, 
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send termination email");
    }
  };
  // ────────────────────────────────────────────────────────────────
  // FULL & FINAL (FNF) METHODS
  // ────────────────────────────────────────────────────────────────

  const createFNFRecord = async (formData) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Matches backend: router.post('/api/fnf', createFNFRecord);
      const res = await axios.post(`${API_URL}/fnf`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create FNF record");
    }
  };

  const sendFNFEmail = async (mongoId, email) => {
    if (!token) throw new Error("Not authenticated");
    try {
      // Matches backend: router.post('/api/fnf/:id/send', sendEmail);
      const res = await axios.post(
        `${API_URL}/fnf/${mongoId}/send`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send FNF email");
    }
  };


  // ────────────────────────────────────────────────────────────────
  // ONBOARDING METHODS (Fixed Syntax and Logic)
  // ────────────────────────────────────────────────────────────────
  
  const submitOnboarding = async (employeeId, formData) => {
    if (!token) throw new Error("Not authenticated");
    
    const data = new FormData();
    
    // Append fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post(`${API_URL}/onboarding/submit/${employeeId}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });
      
      // Refresh list to show updated onboarding status
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