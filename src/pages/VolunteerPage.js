import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { api } from '../api/client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
export function VolunteerPage() {
    const { register, handleSubmit, reset } = useForm();
    const [success, setSuccess] = useState(false);
    const onSubmit = handleSubmit(async (values) => {
        await api.post('/volunteers/missions', values);
        setSuccess(true);
        reset();
    });
    return (_jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h2", { className: "text-2xl font-semibold text-slate-900", children: "Rede de volunt\u00E1rios" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Registe miss\u00F5es, defina zonas de busca e convide volunt\u00E1rios para check-ins no terreno. Essas miss\u00F5es s\u00E3o sincronizadas com o app mobile para opera\u00E7\u00E3o offline." }), _jsxs("ul", { className: "mt-6 space-y-4 text-sm text-slate-600", children: [_jsx("li", { children: "\u2022 Check-in georreferenciado para cada equipe." }), _jsx("li", { children: "\u2022 Partilha de rotas e checkpoints priorit\u00E1rios." }), _jsx("li", { children: "\u2022 Bot\u00E3o SOS com liga\u00E7\u00E3o direta para linha de emerg\u00EAncia." })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Criar miss\u00E3o de busca" }), _jsxs("form", { onSubmit: onSubmit, className: "mt-4 space-y-3", children: [_jsx("input", { ...register('title', { required: true }), placeholder: "T\u00EDtulo da miss\u00E3o", className: "w-full rounded-lg border border-slate-200 p-3" }), _jsx("textarea", { ...register('description'), placeholder: "Descri\u00E7\u00E3o / instru\u00E7\u00F5es", className: "w-full rounded-lg border border-slate-200 p-3" }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsx("input", { ...register('province', { required: true }), placeholder: "Prov\u00EDncia", className: "rounded-lg border border-slate-200 p-3" }), _jsx("input", { ...register('municipality'), placeholder: "Munic\u00EDpio", className: "rounded-lg border border-slate-200 p-3" })] }), _jsx("input", { type: "datetime-local", ...register('startsAt'), className: "w-full rounded-lg border border-slate-200 p-3" }), _jsx("button", { type: "submit", className: "w-full rounded-xl bg-blue-600 py-3 font-semibold text-white", children: "Publicar miss\u00E3o" })] }), success && (_jsxs("p", { className: "mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700", children: [_jsx(CheckCircle2, { className: "h-4 w-4" }), " Miss\u00E3o publicada para a rede de volunt\u00E1rios."] }))] })] }));
}
