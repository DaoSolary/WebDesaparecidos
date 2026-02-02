import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Map, Users, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/useAuth';
import { useState } from 'react';

const features = [
  {
    icon: AlertTriangle,
    title: 'Alertas instantâneos',
    description: 'Notificações push por proximidade e filtros personalizados.',
    route: '/alertas',
    allowedRoles: ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'AUTORIDADE', 'ADMIN'],
  },
  {
    icon: Map,
    title: 'Geolocalização inteligente',
    description: 'Heatmap, últimas coordenadas e áreas sugeridas de busca.',
    route: '/geolocalizacao',
    allowedRoles: ['AUTORIDADE', 'ADMIN', 'MODERADOR'],
  },
  {
    icon: Users,
    title: 'Rede colaborativa',
    description: 'Familiares, cidadãos e autoridades conectados em um único canal.',
    route: '/rede-colaborativa',
    allowedRoles: ['CIDADAO', 'FAMILIAR', 'VOLUNTARIO', 'MODERADOR', 'AUTORIDADE', 'ADMIN'],
  },
];

type LoginForm = {
  email: string;
  password: string;
};

export function HomePage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(undefined);
      await login(values.email, values.password);
      navigate('/casos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  });

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Plataforma Nacional
          </span>
          <h1 className="text-4xl font-bold text-slate-900">
            Base de Dados de Pessoas Desaparecidas
          </h1>
          <p className="text-lg text-slate-600">
            Centralizamos denúncias, investigamos padrões e coordenamos missões de campo para acelerar a localização de
            pessoas desaparecidas em todo o país.
          </p>
          <div className="flex gap-4">
            <Link to="/entrar" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
              Entrar
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Acesso rápido</h3>
            <p className="text-sm text-slate-500">Faça login para acessar todas as funcionalidades</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="home-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="home-email"
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="home-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="home-password"
                  type="password"
                  {...register('password', { required: true })}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  A entrar...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Não tem conta?{' '}
              <Link to="/registar" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Crie uma conta
              </Link>
            </p>
          </div>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => {
          const hasAccess = !user || feature.allowedRoles.includes(user.role as any);
          
          return (
            <Link
              key={feature.title}
              to={hasAccess ? feature.route : '/entrar'}
              className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all ${
                hasAccess
                  ? 'hover:shadow-md hover:border-blue-300 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <feature.icon className="h-8 w-8 text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
              {!hasAccess && user && (
                <p className="mt-2 text-xs text-amber-600">Acesso restrito ao seu perfil</p>
              )}
              {!user && (
                <p className="mt-2 text-xs text-blue-600">Faça login para acessar</p>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

