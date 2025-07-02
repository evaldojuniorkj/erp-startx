import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, 'Nome obrigatório'),
  document: z.string().min(11, 'CPF/CNPJ obrigatório'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  type: z.enum(['FISICA', 'JURIDICA']),
  nomeFantasia: z.string().optional(),
  cep: z.string().optional(),
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
  const navigate = useNavigate();

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
      return num.replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return num.replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatarDocumento(e.target.value);
    setValue('document', value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const masked = raw.length > 10
      ? raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    setValue('phone', masked);
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

  const fetchClients = async () => {
    const res = await fetch('http://localhost:3000/clients');
    const data = await res.json();
    setClients(data.sort((a, b) => a.name.localeCompare(b.name)));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (data: ClientFormData) => {
    const payload = {
      ...data,
      document: data.document.replace(/\D/g, '')
    };
    const url = editId
      ? `http://localhost:3000/clients/${editId}`
      : 'http://localhost:3000/clients';
    const method = editId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Documento já cadastrado!');
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded p-6 space-y-4 border border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-700">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button type="button" onClick={() => navigate('/clientes')} className="text-sm text-blue-600 hover:underline">
            Voltar para listagem
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select {...register('type')} className="input input-bordered w-full">
            <option value="FISICA">Pessoa Física</option>
            <option value="JURIDICA">Pessoa Jurídica</option>
          </select>

          <input
            {...register('name')}
            placeholder={tipoSelecionado === 'JURIDICA' ? 'Razão Social' : 'Nome'}
            className="input input-bordered w-full"
          />
          {tipoSelecionado === 'JURIDICA' && (
            <input
              {...register('nomeFantasia')}
              placeholder="Nome Fantasia"
              className="input input-bordered w-full md:col-span-2"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input {...register('document')} onChange={handleDocumentChange} placeholder="CPF ou CNPJ" className="input input-bordered w-full" />
          <input {...register('email')} placeholder="Email" className="input input-bordered w-full" />
          <input {...register('phone')} onChange={handlePhoneChange} placeholder="Telefone" className="input input-bordered w-full" />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input {...register('cep')} onBlur={handleCepBlur} placeholder="CEP" className="input input-bordered w-full" />
            <input {...register('street')} placeholder="Rua" className="input input-bordered w-full" />
            <input {...register('number')} placeholder="Número" className="input input-bordered w-full" />
            <input {...register('neighborhood')} placeholder="Bairro" className="input input-bordered w-full" />
            <input {...register('city')} placeholder="Cidade" className="input input-bordered w-full" />
            <input {...register('state')} placeholder="Estado" className="input input-bordered w-full" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition flex items-center gap-2">
            <Save className="w-5 h-5" /> {editId ? 'Atualizar' : 'Salvar'}
          </button>
          <button type="button" onClick={() => { reset(); setEditId(null); }} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md shadow hover:bg-gray-400 transition">
            Novo Cliente
          </button>
          <button type="button" onClick={() => { reset(); setEditId(null); }} className="bg-red-500 text-white px-6 py-2 rounded-md shadow hover:bg-red-600 transition">
            Cancelar Edição
          </button>
        </div>
      </form>
    </div>
  );
}
