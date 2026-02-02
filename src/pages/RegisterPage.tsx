import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useState } from 'react';
import { UserPlus, CheckCircle2 } from 'lucide-react';

type RegisterForm = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
};

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: { role: 'CIDADAO' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values);
      setFeedback('Conta criada com sucesso! Redirecionando para login...');
      setTimeout(() => {
        navigate('/entrar');
      }, 2000);
    } catch (err: any) {
      setFeedback(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    }
  });

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Crie a sua conta</h2>
          <p className="mt-2 text-sm text-slate-500">Ganhe acesso ao painel, chat com familiares e missões de campo.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
              Nome completo
            </label>
            <input
              id="fullName"
              {...register('fullName', { required: 'Nome é obrigatório' })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { required: 'Email é obrigatório' })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Palavra-passe
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'Palavra-passe é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
              Contacto <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              id="phone"
              {...register('phone')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              placeholder="+244 912 345 678"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
              Perfil
            </label>
            <select
              id="role"
              {...register('role')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="CIDADAO">Cidadão</option>
              <option value="FAMILIAR">Familiar</option>
              <option value="VOLUNTARIO">Voluntário</option>
            </select>
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
                A criar conta...
              </span>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        {feedback && (
          <div className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm ${feedback.includes('sucesso') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {feedback.includes('sucesso') ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : null}
            <span>{feedback}</span>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

