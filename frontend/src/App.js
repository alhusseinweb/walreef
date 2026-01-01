import { Suspense, lazy, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "./i18n";
import { isAuthenticated, isAdmin, isCustomer, isStaff, getUserRole } from "./utils/auth";

// Lazy load pages
const Landing = lazy(() => import("./pages/Landing"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const CustomerRegister = lazy(() => import("./pages/CustomerRegister"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const CustomerTransactions = lazy(() => import("./pages/CustomerTransactions"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminSync = lazy(() => import("./pages/AdminSync"));
const AdminStaff = lazy(() => import("./pages/AdminStaff"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const RedeemPoints = lazy(() => import("./pages/RedeemPoints"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen" data-testid="loading-spinner">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4D2E]"></div>
  </div>
);

// Protected route for customers
const CustomerRoute = ({ children }) => {
  if (!isAuthenticated() || !isCustomer()) {
    return <Navigate to="/customer/login" replace />;
  }
  return children;
};

// Protected route for admins only (not staff)
const AdminOnlyRoute = ({ children }) => {
  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Protected route for admins and staff
const AdminRoute = ({ children }) => {
  if (!isAuthenticated() || (!isAdmin() && !isStaff())) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Protected route for staff (redirects to redeem page if staff)
const StaffDashboardRoute = ({ children }) => {
  if (!isAuthenticated() || (!isAdmin() && !isStaff())) {
    return <Navigate to="/admin/login" replace />;
  }
  // If staff, redirect to redeem points page
  if (isStaff()) {
    return <Navigate to="/admin/redeem" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Set RTL direction for Arabic
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <div className="App" dir="rtl">
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/admin/login" element={<Navigate to="/customer/login" replace />} />
            
            {/* Customer Protected Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <CustomerRoute>
                  <CustomerDashboard />
                </CustomerRoute>
              }
            />
            <Route
              path="/customer/transactions"
              element={
                <CustomerRoute>
                  <CustomerTransactions />
                </CustomerRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <CustomerRoute>
                  <CustomerProfile />
                </CustomerRoute>
              }
            />
            
            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <StaffDashboardRoute>
                  <AdminDashboard />
                </StaffDashboardRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminOnlyRoute>
                  <AdminCustomers />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminOnlyRoute>
                  <AdminSettings />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="/admin/sync"
              element={
                <AdminOnlyRoute>
                  <AdminSync />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <AdminOnlyRoute>
                  <AdminStaff />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminOnlyRoute>
                  <AdminReports />
                </AdminOnlyRoute>
              }
            />
            <Route
              path="/admin/redeem"
              element={
                <AdminRoute>
                  <RedeemPoints />
                </AdminRoute>
              }
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
