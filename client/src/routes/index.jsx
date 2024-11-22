import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

// Auth Components
import Login from '../components/auth/Login';
import ChangePassword from '../components/auth/ChangePassword';

// Dashboard
import Dashboard from '../components/dashboard/Dashboard';

// Projects
import NewProject from '../components/projects/NewProject';
import AllProjects from '../components/projects/AllProjects';
import PendingProjects from '../components/projects/PendingProjects';
import MyProjects from '../components/projects/MyProjects';

// Admin
import UserManagement from '../components/admin/UserManagement';
import EngineerManagement from '../components/admin/EngineerManagement';

// Provisioning
import BulkProvisioning from '../components/provisioning/BulkProvisioning';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Projects Routes */}
          <Route path="/projects">
            <Route path="new" element={<NewProject />} />
            <Route path="all" element={<AllProjects />} />
            <Route path="pending" element={<PendingProjects />} />
            <Route path="my-projects" element={<MyProjects />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/engineers"
            element={
              <ProtectedRoute roles={['admin']}>
                <EngineerManagement />
              </ProtectedRoute>
            }
          />

          {/* Provisioning Routes */}
          <Route path="/bulk-provisioning" element={<BulkProvisioning />} />
          
          {/* Profile Routes */}
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes; 