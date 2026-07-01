import { Routes, Route } from 'react-router-dom';

import Login from './pages/login/login';
import PersonInCharge from './pages/personInCharge/personInCharge';
import Project from './pages/projects/projects';
import ProtectedRoute from './routes/protectedRoute';

function App() {
  return (
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

    </Routes>
  );
}

export default App;