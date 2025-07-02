import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, User, Building2, MapPin, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  document: z.string().min(11, 'CPF/CNPJ obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
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

// Componente Input personalizado
const FormInput = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}: any) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      {label}
    </label>
    <div className="relative">
      <input
        {...props}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error 
            ? 'border-red-300 bg-red-50 focus:ring-red-500' 
            : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
        }`}
      />
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
        </motion.div>
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Componente Select personalizado
const FormSelect = ({ 
  label, 
  error, 
  icon: Icon, 
  children, 
  className = '', 
  ...props 
}: any) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      {label}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
        error 
          ? 'border-red-300 bg-red-50 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
      }`}
    >
      {children}
    </select>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Componente Seção
const FormSection = ({ title, icon: Icon, children, className = '' }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
  >
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-blue-600" />}
        {title}
      </h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

export default function ClientForm() {
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'FISICA'
    }
  });

  // Usar watch para detectar mudanças no tipo
  const tipoWatch = watch('type');
  
  // Sincronizar o estado local com o watch
  useEffect(() => {
    if (tipoWatch) {
      setTipoPessoa(tipoWatch);
    }
  }, [tipoWatch]);

  const formatarDocumento = (valor: string): string => {
    const num = valor.replace(/\D/g, '');
    if (tipoPessoa === 'JURIDICA') {
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
      setIsCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue('street', data.logradouro);
          setValue('neighborhood', data.bairro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
          toast.success('Endereço preenchido automaticamente!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/clients');
      const data = await res.json();
      setClients(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
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
        toast.success(editId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
        reset();
        setEditId(null);
        setTipoPessoa('FISICA');
        fetchClients();
      }
    } catch {
      toast.error('Erro ao salvar cliente!');
    }
  };

  const handleCancel = () => {
    reset();
    setEditId(null);
    setTipoPessoa('FISICA');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editId ? 'Editar Cliente' : 'Novo Cliente'}
              </h1>
              <p className="text-gray-600 mt-1">
                {editId ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/clientes')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para listagem
            </motion.button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informações Básicas */}
          <FormSection
            title="Informações Básicas"
            icon={tipoPessoa === 'JURIDICA' ? Building2 : User}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormSelect
                label="Tipo de Pessoa"
                error={errors.type?.message}
                icon={tipoPessoa === 'JURIDICA' ? Building2 : User}
                {...register('type')}
              >
                <option value="FISICA">Pessoa Física</option>
                <option value="JURIDICA">Pessoa Jurídica</option>
              </FormSelect>

              <FormInput
                label={tipoPessoa === 'JURIDICA' ? 'Razão Social' : 'Nome Completo'}
                placeholder={tipoPessoa === 'JURIDICA' ? 'Digite a razão social' : 'Digite o nome completo'}
                error={errors.name?.message}
                icon={tipoPessoa === 'JURIDICA' ? Building2 : User}
                {...register('name')}
              />

              {/* Campo Nome Fantasia - Versão Corrigida */}
              {tipoPessoa === 'JURIDICA' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:col-span-2"
                >
                  <FormInput
                    label="Nome Fantasia"
                    placeholder="Digite o nome fantasia"
                    error={errors.nomeFantasia?.message}
                    icon={Building2}
                    {...register('nomeFantasia')}
                  />
                </motion.div>
              )}

              <FormInput
                label={tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF'}
                placeholder={tipoPessoa === 'JURIDICA' ? '00.000.000/0000-00' : '000.000.000-00'}
                error={errors.document?.message}
                {...register('document')}
                onChange={handleDocumentChange}
                maxLength={tipoPessoa === 'JURIDICA' ? 18 : 14}
              />

              <FormInput
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <FormInput
                label="Telefone"
                placeholder="(00) 00000-0000"
                error={errors.phone?.message}
                {...register('phone')}
                onChange={handlePhoneChange}
                maxLength={15}
              />
            </div>
          </FormSection>

          {/* Endereço */}
          <FormSection title="Endereço" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative">
                <FormInput
                  label="CEP"
                  placeholder="00000-000"
                  error={errors.cep?.message}
                  {...register('cep')}
                  onBlur={handleCepBlur}
                  maxLength={9}
                />
                {isCepLoading && (
                  <div className="absolute right-3 top-9">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <FormInput
                  label="Logradouro"
                  placeholder="Rua, Avenida, etc."
                  error={errors.street?.message}
                  {...register('street')}
                />
              </div>

              <FormInput
                label="Número"
                placeholder="123"
                error={errors.number?.message}
                {...register('number')}
              />

              <FormInput
                label="Bairro"
                placeholder="Nome do bairro"
                error={errors.neighborhood?.message}
                {...register('neighborhood')}
              />

              <FormInput
                label="Cidade"
                placeholder="Nome da cidade"
                error={errors.city?.message}
                {...register('city')}
              />

              <FormInput
                label="Estado"
                placeholder="UF"
                error={errors.state?.message}
                {...register('state')}
                maxLength={2}
              />
            </div>
          </FormSection>

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                Cancelar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editId ? 'Atualizar Cliente' : 'Salvar Cliente'}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

