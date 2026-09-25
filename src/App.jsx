import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const OfferLetter = lazy(() => import("./pages/OfferLetter"));
const AppointmentLetter = lazy(() => import("./pages/AppointmentLetter"));
const SalarySlip = lazy(() => import("./pages/SalarySlip"));
const IncrementLetter = lazy(() => import("./pages/IncrementLetter"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Offboarding = lazy(() => import("./pages/Offboarding"));
const FNF = lazy(() => import("./pages/FNF"));
const TerminationLetter = lazy(() => import("./pages/TerminationLetter"));
const DocumentVault = lazy(() => import("./pages/DocumentVault"));
import ProtectedRoute from "./components/ProtectedRoute";
const AddEmployee = lazy(() => import("./pages/AddEmployee"));
const EmployeesList = lazy(() => import("./pages/EmployeesList"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8" role="status">Loading…</div>}><Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentVault /></ProtectedRoute>} />
        <Route path="/employees/add" element={<ProtectedRoute><AddEmployee /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><EmployeesList /></ProtectedRoute>} />
        <Route path="/offer" element={<ProtectedRoute><OfferLetter /></ProtectedRoute>} />
        <Route path="/appointment" element={<ProtectedRoute><AppointmentLetter /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><SalarySlip /></ProtectedRoute>} />
        <Route path="/increment" element={<ProtectedRoute><IncrementLetter /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/offboarding" element={<ProtectedRoute><Offboarding /></ProtectedRoute>} />
        <Route path="/fnf" element={<ProtectedRoute><FNF /></ProtectedRoute>} />
        <Route path="/termination" element={<ProtectedRoute><TerminationLetter /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></Suspense>
    </BrowserRouter>
  );
}

export default App;