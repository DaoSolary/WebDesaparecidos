import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { 
  Upload, 
  X, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { InfoModal } from '../components/InfoModal';
import { ANGOLA_PROVINCES } from '../utils/provinces';

type CaseForm = {
  fullName: string;
  alias?: string;
  age?: number;
  gender: string;
  missingDate: string;
  lastSeenLocation: string;
  province: string;
  municipality?: string;
  description?: string;
  circumstances?: string;
  healthConditions?: string;
  priority: string;
};

export function CreateCasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CaseForm>({
    defaultValues: {
      gender: 'MASCULINO',
      priority: 'GERAL',
      province: user?.province || '',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length + photos.length > 5) {
      alert('Máximo de 5 fotos permitidas');
      e.target.value = ''; // Reset input
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(file.name);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      alert(`As seguintes fotos são muito grandes (máximo 5MB): ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length === 0) {
      e.target.value = ''; // Reset input
      return;
    }

    // Adicionar arquivos ao estado
    setPhotos((prev) => [...prev, ...validFiles]);

    // Criar previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotoPreviews((prev) => [...prev, result]);
        }
      };
      reader.onerror = () => {
        console.error('Erro ao ler arquivo:', file.name);
      };
      reader.readAsDataURL(file);
    });

    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    if (photos.length === 0) return uploadedUrls;
    
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('file', photo);
    });
    
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (data.files && Array.isArray(data.files)) {
        return data.files.map((f: any) => {
          // Se a URL já é completa, usar diretamente
          if (f.url.startsWith('http')) {
            return f.url;
          }
          // Se começa com /, usar como está (o proxy do Vite vai lidar)
          if (f.url.startsWith('/')) {
            return f.url;
          }
          // Caso contrário, construir URL completa
          return `${window.location.origin}${f.url.startsWith('/') ? '' : '/'}${f.url}`;
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error('Erro ao fazer upload das fotos');
    }
    
    return uploadedUrls;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError(undefined);
      setUploading(true);

      // Upload de fotos
      const photoUrls = await uploadPhotos();

      // Criar caso
      const caseData = {
        ...data,
        age: data.age ? Number(data.age) : undefined,
        photos: photoUrls,
      };

      await api.post('/missing-persons', caseData);
      
      setSuccess(true);
      setUploading(false);
      setShowSuccessModal(true);
      
      // Reset form
      reset();
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar caso. Tente novamente.');
      setUploading(false);
    }
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Por favor, faça login para reportar um desaparecimento.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Reportar Desaparecimento</h1>
        <p className="mt-2 text-slate-600">Preencha os dados da pessoa desaparecida</p>
      </div>

      {success && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Caso reportado com sucesso!</p>
            <p>O caso será revisado por um moderador antes de ser publicado.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Informações Pessoais</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('fullName', { required: 'Nome é obrigatório' })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nome completo"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Alcunha/Apelido
              </label>
              <input
                {...register('alias')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Como é conhecido"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Idade
              </label>
              <input
                type="number"
                {...register('age', { min: 0, max: 120 })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Idade aproximada"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Género *
              </label>
              <select
                {...register('gender', { required: true })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Informações do Desaparecimento</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Data do Desaparecimento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  {...register('missingDate', { required: 'Data é obrigatória' })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prioridade *
              </label>
              <select
                {...register('priority', { required: true })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="GERAL">Geral</option>
                <option value="CRIANCA">Criança</option>
                <option value="IDOSO">Idoso</option>
                <option value="DEFICIENCIA">Deficiência</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Último Local Visto *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                {...register('lastSeenLocation', { required: 'Local é obrigatório' })}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Endereço ou localização"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Província *
              </label>
              <select
                {...register('province', { required: 'Província é obrigatória' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Selecione uma província</option>
                {ANGOLA_PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Município
              </label>
              <input
                {...register('municipality')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Ex: Belas"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Descrição física, roupa que vestia, etc."
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Circunstâncias
            </label>
            <textarea
              {...register('circumstances')}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Como desapareceu, última vez visto, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Condições de Saúde
            </label>
            <textarea
              {...register('healthConditions')}
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Medicamentos, condições médicas, etc."
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Fotos</h2>
          <p className="text-sm text-slate-600 mb-4">
            Adicione até 5 fotos da pessoa desaparecida (máximo 5MB cada)
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {photoPreviews.map((preview, index) => {
              const previewKey = preview ? `preview-${index}-${preview.length}` : `preview-${index}`;
              return (
                <div key={previewKey} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                      onError={(e) => {
                        console.error('Erro ao carregar preview da imagem:', index, preview.substring(0, 50));
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Preview carregado com sucesso:', index);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Upload className="h-8 w-8" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg z-10"
                    title="Remover foto"
                    aria-label="Remover foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            
            {photoPreviews.length < 5 && (
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">Adicionar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isSubmitting || uploading) ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                {uploading ? 'Enviando fotos...' : 'Criando caso...'}
              </>
            ) : (
              'Reportar Desaparecimento'
            )}
          </button>
        </div>
      </form>

      <InfoModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/dashboard');
        }}
        title="Desaparecimento Reportado"
        message="Seu caso foi reportado com sucesso! Aguarde a aprovação de um moderador para que o caso seja publicado."
        variant="success"
      />
    </div>
  );
}

