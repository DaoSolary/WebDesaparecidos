import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';
export function InfoModal({ isOpen, onClose, title, message, variant = 'info', children, }) {
    if (!isOpen)
        return null;
    const variantStyles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
    };
    const Icon = variant === 'success' ? CheckCircle : variant === 'warning' ? AlertCircle : Info;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: onClose }), _jsx("div", { className: "relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-12 h-12 rounded-full ${variantStyles[variant]} flex items-center justify-center`, children: _jsx(Icon, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-2", children: title }), typeof message === 'string' ? (_jsx("p", { className: "text-sm text-slate-600 whitespace-pre-line", children: message })) : (_jsx("div", { className: "text-sm text-slate-600", children: message }))] }), _jsx("button", { onClick: onClose, className: "flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors", children: _jsx(X, { className: "h-5 w-5" }) })] }), children || (_jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { onClick: onClose, className: "px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors", children: "Entendi" }) }))] }) })] }));
}
