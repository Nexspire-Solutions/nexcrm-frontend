import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TenantConfigProvider } from './contexts/TenantConfigContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';

// Main Pages
import Dashboard from './pages/Dashboard';
import Inquiries from './pages/Inquiries';
import InquiryDetail from './pages/inquiries/InquiryDetail';
import Profile from './pages/Profile';

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

// E-Commerce (loaded based on tenant config)
// E-Commerce
import ProductsList from './pages/ecommerce/ProductsList';
import OrdersList from './pages/industry/ecommerce/Orders';
import Analytics from './pages/industry/ecommerce/Analytics';
import InventoryList from './pages/ecommerce/InventoryList';
import ReturnsList from './pages/ecommerce/ReturnsList';

// Real Estate
import Properties from './pages/industry/realestate/Properties';
import ViewingsList from './pages/realestate/ViewingsList';

// Healthcare
import Patients from './pages/industry/healthcare/Patients';
import PrescriptionsList from './pages/healthcare/PrescriptionsList';

// Education
import Courses from './pages/industry/education/Courses';
import Students from './pages/industry/education/Students';

// Services
import Appointments from './pages/industry/services/Appointments';
import ServicesList from './pages/services/ServicesList';

// Hospitality
import Rooms from './pages/industry/hospitality/Rooms';

// Fitness
import Members from './pages/industry/fitness/Members';

// Legal
import Cases from './pages/industry/legal/Cases';

// Manufacturing
import Production from './pages/industry/manufacturing/Production';

// Logistics
import Shipments from './pages/industry/logistics/Shipments';

// Restaurant
import Menu from './pages/industry/restaurant/Menu';

// Salon
import Bookings from './pages/industry/salon/Bookings';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'sales_operator', 'user']} />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

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

          {/* E-Commerce - Dynamic based on industry */}
          <Route path="products" element={<ProductsList />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="returns" element={<ReturnsList />} />

          {/* Industry Modules */}
          <Route path="properties" element={<Properties />} />
          <Route path="patients" element={<Patients />} />
          <Route path="courses" element={<Courses />} />
          <Route path="students" element={<Students />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="members" element={<Members />} />
          <Route path="cases" element={<Cases />} />
          <Route path="production" element={<Production />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="menu" element={<Menu />} />
          <Route path="bookings" element={<Bookings />} />
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
          <TenantConfigProvider>
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
          </TenantConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
