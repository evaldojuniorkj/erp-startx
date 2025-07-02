import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <nav className="bg-blue-700 text-white px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-lg">ERP Start X</h1>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="hover:text-blue-200">Início</Link>
            <Link to="/clientes" className="hover:text-blue-200">Clientes</Link>
            <Link to="/clientes/novo" className="hover:text-blue-200">Novo Cliente</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}