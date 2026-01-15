import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TenantConfigProvider } from './contexts/TenantConfigContext';
import { DashboardRefreshProvider } from './contexts/DashboardRefreshContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
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

// Settings
import Settings from './pages/admin/Settings';

// Leads
import LeadsList from './pages/leads/LeadsList';
import LeadDetail from './pages/leads/LeadDetail';
import LeadActivity from './pages/leads/LeadActivity';
import Customers from './pages/leads/Customers';
import CustomerDetail from './pages/leads/CustomerDetail';
import LeadSettings from './pages/leads/LeadSettings';

// Communications
import EmailTemplates from './pages/communications/EmailTemplates';
import EmailTemplateEditor from './pages/communications/EmailTemplateEditor';
import BulkMailing from './pages/communications/BulkMailing';
import EmailCampaigns from './pages/communications/EmailCampaigns';
import CampaignDetail from './pages/communications/CampaignDetail';
import TeamChat from './pages/communications/TeamChat';
import Chatbot from './pages/communications/Chatbot';
import PushNotifications from './pages/communications/PushNotifications';

// E-Commerce (loaded based on tenant config)
import ProductsList from './pages/ecommerce/ProductsList';
import OrdersList from './pages/industry/ecommerce/Orders';
import OrderDetail from './pages/industry/ecommerce/OrderDetail';
import Analytics from './pages/industry/ecommerce/Analytics';
import InventoryList from './pages/ecommerce/InventoryList'; // Legacy - redirects to /products
import ReturnsList from './pages/ecommerce/ReturnsList';
import CustomersList from './pages/ecommerce/CustomersList';
import ReviewsList from './pages/ecommerce/ReviewsList';
import CouponsList from './pages/ecommerce/CouponsList';
import ShippingManagement from './pages/ecommerce/ShippingManagement';
import CMSManagement from './pages/ecommerce/CMSManagement';
import VendorsList from './pages/ecommerce/VendorsList';
import ReportsPage from './pages/ecommerce/ReportsPage';

// Real Estate
import Properties from './pages/industry/realestate/Properties';
import Viewings from './pages/industry/realestate/Viewings';
import Listings from './pages/industry/realestate/Listings';
import RealEstateDashboard from './pages/industry/realestate/RealEstateDashboard';
import InquiryList from './pages/industry/realestate/InquiryList';
import Transactions from './pages/industry/realestate/Transactions';
import AgentList from './pages/industry/realestate/AgentList';
import PropertyForm from './pages/industry/realestate/PropertyForm';

// Healthcare
import Patients from './pages/industry/healthcare/Patients';
import Prescriptions from './pages/industry/healthcare/Prescriptions';

// Education
import Courses from './pages/industry/education/Courses';
import Students from './pages/industry/education/Students';
import Enrollments from './pages/industry/education/Enrollments';

// Services
import Appointments from './pages/industry/services/Appointments';
import ServicesList from './pages/industry/services/ServicesList';
import Clients from './pages/industry/services/Clients';
import StaffManagement from './pages/industry/services/StaffManagement';
import ServicePackages from './pages/industry/services/ServicePackages';
import ServiceCategories from './pages/industry/services/ServiceCategories';
import MembershipPlans from './pages/industry/services/MembershipPlans';
import BookingCalendar from './pages/industry/services/BookingCalendar';
import ServicesReports from './pages/industry/services/ServicesReports';

// Hospitality
import Rooms from './pages/industry/hospitality/Rooms';
import Reservations from './pages/industry/hospitality/Reservations';
import Housekeeping from './pages/industry/hospitality/Housekeeping';

// Fitness
import Members from './pages/industry/fitness/Members';
import Classes from './pages/industry/fitness/Classes';
import Trainers from './pages/industry/fitness/Trainers';

// Legal
import Cases from './pages/industry/legal/Cases';
import Billing from './pages/industry/legal/Billing';

// Manufacturing
import Production from './pages/industry/manufacturing/Production';
import WorkOrders from './pages/industry/manufacturing/WorkOrders';

// Logistics
import Shipments from './pages/industry/logistics/Shipments';
import Tracking from './pages/industry/logistics/Tracking';
import Vehicles from './pages/industry/logistics/Vehicles';

// Restaurant
import Menu from './pages/industry/restaurant/Menu';
import KitchenOrders from './pages/industry/restaurant/KitchenOrders';
import Tables from './pages/industry/restaurant/Tables';
// Salon
import Bookings from './pages/industry/salon/Bookings';
import SalonServices from './pages/industry/salon/SalonServices';
import Staff from './pages/industry/salon/Staff';

// Settings
import ThemeEditor from './pages/settings/ThemeEditor';
import PaymentSettings from './pages/settings/PaymentSettings';

// Admin
import SmtpSettings from './pages/admin/SmtpSettings';
import IndustryTest from './pages/admin/IndustryTest';

// Automation
import Workflows from './pages/automation/Workflows';
import WorkflowBuilder from './pages/automation/WorkflowBuilder';
import ExecutionHistory from './pages/automation/ExecutionHistory';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'sales_operator', 'user']} />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="industry-test" element={<IndustryTest />} />

          {/* Employees - Permission Guarded */}
          <Route element={<ProtectedRoute requiredPermission={['employees', 'read']} />}>
            <Route path="employees" element={<EmployeesList />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
          </Route>

          {/* Users & Permissions - Admin & Permission Guarded */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} requiredPermission={['users', 'read']} />}>
            <Route path="users" element={<UsersList />} />
            <Route path="users/permissions" element={<Permissions />} />
          </Route>

          {/* Inquiries */}
          <Route element={<ProtectedRoute requiredPermission={['inquiries', 'read']} />}>
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="inquiries/:id" element={<InquiryDetail />} />
          </Route>

          {/* Leads */}
          <Route element={<ProtectedRoute requiredPermission={['leads', 'read']} />}>
            <Route path="leads" element={<LeadsList />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="leads/activity" element={<LeadActivity />} />
            <Route path="leads/customers" element={<Customers />} />
            <Route path="leads/customers/:id" element={<CustomerDetail />} />
            <Route path="leads/settings" element={<LeadSettings />} />
          </Route>

          {/* Communications */}
          <Route element={<ProtectedRoute requiredPermission={['communications', 'read']} />}>
            <Route path="communications/templates" element={<EmailTemplates />} />
            <Route path="communications/templates/new" element={<EmailTemplateEditor />} />
            <Route path="communications/templates/:id/edit" element={<EmailTemplateEditor />} />
            <Route path="communications/bulk-mail" element={<BulkMailing />} />
            <Route path="communications/campaigns" element={<EmailCampaigns />} />
            <Route path="communications/campaigns/:id" element={<CampaignDetail />} />
            <Route path="communications/chat" element={<TeamChat />} />
            <Route path="communications/chatbot" element={<Chatbot />} />
            <Route path="communications/notifications" element={<PushNotifications />} />
          </Route>

          {/* E-Commerce - Permission Guarded */}
          <Route element={<ProtectedRoute requiredPermission={['products', 'read']} />}>
            <Route path="products" element={<ProductsList />} />
          </Route>
          <Route element={<ProtectedRoute requiredPermission={['orders', 'read']} />}>
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>

          <Route path="analytics" element={<Analytics />} />
          <Route path="inventory" element={<Navigate to="/products" replace />} />
          <Route path="returns" element={<ReturnsList />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="reviews" element={<ReviewsList />} />
          <Route path="coupons" element={<CouponsList />} />
          <Route path="shipping" element={<ShippingManagement />} />
          <Route path="cms" element={<CMSManagement />} />
          <Route path="vendors" element={<VendorsList />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Industry Modules */}
          {/* Real Estate */}
          <Route path="realestate-dashboard" element={<RealEstateDashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/new" element={<PropertyForm />} />
          <Route path="properties/:id" element={<PropertyForm />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="viewings" element={<Viewings />} />
          <Route path="listings" element={<Listings />} />
          <Route path="property-inquiries" element={<InquiryList />} />
          <Route path="property-inquiries/:id" element={<InquiryList />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions/:id" element={<Transactions />} />
          <Route path="agents" element={<AgentList />} />
          <Route path="agents/:id" element={<AgentList />} />

          {/* Healthcare */}
          <Route path="patients" element={<Patients />} />
          <Route path="prescriptions" element={<Prescriptions />} />

          {/* Education */}
          <Route path="courses" element={<Courses />} />
          <Route path="students" element={<Students />} />
          <Route path="enrollments" element={<Enrollments />} />

          {/* Services */}
          <Route path="appointments" element={<Appointments />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="clients" element={<Clients />} />
          <Route path="staff-specialists" element={<StaffManagement />} />
          <Route path="service-packages" element={<ServicePackages />} />
          <Route path="service-categories" element={<ServiceCategories />} />
          <Route path="membership-plans" element={<MembershipPlans />} />
          <Route path="booking-calendar" element={<BookingCalendar />} />
          <Route path="services-reports" element={<ServicesReports />} />

          {/* Hospitality */}
          <Route path="rooms" element={<Rooms />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="housekeeping" element={<Housekeeping />} />

          {/* Fitness */}
          <Route path="members" element={<Members />} />
          <Route path="classes" element={<Classes />} />
          <Route path="trainers" element={<Trainers />} />

          {/* Legal */}
          <Route path="cases" element={<Cases />} />
          <Route path="billing" element={<Billing />} />

          {/* Manufacturing */}
          <Route path="production" element={<Production />} />
          <Route path="work-orders" element={<WorkOrders />} />

          {/* Logistics */}
          <Route path="shipments" element={<Shipments />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="vehicles" element={<Vehicles />} />

          {/* Restaurant */}
          <Route path="menu" element={<Menu />} />
          <Route path="kitchen-orders" element={<KitchenOrders />} />
          <Route path="tables" element={<Tables />} />

          {/* Salon */}
          <Route path="bookings" element={<Bookings />} />
          <Route path="salon-services" element={<SalonServices />} />
          <Route path="staff" element={<Staff />} />

          {/* Automation - Permission Guarded */}
          <Route element={<ProtectedRoute requiredPermission={['automation', 'read']} />}>
            <Route path="automation/workflows" element={<Workflows />} />
            <Route path="automation/workflows/:id" element={<WorkflowBuilder />} />
            <Route path="automation/history" element={<ExecutionHistory />} />
          </Route>

          {/* Settings - Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="settings/theme-editor" element={<ThemeEditor />} />
            <Route path="settings/payment" element={<PaymentSettings />} />
            <Route path="settings/smtp" element={<SmtpSettings />} />
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
          <PermissionsProvider>
            <TenantConfigProvider>
              <DashboardRefreshProvider>
                <AppRoutes />
                <Toaster
                  position="top-right"
                  containerStyle={{
                    zIndex: 99999,
                  }}
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
              </DashboardRefreshProvider>
            </TenantConfigProvider>
          </PermissionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter >
  );
}
