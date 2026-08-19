import { X, AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
}) => {
  if (!isOpen) return null;

  const confirmBtn = {
    danger:  "btn-danger",
    warning: "flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md",
    primary: "btn-primary",
  };

  const iconColor = {
    danger:  "text-red-500 bg-red-50 dark:bg-red-900/20",
    warning: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    primary: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/80 dark:border-gray-700/60
        bg-white dark:bg-gray-900 shadow-2xl animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconColor[confirmVariant]}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="icon-btn">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200/80 dark:border-gray-700/50 px-5 py-4">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 ${confirmBtn[confirmVariant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;