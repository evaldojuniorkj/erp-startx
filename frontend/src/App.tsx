import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientForm from './pages/ClientForm';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<ClientForm />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}
