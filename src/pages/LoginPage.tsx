import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useState, useEffect } from 'react';
import { AlertCircle, LogIn, Mail, Lock, CheckCircle } from 'lucide-react';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { InfoModal } from '../components/InfoModal';

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  // Atualizar nome do usuário quando o user mudar
  useEffect(() => {
    if (user?.fullName && success) {
      setUserName(user.fullName);
    }
  }, [user, success]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(undefined);
      setSuccess(false);
      await login(values.email, values.password);
      setSuccess(true);
      // Aguardar um pouco para o fetchUser completar
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err: any) {
      setSuccess(false);
      // Verificar se o usuário está bloqueado
      if (err.response?.data?.blocked) {
        setBlockedReason(err.response?.data?.reason || 'Usuário bloqueado pelo administrador');
        setShowBlockedModal(true);
        setError(undefined);
      } else {
        setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
    }
  });

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Entrar na sua conta</h2>
          <p className="mt-2 text-sm text-slate-500">Acesse o painel e contribua para localizar pessoas desaparecidas</p>
        </div>

        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              Bem vindo {userName || user?.fullName || 'ao sistema'} ao sistema! Redirecionando...
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email é obrigatório' })}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Palavra-passe
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Palavra-passe é obrigatória' })}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                A entrar...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Não tem conta?{' '}
            <Link to="/registar" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Crie uma conta
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="text-xs text-center text-slate-500">
            Ao entrar, você concorda com nossos{' '}
            <Link to="/termos" className="text-blue-600 hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacidade" className="text-blue-600 hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      {/* Modal de Usuário Bloqueado */}
      <InfoModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title="Usuário Bloqueado"
        message={
          <div>
            <p className="mb-2">Sua conta foi bloqueada pelo administrador.</p>
            {blockedReason && (
              <p className="mb-2 text-sm text-slate-600">
                <strong>Motivo:</strong> {blockedReason}
              </p>
            )}
            <p className="text-sm text-slate-600">
              Entre em contacto com o suporte para mais informações.
            </p>
          </div>
        }
        variant="warning"
      />
    </div>
  );
}


