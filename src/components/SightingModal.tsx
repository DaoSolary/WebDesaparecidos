import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, MapPin, Camera } from 'lucide-react';
import { api } from '../api/client';

type SightingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseName: string;
  onSuccess: () => void;
};

type SightingFormData = {
  description: string;
  province: string;
  municipality: string;
  location: string;
  latitude?: number;
  longitude?: number;
};

export function SightingModal({ isOpen, onClose, caseId, caseName, onSuccess }: SightingModalProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<SightingFormData>();

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validar que pelo menos uma foto foi selecionada
    if (photos.length + files.length === 0) {
      setLocationError('Pelo menos uma foto de evidência é obrigatória');
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Criar previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setPhotoPreviews([...photoPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada pelo navegador');
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude);
        setValue('longitude', position.coords.longitude);
        setLocationError('');
      },
      (error) => {
        setLocationError('Erro ao obter localização: ' + error.message);
      }
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    if (photos.length === 0) {
      setLocationError('Pelo menos uma foto de evidência é obrigatória');
      return;
    }

    if (!data.latitude || !data.longitude) {
      setLocationError('Por favor, obtenha sua localização atual');
      return;
    }

    setUploading(true);
    try {
      // Upload das fotos primeiro
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('file', photo);
      });
      
      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const photoUrls = uploadResponse.data.files?.map((f: any) => f.url) || [];

      // Criar avistamento com as URLs das fotos
      const sightingData = {
        ...data,
        evidenceUrl: photoUrls[0] || '', // Primeira foto como evidência principal
      };

      await api.post(`/sightings/${caseId}`, sightingData);
      
      // Limpar formulário
      reset();
      setPhotos([]);
      setPhotoPreviews([]);
      setLocationError('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao reportar avistamento:', error);
      setLocationError(error.response?.data?.message || 'Erro ao reportar avistamento');
    } finally {
      setUploading(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Reportar Avistamento - {caseName}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descrição do Avistamento *
              </label>
              <textarea
                {...register('description', { required: 'Descrição é obrigatória' })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Descreva onde e quando você avistou esta pessoa..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Localização do Avistamento *
              </label>
              <input
                {...register('location', { required: 'Localização é obrigatória' })}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-2"
                placeholder="Ex: Rua Principal, Bairro Central, Luanda"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
              )}
              
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                <MapPin className="h-4 w-4" />
                Obter Minha Localização Atual
              </button>
              {watch('latitude') && watch('longitude') && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Localização obtida: {watch('latitude')?.toFixed(6)}, {watch('longitude')?.toFixed(6)}
                </p>
              )}
              {locationError && (
                <p className="text-red-600 text-sm mt-2">{locationError}</p>
              )}
            </div>

            {/* Província e Município */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Província *
                </label>
                <input
                  {...register('province', { required: 'Província é obrigatória' })}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {errors.province && (
                  <p className="text-red-600 text-sm mt-1">{errors.province.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Município *
                </label>
                <input
                  {...register('municipality', { required: 'Município é obrigatório' })}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {errors.municipality && (
                  <p className="text-red-600 text-sm mt-1">{errors.municipality.message}</p>
                )}
              </div>
            </div>

            {/* Fotos de Evidência */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fotos de Evidência * (Obrigatório)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                <Camera className="h-4 w-4" />
                Adicionar Fotos
              </button>
              {photos.length === 0 && (
                <p className="text-red-600 text-sm mt-1">Pelo menos uma foto é obrigatória</p>
              )}
              
              {/* Preview das fotos */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading || photos.length === 0 || !watch('latitude') || !watch('longitude')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Enviando...' : 'Reportar Avistamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

