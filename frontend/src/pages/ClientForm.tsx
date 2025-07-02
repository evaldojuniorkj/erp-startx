import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, User, Building2, MapPin, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Schema de validação
const schema = z.object({
  type: z.enum(['FISICA', 'JURIDICA']),
  name: z.string().min(1, 'Nome é obrigatório'),
  nomeFantasia: z.string().optional(),
  document: z.string().min(1, 'Documento é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ClientFormData = z.infer<typeof schema>;

// Componente Input personalizado com forwardRef
const FormInput = React.forwardRef<HTMLInputElement, any>(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}, ref) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      {label}
    </label>
    <div className="relative">
      <input
        ref={ref}
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
));

// Componente Select personalizado
const FormSelect = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  children,
  ...props 
}: any) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
          error 
            ? 'border-red-300 bg-red-50 focus:ring-red-500' 
            : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
        }`}
      >
        {children}
      </select>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-10 top-1/2 transform -translate-y-1/2"
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

// Componente de seção do formulário
const FormSection = ({ title, icon: Icon, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
  >
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
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
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<ClientFormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur', // Mudando para onBlur para melhor performance
    defaultValues: {
      type: 'FISICA'
    }
  });

  // Usar watch para detectar mudanças no tipo
  const watchedType = watch('type');

  // Sincronizar estado local com o watch
  useEffect(() => {
    setTipoPessoa(watchedType || 'FISICA');
  }, [watchedType]);

  // Handler para mudança de tipo de pessoa
  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoTipo = e.target.value as 'FISICA' | 'JURIDICA';
    setTipoPessoa(novoTipo);
    setValue('type', novoTipo);
    
    // Limpar campo nome fantasia se mudou para pessoa física
    if (novoTipo === 'FISICA') {
      setValue('nomeFantasia', '');
    }
  };

  // Formatação de documento
  const formatDocument = (value: string, type: 'FISICA' | 'JURIDICA') => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'FISICA') {
      // CPF: 000.000.000-00
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  // Handler para mudança de documento
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value, tipoPessoa);
    setValue('document', formatted);
    e.target.value = formatted;
  };

  // Buscar CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      setIsCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setValue('street', data.logradouro);
          setValue('neighborhood', data.bairro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      const payload = {
        ...data,
        document: data.document.replace(/\D/g, ''),
      };
      const isEdicao = 'id' in data && !!data.id;
      const url = isEdicao
        ? `http://localhost:3000/clients/${data.id}`
        : 'http://localhost:3000/clients';
      const method = isEdicao ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 409) {
          toast.error('Documento já está cadastrado!');
        } else {
          toast.error('Erro ao salvar cliente. Tente novamente.');
        }
        return;
      }

      toast.success(isEdicao ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      reset();
      navigate('/clientes');
    } catch (error) {
      toast.error('Erro ao salvar cliente. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Cliente</h1>
              <p className="text-gray-600">Cadastre um novo cliente no sistema</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/clientes')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
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
                onChange={handleTipoChange}
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

              {/* Campo Nome Fantasia - Funcional */}
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
              />
            </div>
          </FormSection>

          {/* Endereço */}
          <FormSection title="Endereço" icon={MapPin}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <FormInput
                  label="CEP"
                  placeholder="00000-000"
                  error={errors.cep?.message}
                  {...register('cep')}
                  onChange={handleCepChange}
                  maxLength={9}
                />
                {isCepLoading && (
                  <div className="absolute right-3 top-9">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              <FormInput
                label="Logradouro"
                placeholder="Rua, Avenida, etc."
                error={errors.street?.message}
                {...register('street')}
                className="lg:col-span-2"
              />

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
            transition={{ delay: 0.3 }}
            className="flex justify-end gap-4 pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/clientes')}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

