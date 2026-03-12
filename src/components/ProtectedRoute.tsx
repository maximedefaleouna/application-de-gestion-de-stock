import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  sellerOnly?: boolean;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  adminOnly,
  sellerOnly,
  allowedRoles 
}: ProtectedRouteProps) {
  const authToken = localStorage.getItem("token");
  const isAuthenticated = !!authToken;
  
  // Get user data to check role
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check admin-only access
  if (adminOnly && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Check seller-only access
  if (sellerOnly && userRole !== "vendeur") {
    return <Navigate to="/" replace />;
  }

  // Check if role is in allowed roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the right role, render the protected component
  return <>{children}</>;
}
