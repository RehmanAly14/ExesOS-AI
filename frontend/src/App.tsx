import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import WorkspacePage from './pages/WorkspacePage'
import BusinessPage from './pages/BusinessPage'
import UploadDocumentsPage from './pages/UploadDocumentsPage'
import ChatPage from './pages/ChatPage'
import ProjectsPage from './pages/ProjectsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ExecutiveReportPage from './pages/ExecutiveReportPage'
import SettingsPage from './pages/SettingsPage'
import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth page — redirect to dashboard if already authenticated */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          {/* Protected Routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* MVP Flow Routes */}
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/business/:businessId/documents" element={<UploadDocumentsPage />} />
              <Route path="/business/:businessId/chat" element={<ChatPage />} />

              {/* Other Routes */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reports" element={<ExecutiveReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App