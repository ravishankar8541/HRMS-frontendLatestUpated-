import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import OfferLetter from "./pages/OfferLetter";
import AppointmentLetter from "./pages/AppointmentLetter";
import SalarySlip from "./pages/SalarySlip";
import Onboarding from "./pages/Onboarding";
import Offboarding from "./pages/Offboarding";
import FNF from "./pages/FNF";
import TerminationLetter from "./pages/TerminationLetter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No protection */}
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/offer" element={<OfferLetter />} />
        <Route path="/appointment" element={<AppointmentLetter />} />
        <Route path="/salary" element={<SalarySlip />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/offboarding" element={<Offboarding />} />
        <Route path="/fnf" element={<FNF />} />
        <Route path="/termination" element={<TerminationLetter />} />

        {/* Catch-all → redirect to login/home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;