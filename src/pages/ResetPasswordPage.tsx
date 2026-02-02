import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, Loader } from 'lucide-react';

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userEmail, setUserEmail] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Token não fornecido. Verifique o link do email.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/auth/reset-password/${token}`);
        if (data.valid === true) {
          setValidToken(true);
          setUserEmail(data.email);
        } else {
          setTokenError(data.message || 'Token inválido ou expirado.');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 
          err.response?.data?.valid === false 
            ? err.response?.data?.message 
            : 'Token inválido ou expirado. Solicite um novo link de recuperação.';
        setTokenError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (data.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setError(undefined);
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/entrar');
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Erro ao redefinir senha. O token pode ter expirado. Solicite um novo link.'
      );
    }
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="text-center text-slate-600">Validando token...</p>
        </div>
      </div>
    );
  }

  if (tokenError || !validToken) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Token Inválido</h2>
            <p className="mt-2 text-sm text-slate-500">
              {tokenError || 'O link de recuperação não é válido ou expirou.'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">O que fazer agora?</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Verifique se copiou o link completo do email</li>
                <li>Os links expiram após 1 hora</li>
                <li>Solicite um novo link de recuperação</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link
                to="/entrar"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Voltar ao Login
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Senha Redefinida!</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            <p className="font-medium">Próximos passos:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-green-600">
              <li>Use sua nova senha para fazer login</li>
              <li>Mantenha sua senha segura</li>
            </ul>
          </div>

          <Link
            to="/entrar"
            className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Redefinir Senha</h2>
          <p className="mt-2 text-sm text-slate-500">
            {userEmail && (
              <span>Defina uma nova senha para <strong>{userEmail}</strong></span>
            )}
            {!userEmail && 'Defina uma nova senha para sua conta'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: 'Senha é obrigatória',
                  minLength: { 
                    value: 6, 
                    message: 'A senha deve ter pelo menos 6 caracteres' 
                  }
                })}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', { 
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) => 
                    value === password || 'As senhas não coincidem'
                })}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                Redefinindo...
              </span>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/entrar"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  );
}

