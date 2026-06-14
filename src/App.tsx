import { Routes, Route } from 'react-router-dom';

import Login from './pages/login';
import Project from './pages/projects';
import ProtectedRoute from './routes/protectedRoute';

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
  path="/projects"
  element={
    <ProtectedRoute>
      <Project />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
}

export default App;