import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewTask from './pages/NewTask'
import TaskProgress from './pages/TaskProgress'
import TaskHistory from './pages/TaskHistory'
import LeadsList from './pages/LeadsList'
import LeadDetail from './pages/LeadDetail'
import SavedLeads from './pages/SavedLeads'
import Exports from './pages/Exports'
import Settings from './pages/Settings'
import Help from './pages/Help'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              {/* Protected — Dashboard layout */}
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks/new" element={<NewTask />} />
                <Route path="tasks" element={<TaskHistory />} />
                <Route path="tasks/:taskId/progress" element={<TaskProgress />} />
                <Route path="tasks/:taskId/leads" element={<LeadsList />} />
                <Route path="leads/:leadId" element={<LeadDetail />} />
                <Route path="saved-leads" element={<SavedLeads />} />
                <Route path="exports" element={<Exports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
