import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ show, message, type = 'success', onClose }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-between min-w-[300px] shadow-2xl rounded-xl overflow-hidden"
                >
                    <div className={`flex items-center space-x-3 p-4 w-full ${
                        type === 'success' 
                            ? 'bg-white text-gray-800 border-l-4 border-green-500' 
                            : 'bg-white text-gray-800 border-l-4 border-red-500'
                    }`}>
                        {type === 'success' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        )}
                        <p className="font-medium text-sm flex-1">{message}</p>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
