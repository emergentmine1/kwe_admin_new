import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layouts/AppLayout';
import { Toaster } from '@/components/ui/sonner';

import Login from '@/pages/Login';
import LoginCallback from '@/pages/LoginCallback';
import SsoSignIn from '@/pages/SsoSignIn';
import AccessDenied from '@/pages/AccessDenied';
import HomeRedirect from '@/components/HomeRedirect';
import PlaceholderPage from '@/pages/_placeholder';
import PricingLayout from '@/components/layouts/PricingLayout';
import RateProfileList from '@/pages/admin/rates/RateProfileList';
import RateProfileForm from '@/pages/admin/rates/RateProfileForm';
import RateProfileDetail from '@/pages/admin/rates/RateProfileDetail';
import ProviderManagement from '@/pages/admin/ProviderManagement';
import Leads from '@/pages/admin/Leads';
import { ANY_ROLE, WRITE_ROLE } from '@/lib/admin-nav';
import CategoryGuard from '@/components/rates/CategoryGuard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/callback" element={<LoginCallback />} />
            <Route path="/login/sso" element={<SsoSignIn />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/instant-quote" element={<PlaceholderPage title="Instant Quote" description="This quote form is not implemented in the current frontend build." />} />
            <Route path="/instant-quote/results" element={<PlaceholderPage title="Instant Quote Results" description="The quote results screen is not implemented in the current frontend build." />} />

            {/* Authenticated */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Dashboard" /></ProtectedRoute>} />
              <Route path="/quotes/search" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Quote Search" /></ProtectedRoute>} />
              <Route path="/quotes/results" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Quote Results" /></ProtectedRoute>} />
              <Route path="/quotes/compare" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Quote Comparison" /></ProtectedRoute>} />
              <Route path="/bookings/new" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Booking" /></ProtectedRoute>} />
              <Route path="/shipments" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Shipments" /></ProtectedRoute>} />
              <Route path="/shipments/:id" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Shipment Detail" /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Invoices" /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Notifications" /></ProtectedRoute>} />

              <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Provider Dashboard" /></ProtectedRoute>} />
              <Route path="/provider/rates" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Rate Management" /></ProtectedRoute>} />
              <Route path="/provider/routes" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Route Management" /></ProtectedRoute>} />
              <Route path="/provider/booking-requests" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Booking Requests" /></ProtectedRoute>} />
              <Route path="/provider/analytics" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PlaceholderPage title="Analytics" /></ProtectedRoute>} />

              <Route path="/admin/dashboard" element={<Navigate to="/admin/pricing" replace />} />
              <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><PricingLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/pricing/freight" replace />} />
                <Route path=":category" element={<CategoryGuard><RateProfileList /></CategoryGuard>} />
              </Route>
              <Route path="/admin/pricing/:category/new" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><CategoryGuard><RateProfileForm /></CategoryGuard></ProtectedRoute>} />
              <Route path="/admin/pricing/profile/:id/edit" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><RateProfileForm /></ProtectedRoute>} />
              <Route path="/admin/pricing/profile/:id" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><RateProfileDetail /></ProtectedRoute>} />
              <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={WRITE_ROLE}><ProviderManagement /></ProtectedRoute>} />
              <Route path="/admin/leads" element={<ProtectedRoute allowedRoles={ANY_ROLE}><Leads /></ProtectedRoute>} />
              <Route path="/admin/quotes" element={<ProtectedRoute allowedRoles={ANY_ROLE}><div data-testid="admin-quotes-blank" /></ProtectedRoute>} />
            </Route>

            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

