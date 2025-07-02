import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Client = {
  id: number;
  name: string;
  type: 'FISICA' | 'JURIDICA';
  document: string;
  email?: string;
  phone?: string;
};

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar clientes do backend
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/clients');
      const data = await res.json();
      setClients(data);
    } catch {
      toast.error('Erro ao buscar clientes!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtro único por nome, CPF ou CNPJ
  const searchLower = search.toLowerCase().replace(/\D/g, '');
  const filteredClients = clients.filter(c => {
    const nameMatch = c.name.toLowerCase().includes(search.toLowerCase());
    const docMatch = c.document.replace(/\D/g, '').includes(searchLower);
    return nameMatch || (searchLower.length > 0 && docMatch);
  });

  // Excluir cliente com confirmação
  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const res = await fetch(`http://localhost:3000/clients/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Cliente excluído com sucesso!');
        fetchClients();
      } else {
        toast.error('Erro ao excluir cliente!');
      }
    } catch {
      toast.error('Erro ao excluir cliente!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista de Clientes</h1>
        <button
          onClick={() => navigate('/clientes/novo')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2 max-w-md">
        <Search className="text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou CNPJ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="rounded-xl shadow bg-white overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Documento</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Telefone</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">Carregando...</td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  Nenhum cliente encontrado.<br />
                  <button
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition"
                    onClick={() => navigate('/clientes/novo')}
                  >
                    Cadastrar novo cliente
                  </button>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-mono text-gray-500">{client.id}</td>
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${client.type === 'JURIDICA' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                      {client.type === 'JURIDICA' ? 'Jurídica' : 'Física'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{client.document}</td>
                  <td className="px-4 py-3">{client.email}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3 flex justify-center gap-3">
                    <button
                      onClick={() => navigate(`/clientes/${client.id}`)}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-400/80 hover:bg-yellow-400 text-yellow-900 text-xs shadow transition"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-red-500/80 hover:bg-red-600 text-white text-xs shadow transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
