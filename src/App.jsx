import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OfferLetter from "./pages/OfferLetter";
import AppointmentLetter from "./pages/AppointmentLetter";
import SalarySlip from "./pages/SalarySlip";
import IncrementLetter from "./pages/IncrementLetter"
import Onboarding from "./pages/Onboarding";
import Offboarding from "./pages/Offboarding";
import FNF from "./pages/FNF";
import TerminationLetter from "./pages/TerminationLetter";
import ProtectedRoute from "./components/ProtectedRoute";

// ────────────────────────────────────────────────
// Correct imports for Employees
// ────────────────────────────────────────────────
import AddEmployee from "./pages/AddEmployee";     // ← this one was missing/wrong
import EmployeesList from "./pages/EmployeesList"; // ← this is already correct

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ─── Employees ──────────────────────────────────────── */}
        <Route
          path="/employees/add"
          element={
            <ProtectedRoute>
              <AddEmployee />           {/* ← changed from Employees → AddEmployee */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offer"
          element={
            <ProtectedRoute>
              <OfferLetter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment"
          element={
            <ProtectedRoute>
              <AppointmentLetter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salary"
          element={
            <ProtectedRoute>
              <SalarySlip />
            </ProtectedRoute>
          }
        />
         <Route
          path="/increment"
          element={
            <ProtectedRoute>
              <IncrementLetter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offboarding"
          element={
            <ProtectedRoute>
              <Offboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fnf"
          element={
            <ProtectedRoute>
              <FNF />
            </ProtectedRoute>
          }
        />
        <Route
          path="/termination"
          element={
            <ProtectedRoute>
              <TerminationLetter />
            </ProtectedRoute>
          }
        />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;