import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, Send, Trash2, Type, X } from 'lucide-react';

type ComposePanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ComposePanel({ open, onClose }: ComposePanelProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm dark:bg-black/50"
        >
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="mx-auto mt-8 flex min-h-[72vh] w-full max-w-4xl flex-col rounded-[1.4rem] border border-ink/8 bg-white shadow-[0_28px_100px_-50px_rgba(18,24,38,0.75)] dark:border-white/10 dark:bg-[#1c2532]"
          >
            <header className="flex items-center justify-between border-b border-ink/8 px-5 py-4 dark:border-white/10">
              <h2 className="m-0 text-base font-semibold text-ink dark:text-white">New message</h2>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full text-ink/45 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white"
                aria-label="Close compose"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 px-5 py-3">
              <label className="grid min-h-12 grid-cols-[72px_minmax(0,1fr)_auto] items-center border-b border-ink/8 text-sm dark:border-white/10">
                <span className="font-semibold text-ink/45 dark:text-white/45">To</span>
                <input
                  className="min-w-0 bg-transparent text-ink outline-none placeholder:text-ink/32 dark:text-white dark:placeholder:text-white/32"
                  placeholder="name@example.com"
                />
                <button type="button" className="font-semibold text-ink/40 transition hover:text-ink dark:text-white/40 dark:hover:text-white">
                  Cc/Bcc
                </button>
              </label>
              <label className="grid min-h-12 grid-cols-[72px_minmax(0,1fr)] items-center border-b border-ink/8 text-sm dark:border-white/10">
                <span className="font-semibold text-ink/45 dark:text-white/45">Subject</span>
                <input
                  className="min-w-0 bg-transparent text-ink outline-none placeholder:text-ink/32 dark:text-white dark:placeholder:text-white/32"
                  placeholder="Subject"
                />
              </label>
              <textarea
                className="min-h-[360px] w-full resize-none bg-transparent py-5 text-base leading-7 text-ink outline-none placeholder:text-ink/32 dark:text-white dark:placeholder:text-white/32"
                placeholder="Write your message..."
              />
            </div>

            <footer className="flex flex-wrap items-center gap-2 border-t border-ink/8 px-5 py-4 dark:border-white/10">
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/88 dark:bg-white dark:text-ink dark:hover:bg-white/90"
              >
                <Send className="size-4" />
                Send
              </button>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full text-ink/48 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/48 dark:hover:bg-white/8 dark:hover:text-white"
                aria-label="Attach file"
              >
                <Paperclip className="size-5" />
              </button>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full text-ink/48 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/48 dark:hover:bg-white/8 dark:hover:text-white"
                aria-label="Formatting"
              >
                <Type className="size-5" />
              </button>
              <button
                type="button"
                className="ml-auto grid size-10 place-items-center rounded-full text-ink/36 transition hover:bg-ink/[0.045] hover:text-ink dark:text-white/36 dark:hover:bg-white/8 dark:hover:text-white"
                aria-label="Discard draft"
              >
                <Trash2 className="size-5" />
              </button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
