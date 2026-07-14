import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

type FocusCardProps = {
  label: string;
  value: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
  index: number;
};

export function FocusCard({ label, value, color, icon: Icon, index }: FocusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.35 }}
      className="rounded-[1.7rem] border border-ink/8 bg-white/72 p-4 dark:border-white/10 dark:bg-white/8"
    >
      <div className={cn('grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white', color)}>
        <Icon className="size-5" />
      </div>
      <p className="m-0 mt-4 text-3xl font-black">{value}</p>
      <p className="m-0 text-sm font-bold text-ink/50 dark:text-white/50">{label}</p>
    </motion.div>
  );
}
