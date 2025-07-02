import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Client = {
  id: number;
  name: string;
  document: string;
  type: 'FISICA' | 'JURIDICA';
};

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      const res = await fetch('http://localhost:3000/clients');
      const data = await res.json();
      const sorted = data.sort((a: Client, b: Client) => a.name.localeCompare(b.name));
      setClients(sorted);
      setFiltered(sorted);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const result = clients.filter(c => c.name.toLowerCase().includes(query));
    setFiltered(result);
    setPage(1); // volta pra primeira página ao buscar
  }, [search, clients]);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button onClick={() => navigate('/clientes/novo')} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Search className="text-gray-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome"
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {paginated.map(client => (
          <motion.div
            key={client.id}
            className="bg-white p-4 rounded-md shadow border border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between">
              <div>
                <div className="text-lg font-semibold text-blue-700">{client.name}</div>
                <div className="text-sm text-gray-600">ID: {client.id} — {client.document}</div>
              </div>
              <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-800">{client.type}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-1 border rounded disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-1 border rounded disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
