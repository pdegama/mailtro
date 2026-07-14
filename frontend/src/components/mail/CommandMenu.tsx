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
          className="fixed inset-0 z-40 bg-ink/20 p-3 backdrop-blur-sm dark:bg-black/32"
          onMouseDown={onClose}
        >
          <motion.section
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="mx-auto mt-16 w-[min(680px,calc(100%-20px))] overflow-hidden rounded-[1.4rem] border border-ink/8 bg-white text-ink shadow-[0_30px_100px_-52px_rgba(18,24,38,0.75)] dark:border-white/10 dark:bg-[#1c2532] dark:text-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-wide text-ink/44 dark:text-white/44">Command center</p>
                  <h2 className="m-0 mt-1 text-2xl font-black">Jump, route, or clean up mail</h2>
                  <p className="m-0 mt-2 text-sm font-medium text-ink/48 dark:text-white/48">
                    Press <kbd className="rounded-md bg-ink/[0.055] px-1.5 py-0.5 text-ink/60 dark:bg-white/10 dark:text-white/70">M</kbd> anywhere to open this palette.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-9 place-items-center rounded-full text-ink/45 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>

              <label className="mt-5 flex min-h-12 items-center gap-3 rounded-xl border border-ink/8 bg-ink/[0.025] px-4 text-ink dark:border-white/10 dark:bg-white/[0.045] dark:text-white">
                <Search className="size-5 text-ink/36 dark:text-white/36" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-ink/32 dark:placeholder:text-white/32"
                  placeholder="Find a person, route, receipt, source, or command..."
                />
              </label>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {commandTiles.map((tile) => (
                  <button
                    key={tile.label}
                    type="button"
                    onClick={() => onNavigate(tile.view)}
                    className="group relative min-h-24 overflow-hidden rounded-xl border border-ink/8 bg-white p-4 text-left transition hover:border-ink/14 hover:bg-ink/[0.025] dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
                  >
                    <span className="relative flex items-center justify-between">
                      <span className="grid size-9 place-items-center rounded-full bg-ink/[0.055] text-ink/60 dark:bg-white/10 dark:text-white/68">
                        <tile.icon className="size-5" />
                      </span>
                      <span className="rounded-md bg-ink/[0.045] px-2 py-1 text-xs font-semibold text-ink/42 dark:bg-white/8 dark:text-white/42">
                        {tile.shortcut}
                      </span>
                    </span>
                    <span className="relative mt-4 block text-sm font-semibold">{tile.label}</span>
                    <span className="relative mt-1 block text-xs font-medium text-ink/40 dark:text-white/40">
                      Open workspace
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-ink/8 bg-ink/[0.018] p-3 dark:border-white/10 dark:bg-white/[0.025]">
                  <h3 className="m-0 px-2 py-1 text-xs font-bold uppercase tracking-wide text-ink/42 dark:text-white/42">Routes</h3>
                  <div className="mt-1 space-y-1">
                    {labels.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2 text-left text-sm font-medium text-ink/64 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/64 dark:hover:bg-white/8 dark:hover:text-white"
                      >
                        <item.icon className="size-4 text-ink/40 dark:text-white/40" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-ink/8 bg-ink/[0.018] p-3 dark:border-white/10 dark:bg-white/[0.025]">
                  <h3 className="m-0 px-2 py-1 text-xs font-bold uppercase tracking-wide text-ink/42 dark:text-white/42">Utilities</h3>
                  <div className="mt-1 space-y-1">
                    {otherStuff.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2 text-left text-sm font-medium text-ink/64 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/64 dark:hover:bg-white/8 dark:hover:text-white"
                      >
                        <item.icon className="size-4 text-ink/40 dark:text-white/40" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
