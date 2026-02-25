import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Check BOTH token and user (more secure)
  return token && user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;