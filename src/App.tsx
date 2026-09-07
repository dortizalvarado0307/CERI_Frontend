import { Routes, Route } from 'react-router-dom';

import Login from './pages/login/login';
import PersonInCharge from './pages/personInCharge/personInCharge';
import Project from './pages/projects/projects';
import Users from './pages/users/users';
import ProtectedRoute from './routes/protectedRoute';
import AdminRoute from './routes/adminRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>

        <Route
          path="/"
          element={<Login/>}
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />

        <Route
          path="/people"
          element={
            <ProtectedRoute>
              <PersonInCharge />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />

      </Routes>
    </AuthProvider>
  );
}

export default App;