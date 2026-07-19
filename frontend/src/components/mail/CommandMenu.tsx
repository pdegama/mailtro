import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { AppView } from '../../data/imbox';
import { commandTiles, labels, otherStuff } from '../../data/imbox';

type CommandMenuProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
};

export function CommandMenu({ open, onClose, onNavigate }: CommandMenuProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-ink/25 p-3 backdrop-blur-sm dark:bg-black/45"
          onMouseDown={onClose}
        >
          <motion.section
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="mx-auto mt-12 w-full max-w-[720px] overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white text-ink shadow-[0_28px_90px_-48px_rgba(18,24,38,0.7)] dark:border-white/10 dark:bg-[#141a24] dark:text-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-ink/40 dark:text-white/40">
                    Jump
                  </p>
                  <h2 className="m-0 mt-1 text-xl font-black">Where to?</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-9 place-items-center rounded-full text-ink/45 transition hover:bg-ink/[0.05] dark:text-white/45 dark:hover:bg-white/8"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>

              <label className="mt-4 flex min-h-11 items-center gap-2.5 rounded-xl border border-ink/8 bg-ink/[0.025] px-3.5 text-ink dark:border-white/10 dark:bg-white/[0.045] dark:text-white">
                <Search className="size-4 text-ink/36 dark:text-white/36" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-ink/32 dark:placeholder:text-white/32"
                  placeholder="Find a view…"
                  autoFocus
                />
              </label>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {commandTiles.map((tile) => (
                  <button
                    key={tile.label}
                    type="button"
                    onClick={() => onNavigate(tile.view)}
                    className="min-h-[4.75rem] rounded-xl border border-ink/8 bg-white p-3 text-left transition hover:border-ink/14 hover:bg-ink/[0.025] dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
                  >
                    <span className="flex items-center justify-between">
                      <span className="grid size-8 place-items-center rounded-full bg-ink/[0.055] text-ink/60 dark:bg-white/10 dark:text-white/68">
                        <tile.icon className="size-4" />
                      </span>
                      <span className="rounded-md bg-ink/[0.045] px-1.5 py-0.5 text-[11px] font-semibold text-ink/42 dark:bg-white/8 dark:text-white/42">
                        {tile.shortcut}
                      </span>
                    </span>
                    <span className="mt-2.5 block text-sm font-semibold">{tile.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-ink/8 bg-ink/[0.018] p-2 dark:border-white/10 dark:bg-white/[0.025]">
                  <h3 className="m-0 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/42 dark:text-white/42">
                    Labels
                  </h3>
                  {labels.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left text-sm font-medium text-ink/64 transition hover:bg-ink/[0.045] dark:text-white/64 dark:hover:bg-white/8"
                    >
                      <item.icon className="size-3.5 text-ink/40 dark:text-white/40" />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-ink/8 bg-ink/[0.018] p-2 dark:border-white/10 dark:bg-white/[0.025]">
                  <h3 className="m-0 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink/42 dark:text-white/42">
                    Other
                  </h3>
                  {otherStuff.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left text-sm font-medium text-ink/64 transition hover:bg-ink/[0.045] dark:text-white/64 dark:hover:bg-white/8"
                    >
                      <item.icon className="size-3.5 text-ink/40 dark:text-white/40" />
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onNavigate('screener')}
                    className="flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left text-sm font-medium text-ink/64 transition hover:bg-ink/[0.045] dark:text-white/64 dark:hover:bg-white/8"
                  >
                    The Screener
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
