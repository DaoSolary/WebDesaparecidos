import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';
import { Upload, X, User, Calendar, MapPin, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { InfoModal } from '../components/InfoModal';
import { ANGOLA_PROVINCES } from '../utils/provinces';
export function CreateCasePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState();
    const [success, setSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { register, handleSubmit, reset, formState: { isSubmitting }, } = useForm({
        defaultValues: {
            gender: 'MASCULINO',
            priority: 'GERAL',
            province: user?.province || '',
        },
    });
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0)
            return;
        if (files.length + photos.length > 5) {
            alert('Máximo de 5 fotos permitidas');
            e.target.value = ''; // Reset input
            return;
        }
        const validFiles = [];
        const invalidFiles = [];
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
                const result = event.target?.result;
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
    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };
    const uploadPhotos = async () => {
        const uploadedUrls = [];
        if (photos.length === 0)
            return uploadedUrls;
        const formData = new FormData();
        photos.forEach((photo) => {
            formData.append('file', photo);
        });
        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.files && Array.isArray(data.files)) {
                return data.files.map((f) => {
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
        }
        catch (error) {
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
        }
        catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar caso. Tente novamente.');
            setUploading(false);
        }
    });
    if (!user) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-slate-600", children: "Por favor, fa\u00E7a login para reportar um desaparecimento." }) }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-4xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-slate-900", children: "Reportar Desaparecimento" }), _jsx("p", { className: "mt-2 text-slate-600", children: "Preencha os dados da pessoa desaparecida" })] }), success && (_jsxs("div", { className: "mb-6 flex items-start gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700", children: [_jsx(CheckCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Caso reportado com sucesso!" }), _jsx("p", { children: "O caso ser\u00E1 revisado por um moderador antes de ser publicado." })] })] })), error && (_jsxs("div", { className: "mb-6 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-6", children: [_jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6 space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Informa\u00E7\u00F5es Pessoais" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Nome Completo *" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { ...register('fullName', { required: 'Nome é obrigatório' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Nome completo" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Alcunha/Apelido" }), _jsx("input", { ...register('alias'), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Como \u00E9 conhecido" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Idade" }), _jsx("input", { type: "number", ...register('age', { min: 0, max: 120 }), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Idade aproximada" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "G\u00E9nero *" }), _jsxs("select", { ...register('gender', { required: true }), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "MASCULINO", children: "Masculino" }), _jsx("option", { value: "FEMININO", children: "Feminino" }), _jsx("option", { value: "OUTRO", children: "Outro" })] })] })] })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6 space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Informa\u00E7\u00F5es do Desaparecimento" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Data do Desaparecimento *" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "date", ...register('missingDate', { required: 'Data é obrigatória' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Prioridade *" }), _jsxs("select", { ...register('priority', { required: true }), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "GERAL", children: "Geral" }), _jsx("option", { value: "CRIANCA", children: "Crian\u00E7a" }), _jsx("option", { value: "IDOSO", children: "Idoso" }), _jsx("option", { value: "DEFICIENCIA", children: "Defici\u00EAncia" }), _jsx("option", { value: "URGENTE", children: "Urgente" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "\u00DAltimo Local Visto *" }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }), _jsx("input", { ...register('lastSeenLocation', { required: 'Local é obrigatório' }), className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Endere\u00E7o ou localiza\u00E7\u00E3o" })] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Prov\u00EDncia *" }), _jsxs("select", { ...register('province', { required: 'Província é obrigatória' }), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "", children: "Selecione uma prov\u00EDncia" }), ANGOLA_PROVINCES.map((province) => (_jsx("option", { value: province, children: province }, province)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Munic\u00EDpio" }), _jsx("input", { ...register('municipality'), className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Ex: Belas" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Descri\u00E7\u00E3o" }), _jsxs("div", { className: "relative", children: [_jsx(FileText, { className: "absolute left-3 top-3 h-5 w-5 text-slate-400" }), _jsx("textarea", { ...register('description'), rows: 4, className: "w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Descri\u00E7\u00E3o f\u00EDsica, roupa que vestia, etc." })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Circunst\u00E2ncias" }), _jsx("textarea", { ...register('circumstances'), rows: 3, className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Como desapareceu, \u00FAltima vez visto, etc." })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Condi\u00E7\u00F5es de Sa\u00FAde" }), _jsx("textarea", { ...register('healthConditions'), rows: 2, className: "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20", placeholder: "Medicamentos, condi\u00E7\u00F5es m\u00E9dicas, etc." })] })] }), _jsxs("div", { className: "rounded-lg border border-slate-200 bg-white p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900 mb-4", children: "Fotos" }), _jsx("p", { className: "text-sm text-slate-600 mb-4", children: "Adicione at\u00E9 5 fotos da pessoa desaparecida (m\u00E1ximo 5MB cada)" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [photoPreviews.map((preview, index) => {
                                        const previewKey = preview ? `preview-${index}-${preview.length}` : `preview-${index}`;
                                        return (_jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100", children: [preview ? (_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full h-full object-cover", style: { display: 'block' }, onError: (e) => {
                                                        console.error('Erro ao carregar preview da imagem:', index, preview.substring(0, 50));
                                                        e.currentTarget.style.display = 'none';
                                                    }, onLoad: () => {
                                                        console.log('Preview carregado com sucesso:', index);
                                                    } })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-slate-400", children: _jsx(Upload, { className: "h-8 w-8" }) })), _jsx("button", { type: "button", onClick: () => removePhoto(index), className: "absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg z-10", title: "Remover foto", "aria-label": "Remover foto", children: _jsx(X, { className: "h-4 w-4" }) })] }, previewKey));
                                    }), photoPreviews.length < 5 && (_jsxs("label", { className: "aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors", children: [_jsx(Upload, { className: "h-8 w-8 text-slate-400 mb-2" }), _jsx("span", { className: "text-sm text-slate-600", children: "Adicionar Foto" }), _jsx("input", { type: "file", accept: "image/*", onChange: handlePhotoChange, className: "hidden", multiple: true })] }))] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { type: "button", onClick: () => navigate('/dashboard'), className: "px-6 py-3 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: isSubmitting || uploading, className: "flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: (isSubmitting || uploading) ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "h-5 w-5 animate-spin" }), uploading ? 'Enviando fotos...' : 'Criando caso...'] })) : ('Reportar Desaparecimento') })] })] }), _jsx(InfoModal, { isOpen: showSuccessModal, onClose: () => {
                    setShowSuccessModal(false);
                    navigate('/dashboard');
                }, title: "Desaparecimento Reportado", message: "Seu caso foi reportado com sucesso! Aguarde a aprova\u00E7\u00E3o de um moderador para que o caso seja publicado.", variant: "success" })] }));
}
