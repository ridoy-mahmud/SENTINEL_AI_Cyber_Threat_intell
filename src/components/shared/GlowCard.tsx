import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'red' | 'green' | 'amber';
  hover?: boolean;
  header?: ReactNode;
}

const glowMap = {
  cyan: 'hover:shadow-glow-cyan hover:border-primary/40',
  red: 'hover:shadow-glow-red hover:border-destructive/40',
  green: 'hover:shadow-glow-green hover:border-success/40',
  amber: 'hover:shadow-glow-amber hover:border-warning/40',
};

export function GlowCard({ children, className = '', glowColor = 'cyan', hover = true, header }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        bg-card/80 backdrop-blur-xl border border-border rounded-sm
        transition-all duration-150
        ${hover ? glowMap[glowColor] : ''}
        ${className}
      `}
    >
      {header && (
        <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center gap-2">
          {header}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}
