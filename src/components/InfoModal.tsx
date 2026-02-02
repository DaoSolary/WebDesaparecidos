import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode;
  variant?: 'success' | 'info' | 'warning';
  children?: React.ReactNode;
};

export function InfoModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  children,
}: InfoModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const Icon = variant === 'success' ? CheckCircle : variant === 'warning' ? AlertCircle : Info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full z-10">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${variantStyles[variant]} flex items-center justify-center`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              {typeof message === 'string' ? (
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {message}
                </p>
              ) : (
                <div className="text-sm text-slate-600">
                  {message}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {children || (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

