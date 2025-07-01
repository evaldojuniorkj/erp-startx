import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Pencil, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(3),
  document: z.string().min(11).max(18),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  type: z.enum(['FISICA', 'JURIDICA']),
  nomeFantasia: z.string().optional(),
  cep: z.string().min(8).optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ClientFormData = z.infer<typeof schema>;

export default function ClientForm() {
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ClientFormData>({
    resolver: zodResolver(schema)
  });

  const tipoSelecionado = watch('type');

  const formatarDocumento = (valor: string): string => {
    const num = valor.replace(/\D/g, '');
    if (tipoSelecionado === 'JURIDICA') {
      return num
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return num
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatarDocumento(e.target.value);
    setValue('document', value);
  };

  const fetchClients = async () => {
    const res = await fetch('http://localhost:3000/clients');
    const data = await res.json();
    setClients(data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (data: ClientFormData) => {

    const payload = {
      ...data,
      document: data.document.replace(/\D/g, '') // remove máscara do CPF/CNPJ
    };

    const url = editId ? `http://localhost:3000/clients/${editId}` : 'http://localhost:3000/clients';
    const method = editId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Documento já está cadastrado!");
        } else {
          throw new Error();
        }
      } else {
        toast.success(editId ? 'Cliente atualizado!' : 'Cliente cadastrado!');
        reset();
        setEditId(null);
        fetchClients();
      }
    } catch {
      toast.error('Erro ao salvar cliente!');
    }
  };

  const handleEdit = (client: ClientFormData) => {
    setEditId(client.id!);
    Object.entries(client).forEach(([key, value]) => setValue(key as keyof ClientFormData, value));
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/clients/${id}`, { method: 'DELETE' });
    toast.success('Cliente removido!');
    fetchClients();
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValue('street', data.logradouro);
        setValue('neighborhood', data.bairro);
        setValue('city', data.localidade);
        setValue('state', data.uf);
      } else {
        toast.error('CEP não encontrado');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-2xl rounded-xl p-6 md:p-8 space-y-6 border border-gray-100 transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-extrabold text-blue-800 flex items-center gap-3 border-b pb-4 mb-6 border-blue-100">
          <Save className="w-8 h-8 text-blue-600" /> {editId ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        {editId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200"
          >
            ID do Cliente: {editId}
          </motion.div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pessoa</label>
            <select id="type" {...register('type')} className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out">
              <option value="FISICA">Pessoa Física</option>
              <option value="JURIDICA">Pessoa Jurídica</option>
            </select>
          </div>
          <div className="relative md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{tipoSelecionado === "JURIDICA" ? "Razão Social" : "Nome Completo"}</label>
            <input id="name" {...register('name')} placeholder={tipoSelecionado === "JURIDICA" ? "Razão Social" : "Nome"} className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
          </div>
          {tipoSelecionado === 'JURIDICA' && (
            <div className="relative md:col-span-2">
              <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <input id="nomeFantasia" {...register('nomeFantasia')} placeholder="Nome Fantasia" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
          )}
          <div className="relative">
            <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">{tipoSelecionado === "FISICA" ? "CPF" : "CNPJ"}</label>
            <input id="document" {...register("document")} onChange={handleDocumentChange} placeholder={tipoSelecionado === "FISICA" ? "CPF" : "CNPJ"} className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
          </div>
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" {...register('email')} placeholder="Email" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
          </div>
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input id="phone" {...register('phone')} placeholder="Telefone" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
          </div>
        </div>
        <div className="pt-6 border-t border-gray-200 mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input id="cep" {...register('cep')} placeholder="CEP" onBlur={handleCepBlur} className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
            <div className="relative">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
              <input id="street" {...register('street')} placeholder="Rua" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
            <div className="relative">
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input id="number" {...register('number')} placeholder="Número" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
            <div className="relative">
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input id="neighborhood" {...register('neighborhood')} placeholder="Bairro" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
            <div className="relative">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input id="city" {...register('city')} placeholder="Cidade" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
            <div className="relative">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input id="state" {...register('state')} placeholder="Estado" className="input input-bordered w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out" />
            </div>
          </div>
        </div>
        <button type="submit" className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 font-semibold">
          <Save className="w-6 h-6" /> {editId ? 'Atualizar' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
