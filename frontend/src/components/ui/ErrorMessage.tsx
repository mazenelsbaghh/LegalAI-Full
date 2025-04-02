import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 text-red-400 p-4 rounded-lg flex items-start gap-3"
    >
      <AlertTriangle className="w-5 h-5 mt-0.5" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline hover:text-red-300 transition-colors mt-2"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </motion.div>
  );
}