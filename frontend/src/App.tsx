import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ServiceProvider } from './context/ServiceContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/Home/HomePage';
import { ServicesPage } from './pages/Services/ServicesPage';
import { AboutPage } from './pages/AboutMe/AboutPage';
import { LoginPage } from './pages/Login/LoginPage';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminServices } from './pages/Admin/AdminServices';
import { AdminInbox } from './pages/Admin/AdminInbox';
import { AdminUsers } from './pages/Admin/AdminUsers';

// Dynamic Page Title Updater based on current active route
const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/') {
      document.title = 'Fix Please | Home';
    } else if (pathname === '/services') {
      document.title = 'Fix Please | Services';
    } else if (pathname === '/about') {
      document.title = 'Fix Please | About Me';
    } else if (pathname === '/login') {
      document.title = 'Fix Please | Admin Login';
    } else if (pathname === '/admin/dashboard') {
      document.title = 'Fix Please | Admin - Dashboard';
    } else if (pathname === '/admin/services') {
      document.title = 'Fix Please | Admin - Services';
    } else if (pathname === '/admin/inbox') {
      document.title = 'Fix Please | Admin - Inbox';
    } else if (pathname === '/admin/users') {
      document.title = 'Fix Please | Admin - Users';
    } else if (pathname.startsWith('/admin')) {
      document.title = 'Fix Please | Admin';
    } else {
      document.title = 'Fix Please';
    }
  }, [location.pathname]);

  return null;
};

// Public Layout Wrapper (with public Navbar and Footer)
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc] text-slate-800 antialiased selection:bg-pink-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <TitleManager />
      <AuthProvider>
        <ServiceProvider>
          <Routes>
            {/* 1. Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* 2. Admin Portal Routes (with Role Protection & Admin Workspace Sidebar) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="inbox" element={<AdminInbox />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ServiceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
