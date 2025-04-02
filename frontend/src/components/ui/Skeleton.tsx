import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  height?: string | number;
}

export function Skeleton({ className = '', height = '1rem' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-dark-700/50 rounded-lg ${className}`}
      style={{ height }}
      animate={{ opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}