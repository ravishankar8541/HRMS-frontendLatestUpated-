import { Navigate, useLocation } from 'react-router-dom';
export default function ProtectedRoute({children}) {
 const location=useLocation();
 let user; try { user=JSON.parse(localStorage.getItem('user')); } catch { return <Navigate to="/" replace />; }
 if(!localStorage.getItem('token') || !user) return <Navigate to="/" replace />;
 if(user.role === 'employee' && location.pathname !== '/documents') return <Navigate to="/documents" replace />;
 return children;
}
