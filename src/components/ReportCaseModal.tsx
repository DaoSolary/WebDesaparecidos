import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../api/client';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

type ReportCaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseName: string;
};

type ReportForm = {
  reason: string;
  description: string;
};

export function ReportCaseModal({ isOpen, onClose, caseId, caseName }: ReportCaseModalProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<ReportForm>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError(undefined);
      await api.post('/reports', {
        missingPersonId: caseId,
        ...data,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao reportar caso. Tente novamente.');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Denunciar Caso
              </h3>
              <p className="text-sm text-slate-600">
                Reportar: <strong>{caseName}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {success ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p>Denúncia enviada com sucesso. Será analisada por um moderador.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Motivo da Denúncia *
                </label>
                <select
                  {...register('reason', { required: 'Motivo é obrigatório' })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Selecione um motivo</option>
                  <option value="Caso falso ou fraudulento">Caso falso ou fraudulento</option>
                  <option value="Informações incorretas">Informações incorretas</option>
                  <option value="Foto não corresponde">Foto não corresponde</option>
                  <option value="Spam ou abuso">Spam ou abuso</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descrição *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Descrição é obrigatória',
                    minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                  })}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Descreva o motivo da denúncia em detalhes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


