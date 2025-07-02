import { Routes, Route } from 'react-router-dom';
import ClientForm from '../pages/ClientForm';
import ClientList from '../pages/ClientList';
import Dashboard from '../pages/Dashboard';
import Layout from '../components/Layout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<ClientList />} />
        <Route path="clientes/novo" element={<ClientForm />} />
        <Route path="clientes/:id" element={<ClientForm />} />
      </Route>
    </Routes>
  );
}