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
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-xl rounded-xl p-6 md:p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <Save className="w-6 h-6" /> {editId ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        {editId && (
          <div className="text-sm text-gray-500">ID do Cliente: {editId}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select {...register('type')} className="input input-bordered w-full">
            <option value="FISICA">Pessoa Física</option>
            <option value="JURIDICA">Pessoa Jurídica</option>
          </select>
          <input {...register('name')} placeholder={tipoSelecionado === "JURIDICA" ? "Razão Social" : "Nome"} className="input input-bordered w-full md:col-span-2" />
          {tipoSelecionado === 'JURIDICA' && (
            <input {...register('nomeFantasia')} placeholder="Nome Fantasia" className="input input-bordered w-full md:col-span-2" />
          )}
          <input {...register("document")} onChange={handleDocumentChange} placeholder={tipoSelecionado === "FISICA" ? "CPF":"CNPJ"} className="input input-bordered w-full" />
          <input {...register('email')} placeholder="Email" className="input input-bordered w-full" />
          <input {...register('phone')} placeholder="Telefone" className="input input-bordered w-full" />
        </div>
        <div className="pt-4 border-t border-gray-200 mt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input {...register('cep')} placeholder="CEP" onBlur={handleCepBlur} className="input input-bordered w-full" />
            <input {...register('street')} placeholder="Rua" className="input input-bordered w-full" />
            <input {...register('number')} placeholder="Número" className="input input-bordered w-full" />
            <input {...register('neighborhood')} placeholder="Bairro" className="input input-bordered w-full" />
            <input {...register('city')} placeholder="Cidade" className="input input-bordered w-full" />
            <input {...register('state')} placeholder="Estado" className="input input-bordered w-full" />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition flex items-center gap-2">
          <Save className="w-5 h-5" /> {editId ? 'Atualizar' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
