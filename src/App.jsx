import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';

// Main Pages
import Dashboard from './pages/Dashboard';
import Inquiries from './pages/Inquiries';
import InquiryDetail from './pages/inquiries/InquiryDetail';

// Employees
import EmployeesList from './pages/employees/EmployeesList';
import EmployeeDetail from './pages/employees/EmployeeDetail';

// Users & Permissions
import UsersList from './pages/users/UsersList';
import Permissions from './pages/users/Permissions';

// Leads
import LeadsList from './pages/leads/LeadsList';
import LeadDetail from './pages/leads/LeadDetail';
import LeadActivity from './pages/leads/LeadActivity';
import Customers from './pages/leads/Customers';
import LeadSettings from './pages/leads/LeadSettings';

// Communications
import EmailTemplates from './pages/communications/EmailTemplates';
import BulkMailing from './pages/communications/BulkMailing';
import EmailCampaigns from './pages/communications/EmailCampaigns';
import TeamChat from './pages/communications/TeamChat';
import Chatbot from './pages/communications/Chatbot';
import PushNotifications from './pages/communications/PushNotifications';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'sales_operator', 'user']} />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Employees - Admin & Manager */}
          <Route path="employees" element={<EmployeesList />} />
          <Route path="employees/:id" element={<EmployeeDetail />} />

          {/* Users & Permissions - Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="users" element={<UsersList />} />
            <Route path="users/permissions" element={<Permissions />} />
          </Route>

          {/* Inquiries */}
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="inquiries/:id" element={<InquiryDetail />} />

          {/* Leads */}
          <Route path="leads" element={<LeadsList />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="leads/activity" element={<LeadActivity />} />
          <Route path="leads/customers" element={<Customers />} />
          <Route path="leads/settings" element={<LeadSettings />} />

          {/* Communications - Admin & Manager */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="communications/templates" element={<EmailTemplates />} />
            <Route path="communications/bulk-mail" element={<BulkMailing />} />
            <Route path="communications/campaigns" element={<EmailCampaigns />} />
            <Route path="communications/chat" element={<TeamChat />} />
            <Route path="communications/chatbot" element={<Chatbot />} />
            <Route path="communications/notifications" element={<PushNotifications />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#059669',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#059669',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#dc2626',
                },
                duration: 5000,
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
