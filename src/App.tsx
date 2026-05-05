import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';
import Bookings from './pages/Bookings';
import DocumentTemplates from './pages/DocumentTemplates';
import Inquiries from './pages/Inquiries';
import WidgetSettings from './pages/WidgetSettings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* ── Auth ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* ── Root redirect ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/admin" replace />
          </ProtectedRoute>
        }
      />

      {/* ── Admin panel ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/:id/edit" element={<EventForm />} />
<Route path="bookings" element={<Bookings />} />

        <Route path="documents" element={<DocumentTemplates />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="widget" element={<WidgetSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
