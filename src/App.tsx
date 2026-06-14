import { Routes, Route } from 'react-router-dom';

import Login from './pages/login';
import Menu from './pages/menu';
import ProtectedRoute from './routes/protectedRoute';

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
  path="/menu"
  element={
    <ProtectedRoute>
      <Menu />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
}

export default App;