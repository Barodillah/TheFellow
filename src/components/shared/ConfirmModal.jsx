import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger', // 'danger' | 'warning' | 'primary' | 'success'
    icon: CustomIcon,
    onConfirm,
    onCancel,
    isLoading = false
}) {
    if (!isOpen) return null;

    let Icon = CustomIcon;
    let iconBg = 'bg-red-100 text-red-500';
    let confirmBtnClass = 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20';

    if (variant === 'danger') {
        Icon = Icon || Trash2;
        iconBg = 'bg-red-100 text-red-500';
        confirmBtnClass = 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20';
    } else if (variant === 'warning') {
        Icon = Icon || AlertTriangle;
        iconBg = 'bg-amber-100 text-amber-600';
        confirmBtnClass = 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20';
    } else if (variant === 'primary') {
        Icon = Icon || HelpCircle;
        iconBg = 'bg-primary/10 text-primary';
        confirmBtnClass = 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20';
    } else if (variant === 'success') {
        Icon = Icon || CheckCircle;
        iconBg = 'bg-green-100 text-green-600';
        confirmBtnClass = 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20';
    }

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBg}`}>
                    <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${confirmBtnClass}`}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }
    return modalContent;
}
