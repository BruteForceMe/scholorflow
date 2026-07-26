import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FocusOverlay from './components/FocusOverlay';
import FocusToast from './components/FocusToast';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import NotesPage from './pages/NotesPage';
import WorkspacesPage from './pages/WorkspacesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SchedulePage from './pages/SchedulePage';
import InsightsPage from './pages/InsightsPage';
import FocusPage from './pages/FocusPage';

function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
      {/* Global focus mode components — visible on all pages during active session */}
      <FocusOverlay />
      <FocusToast />
    </div>
  );
}

export default function App() {
  const { state } = useApp();

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        state.isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/signup" element={
        state.isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <AppLayout><TasksPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute>
          <AppLayout><NotesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/workspaces" element={
        <ProtectedRoute>
          <AppLayout><WorkspacesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><AnalyticsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/schedule" element={
        <ProtectedRoute>
          <AppLayout><SchedulePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          <AppLayout><InsightsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/focus" element={
        <ProtectedRoute>
          <AppLayout><FocusPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
