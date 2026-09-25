import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../../services/api";
import { getApiUrl } from "../utils/serverBase";

const EmployeeContext = createContext();
const API_URL = getApiUrl();

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
      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setEmployees([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const fetchEmployees = useCallback(async () => {
    if (!token || !["admin", "hr"].includes(JSON.parse(localStorage.getItem("user") || "null")?.role)) return;
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
  }, [token, logout]);

  const addEmployee = async (data) => {
    const res = await axios.post(`${API_URL}/employee`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const newEmp = res.data.data || res.data;
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  };

  const updateEmployee = async (id, data) => {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await axios.put(`${API_URL}/employee/${id}`, data, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
    const updatedEmp = res.data.data || res.data;
    setEmployees((prev) =>
      prev.map((emp) => (emp._id === id ? updatedEmp : emp))
    );
    return updatedEmp;
  };

  const deleteEmployee = async (id) => {
    await axios.delete(`${API_URL}/employee/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setEmployees((prev) => prev.filter((emp) => emp._id !== id));
  };

  // Letters & Workflows
  const createOfferLetter = async (formData) => {
    const res = await axios.post(`${API_URL}/offer-letters`, formData);
    return res.data;
  };

  const sendOfferLetterEmail = async (mongoId, email) => {
    const res = await axios.post(`${API_URL}/offer-letters/${mongoId}/send`, { email });
    return res.data;
  };

  const createAppointmentLetter = async (formData) => {
    const res = await axios.post(`${API_URL}/appointment-letters/appointment/create`, formData);
    return res.data;
  };

  const sendAppointmentEmail = async (mongoId, email) => {
    const res = await axios.post(`${API_URL}/appointment-letters/appointment/send/${mongoId}`, { email });
    return res.data;
  };

  const createIncrementLetter = async (formData) => {
    const res = await axios.post(`${API_URL}/increment-letters`, formData);
    return res.data;
  };

  const sendIncrementLetterEmail = async (mongoId, email) => {
    const res = await axios.post(`${API_URL}/increment-letters/${mongoId}/send`, { email });
    return res.data;
  };

  const createSalarySlip = async (formData) => {
    const res = await axios.post(`${API_URL}/salarySlip`, formData);
    return res.data;
  };

  const sendSalarySlipEmail = async (mongoId) => {
    const res = await axios.post(`${API_URL}/salarySlip/${mongoId}/send`, {});
    return res.data;
  };

  const createTerminationRecord = async (formData) => {
    const res = await axios.post(`${API_URL}/termination-letters`, formData);
    return res.data;
  };

  const sendTerminationEmail = async (mongoId, email) => {
    const res = await axios.post(`${API_URL}/termination-letters/${mongoId}/send`, { email });
    return res.data;
  };

  const createFNFRecord = async (formData) => {
    const res = await axios.post(`${API_URL}/fnf`, formData);
    return res.data;
  };

  const sendFNFEmail = async (mongoId, email) => {
    const res = await axios.post(`${API_URL}/fnf/${mongoId}/send`, { email });
    return res.data;
  };

  const submitOnboarding = async (employeeId, formData) => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (["photo","idProof","addressProof","educationProof","experienceLetter"].includes(key) && !(formData[key] instanceof File)) return;
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await axios.post(`${API_URL}/onboarding/submit/${employeeId}`, data, {

      });
      await fetchEmployees();
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Onboarding submission failed"
      );
    }
  };

  // Vault Service
  const fetchAllDocuments = useCallback(async (params = {}) => {
    const res = await axios.get(`${API_URL}/documents`, { params });
    return res.data;
  }, []);

  const bulkDownloadZip = async (documents) => {
    const res = await axios.post(`${API_URL}/documents/bulk-download`, { documents }, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HRMS_Documents_${Date.now()}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const deleteDocument = async (docType, id) => {
    const res = await axios.delete(
      `${API_URL}/documents/${encodeURIComponent(docType)}/${id}`
    );
    return res.data;
  };

  useEffect(() => {
    if (token) fetchEmployees();
  }, [token, fetchEmployees]);

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
        createIncrementLetter,
        sendIncrementLetterEmail,
        createSalarySlip,
        sendSalarySlipEmail,
        createTerminationRecord,
        sendTerminationEmail,
        createFNFRecord,
        sendFNFEmail,
        fetchAllDocuments,
        bulkDownloadZip,
        deleteDocument,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

// Context consumers are intentionally exported alongside the provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error("useEmployee must be used within EmployeeProvider");
  return context;
};