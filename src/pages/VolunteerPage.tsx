import { useForm } from 'react-hook-form';
import { api } from '../api/client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

type MissionForm = {
  title: string;
  description?: string;
  province: string;
  municipality?: string;
  startsAt?: string;
};

export function VolunteerPage() {
  const { register, handleSubmit, reset } = useForm<MissionForm>();
  const [success, setSuccess] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    await api.post('/volunteers/missions', values);
    setSuccess(true);
    reset();
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Rede de voluntários</h2>
        <p className="mt-2 text-sm text-slate-500">
          Registe missões, defina zonas de busca e convide voluntários para check-ins no terreno. Essas missões são
          sincronizadas com o app mobile para operação offline.
        </p>
        <ul className="mt-6 space-y-4 text-sm text-slate-600">
          <li>• Check-in georreferenciado para cada equipe.</li>
          <li>• Partilha de rotas e checkpoints prioritários.</li>
          <li>• Botão SOS com ligação direta para linha de emergência.</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Criar missão de busca</h3>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input {...register('title', { required: true })} placeholder="Título da missão" className="w-full rounded-lg border border-slate-200 p-3" />
          <textarea {...register('description')} placeholder="Descrição / instruções" className="w-full rounded-lg border border-slate-200 p-3" />
          <div className="grid gap-3 md:grid-cols-2">
            <input {...register('province', { required: true })} placeholder="Província" className="rounded-lg border border-slate-200 p-3" />
            <input {...register('municipality')} placeholder="Município" className="rounded-lg border border-slate-200 p-3" />
          </div>
          <input type="datetime-local" {...register('startsAt')} className="w-full rounded-lg border border-slate-200 p-3" />
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">
            Publicar missão
          </button>
        </form>
        {success && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Missão publicada para a rede de voluntários.
          </p>
        )}
      </div>
    </div>
  );
}


