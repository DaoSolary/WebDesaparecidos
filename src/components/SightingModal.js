import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin, Camera } from 'lucide-react';
import { api } from '../api/client';
export function SightingModal({ isOpen, onClose, caseId, caseName, onSuccess }) {
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const fileInputRef = useRef(null);
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
    if (!isOpen)
        return null;
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0)
            return;
        // Validar que pelo menos uma foto foi selecionada
        if (photos.length + files.length === 0) {
            setLocationError('Pelo menos uma foto de evidência é obrigatória');
            return;
        }
        const newPhotos = [...photos, ...files];
        setPhotos(newPhotos);
        // Criar previews
        const newPreviews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target?.result);
                if (newPreviews.length === files.length) {
                    setPhotoPreviews([...photoPreviews, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    const removePhoto = (index) => {
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
        navigator.geolocation.getCurrentPosition((position) => {
            setValue('latitude', position.coords.latitude);
            setValue('longitude', position.coords.longitude);
            setLocationError('');
        }, (error) => {
            setLocationError('Erro ao obter localização: ' + error.message);
        });
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
            const photoUrls = uploadResponse.data.files?.map((f) => f.url) || [];
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
        }
        catch (error) {
            console.error('Erro ao reportar avistamento:', error);
            setLocationError(error.response?.data?.message || 'Erro ao reportar avistamento');
        }
        finally {
            setUploading(false);
        }
    });
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-slate-900", children: ["Reportar Avistamento - ", caseName] }), _jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Descri\u00E7\u00E3o do Avistamento *" }), _jsx("textarea", { ...register('description', { required: 'Descrição é obrigatória' }), rows: 4, className: "w-full rounded-lg border border-slate-300 px-3 py-2", placeholder: "Descreva onde e quando voc\u00EA avistou esta pessoa..." }), errors.description && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.description.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Localiza\u00E7\u00E3o do Avistamento *" }), _jsx("input", { ...register('location', { required: 'Localização é obrigatória' }), type: "text", className: "w-full rounded-lg border border-slate-300 px-3 py-2 mb-2", placeholder: "Ex: Rua Principal, Bairro Central, Luanda" }), errors.location && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.location.message })), _jsxs("button", { type: "button", onClick: getCurrentLocation, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700", children: [_jsx(MapPin, { className: "h-4 w-4" }), "Obter Minha Localiza\u00E7\u00E3o Atual"] }), watch('latitude') && watch('longitude') && (_jsxs("p", { className: "text-green-600 text-sm mt-2", children: ["\u2713 Localiza\u00E7\u00E3o obtida: ", watch('latitude')?.toFixed(6), ", ", watch('longitude')?.toFixed(6)] })), locationError && (_jsx("p", { className: "text-red-600 text-sm mt-2", children: locationError }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Prov\u00EDncia *" }), _jsx("input", { ...register('province', { required: 'Província é obrigatória' }), type: "text", className: "w-full rounded-lg border border-slate-300 px-3 py-2" }), errors.province && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.province.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Munic\u00EDpio *" }), _jsx("input", { ...register('municipality', { required: 'Município é obrigatório' }), type: "text", className: "w-full rounded-lg border border-slate-300 px-3 py-2" }), errors.municipality && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: errors.municipality.message }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Fotos de Evid\u00EAncia * (Obrigat\u00F3rio)" }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: handlePhotoChange, className: "hidden" }), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50", children: [_jsx(Camera, { className: "h-4 w-4" }), "Adicionar Fotos"] }), photos.length === 0 && (_jsx("p", { className: "text-red-600 text-sm mt-1", children: "Pelo menos uma foto \u00E9 obrigat\u00F3ria" })), photoPreviews.length > 0 && (_jsx("div", { className: "grid grid-cols-3 gap-4 mt-4", children: photoPreviews.map((preview, index) => (_jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-slate-200", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full h-full object-cover" }), _jsx("button", { type: "button", onClick: () => removePhoto(index), className: "absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700", children: _jsx(X, { className: "h-4 w-4" }) })] }, index))) }))] }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx("button", { type: "button", onClick: onClose, disabled: uploading, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: uploading || photos.length === 0 || !watch('latitude') || !watch('longitude'), className: "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: uploading ? 'Enviando...' : 'Reportar Avistamento' })] })] })] }) }) }));
}
