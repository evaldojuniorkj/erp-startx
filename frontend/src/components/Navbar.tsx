import { Home, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-lg font-bold">ERP Start X</h1>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-blue-200 flex items-center gap-1">
            <Home className="w-4 h-4" /> Início
          </Link>
          <Link to="/clientes" className="hover:text-blue-200 flex items-center gap-1">
            <Users className="w-4 h-4" /> Clientes
          </Link>
        </div>
      </div>
    </nav>
  );
}
