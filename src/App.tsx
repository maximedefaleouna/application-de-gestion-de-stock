import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Clients from "./pages/Clients";
import Users from "./pages/Users";
import Notifications from "./pages/Notifications";
import Stats from "./pages/Stats";
import Configuration from "./pages/Configuration";
import Receipt from "./pages/Receipt";
import DebtPayments from "./pages/DebtPayments";
import ClientDebtDetail from "./pages/ClientDebtDetail";
import Historique from "./pages/Historique";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendeur']}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendeur']}>
                <POS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute adminOnly>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute adminOnly>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendeur']}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/debt-payments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendeur']}>
                <DebtPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-debt-detail/:clientId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendeur']}>
                <ClientDebtDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'vendeur']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute adminOnly>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration"
            element={
              <ProtectedRoute adminOnly>
                <Configuration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipt"
            element={
              <ProtectedRoute>
                <Receipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historique"
            element={
              <ProtectedRoute adminOnly>
                <Historique />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
