import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export function LoadingSpinner({ size = 'md', light = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variants = {
    rotate: {
      rotate: 360
    }
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full border-2 ${
        light ? 'border-white/20 border-t-white' : 'border-gold-500/20 border-t-gold-500'
      }`}
      variants={variants}
      animate="rotate"
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}