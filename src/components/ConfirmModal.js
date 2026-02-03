import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, AlertTriangle } from 'lucide-react';
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'info', children, }) {
    if (!isOpen)
        return null;
    const variantStyles = {
        danger: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-amber-600 hover:bg-amber-700 text-white',
        info: 'bg-blue-600 hover:bg-blue-700 text-white',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: onClose }), _jsx("div", { className: "relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-12 h-12 rounded-full ${variantStyles[variant]} flex items-center justify-center`, children: _jsx(AlertTriangle, { className: "h-6 w-6" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900 mb-2", children: title }), _jsx("p", { className: "text-sm text-slate-600", children: message }), children] }), _jsx("button", { onClick: onClose, className: "flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "mt-6 flex gap-3 justify-end", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors", children: cancelText }), _jsx("button", { onClick: () => {
                                        onConfirm();
                                        onClose();
                                    }, className: `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${buttonStyles[variant]}`, children: confirmText })] })] }) })] }));
}
