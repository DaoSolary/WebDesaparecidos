import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { api } from '../api/client';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ForgotPasswordForm = {
  email: string;
};

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<ForgotPasswordForm>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError(undefined);
      setLoading(true);
      await api.post('/auth/forgot-password', { email: data.email });
      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao solicitar recuperação de senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    setSuccess(false);
    setError(undefined);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1">
                Recuperar Senha
              </h3>
              <p className="text-sm text-slate-600">
                Digite seu email cadastrado para receber instruções de recuperação
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Email enviado com sucesso!</p>
                  <p className="text-green-600">
                    Se o email estiver cadastrado, você receberá um link para recuperação de senha.
                    Verifique sua caixa de entrada e spam.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    {...register('email', { 
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="seu@email.com"
                    disabled={loading || isSubmitting}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading || isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(loading || isSubmitting) ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


