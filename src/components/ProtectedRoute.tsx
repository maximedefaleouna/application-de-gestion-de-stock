import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authToken = localStorage.getItem("token");
  const isAuthenticated = !!authToken;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return <>{children}</>;
}
