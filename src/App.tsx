import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';
import Bookings from './pages/Bookings';
import WidgetSettings from './pages/WidgetSettings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route path="/admin" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/:id/edit" element={<EventForm />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="widget" element={<WidgetSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
