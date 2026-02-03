import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
export function ShareButtons({ caseData }) {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/casos/${caseData.id}`;
    const text = `Pessoa Desaparecida: ${caseData.fullName} - Último local: ${caseData.lastSeenLocation}`;
    const imageUrl = caseData.photos?.[0]?.url || '';
    const shareToFacebook = () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };
    const shareToTwitter = () => {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };
    const shareToWhatsApp = () => {
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
        window.open(shareUrl, '_blank');
    };
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            console.error('Erro ao copiar link:', error);
        }
    };
    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Desaparecido: ${caseData.fullName}`,
                    text,
                    url,
                });
            }
            catch (error) {
                // Usuário cancelou ou erro
            }
        }
    };
    return (_jsxs("div", { className: "flex flex-wrap gap-2", children: [typeof navigator.share === 'function' && (_jsxs("button", { onClick: nativeShare, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors", children: [_jsx(Share2, { className: "h-4 w-4" }), "Partilhar"] })), _jsxs("button", { onClick: shareToFacebook, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] transition-colors", children: [_jsx(Facebook, { className: "h-4 w-4" }), "Facebook"] }), _jsxs("button", { onClick: shareToTwitter, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2] text-white font-semibold hover:bg-[#1a8cd8] transition-colors", children: [_jsx(Twitter, { className: "h-4 w-4" }), "Twitter"] }), _jsxs("button", { onClick: shareToWhatsApp, className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white font-semibold hover:bg-[#20BA5A] transition-colors", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), "WhatsApp"] }), _jsx("button", { onClick: copyLink, className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors", children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "h-4 w-4" }), "Copiado!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "h-4 w-4" }), "Copiar Link"] })) })] }));
}
