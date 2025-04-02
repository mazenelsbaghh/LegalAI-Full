import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
  light?: boolean;
}

export function LoadingOverlay({ message, light = false }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-dark-900/50 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" light={light} />
        {message && (
          <p className={light ? 'text-white' : 'text-gold-500'}>
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}