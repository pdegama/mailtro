import { useEffect, useId, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import {
  Check,
  FileIcon,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { APP_WIDTH } from '../../lib/layout';
import { cn } from '../../lib/cn';

export type ComposeAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
};

export type ComposeDraft = {
  to: string;
  subject: string;
  body: string;
  mode: 'new' | 'reply';
  attachments: ComposeAttachment[];
};

type ComposeDrawerProps = {
  open: boolean;
  draft: ComposeDraft;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (draft: ComposeDraft) => void;
  onSent?: (draft: ComposeDraft) => void;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

export const emptyDraft = (): ComposeDraft => ({
  to: '',
  subject: '',
  body: '',
  mode: 'new',
  attachments: [],
});

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Bottom drawer composer — same width (569px) and surface styling
 * as the mail viewing card so compose and read feel like one system.
 */
export function ComposeDrawer({ open, draft, onOpenChange, onDraftChange, onSent }: ComposeDrawerProps) {
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ to?: string; subject?: string; body?: string }>({});

  useEffect(() => {
    if (open) {
      setSent(false);
      setError('');
      setFieldErrors({});
    }
  }, [open]);

  function update(partial: Partial<ComposeDraft>) {
    onDraftChange({ ...draft, ...partial });
  }

  function validate() {
    const next: typeof fieldErrors = {};
    if (!draft.to.trim()) {
      next.to = 'Add a recipient.';
    } else if (!draft.to.includes('@')) {
      next.to = 'Enter a valid email.';
    }
    if (!draft.subject.trim()) {
      next.subject = 'Subject is required.';
    }
    if (!draft.body.trim() && draft.attachments.length === 0) {
      next.body = 'Write a message or attach a file.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError('');
    const next = [...draft.attachments];

    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_FILES) {
        setError(`Up to ${MAX_FILES} files.`);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`“${file.name}” is over 10 MB.`);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        file,
      });
    }

    update({ attachments: next });
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSend() {
    setError('');
    if (!validate()) return;

    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setSent(true);
      onSent?.(draft);
      window.setTimeout(() => {
        onOpenChange(false);
        onDraftChange(emptyDraft());
        setSent(false);
      }, 600);
    } catch {
      setError('Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  }

  function handleDiscard() {
    onDraftChange(emptyDraft());
    setFieldErrors({});
    setError('');
    onOpenChange(false);
  }

  const title = draft.mode === 'reply' ? 'Reply' : 'New message';

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] dark:bg-black/60" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full flex-col outline-none',
            /* Match MailStage surface exactly */
            'rounded-t-[1.25rem] border border-ink/8 bg-white',
            'shadow-[0_-16px_50px_-30px_rgba(18,24,38,0.55)]',
            'dark:border-white/10 dark:bg-[#141a24] dark:shadow-black/50'
          )}
          style={{ maxWidth: APP_WIDTH }}
        >
          <div className="mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full bg-ink/12 dark:bg-white/18" />

          {/* Header mirrors MailStage header */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/6 px-4 pb-3 pt-3 dark:border-white/8">
            <div className="min-w-0">
              <Drawer.Title className="m-0 text-[1.05rem] font-black tracking-tight text-ink dark:text-white">
                {title}
              </Drawer.Title>
              <Drawer.Description className="m-0 mt-0.5 text-xs font-medium text-ink/45 dark:text-white/45">
                {draft.attachments.length > 0
                  ? `${draft.attachments.length} file${draft.attachments.length > 1 ? 's' : ''} attached`
                  : 'Send a message'}
              </Drawer.Description>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="grid size-9 place-items-center rounded-full text-ink/45 transition hover:bg-ink/[0.06] hover:text-ink dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </header>

          {/* Body — same type scale as MailReader */}
          <div className="mail-scroll min-h-0 flex-1 overflow-y-auto px-4 py-1">
            <label className="grid min-h-11 grid-cols-[52px_minmax(0,1fr)] items-center border-b border-ink/8 text-sm dark:border-white/10">
              <span className="font-semibold text-ink/42 dark:text-white/42">To</span>
              <input
                className="min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/30 dark:text-white dark:placeholder:text-white/30"
                placeholder="name@example.com"
                value={draft.to}
                onChange={(e) => update({ to: e.target.value })}
                autoComplete="email"
                autoFocus={draft.mode === 'new'}
              />
            </label>
            {fieldErrors.to ? <p className="mt-1.5 text-xs font-medium text-coral">{fieldErrors.to}</p> : null}

            <label className="grid min-h-11 grid-cols-[52px_minmax(0,1fr)] items-center border-b border-ink/8 text-sm dark:border-white/10">
              <span className="font-semibold text-ink/42 dark:text-white/42">Subject</span>
              <input
                className="min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/30 dark:text-white dark:placeholder:text-white/30"
                placeholder="Subject"
                value={draft.subject}
                onChange={(e) => update({ subject: e.target.value })}
              />
            </label>
            {fieldErrors.subject ? (
              <p className="mt-1.5 text-xs font-medium text-coral">{fieldErrors.subject}</p>
            ) : null}

            <textarea
              className="mt-1 min-h-[220px] w-full resize-none bg-transparent py-4 text-[15px] leading-7 text-ink outline-none placeholder:text-ink/30 dark:text-white dark:placeholder:text-white/30"
              placeholder="Write your message…"
              value={draft.body}
              onChange={(e) => update({ body: e.target.value })}
            />
            {fieldErrors.body ? <p className="mb-2 text-xs font-medium text-coral">{fieldErrors.body}</p> : null}

            {draft.attachments.length > 0 ? (
              <ul className="mb-3 space-y-2">
                {draft.attachments.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center gap-3 rounded-xl border border-ink/8 bg-ink/[0.03] px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.05]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink/8 text-ink/60 dark:bg-white/10 dark:text-white/65">
                      <FileIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold text-ink dark:text-white">{file.name}</p>
                      <p className="m-0 text-xs font-medium text-ink/45 dark:text-white/45">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        update({ attachments: draft.attachments.filter((a) => a.id !== file.id) })
                      }
                      className="grid size-8 place-items-center rounded-full text-ink/40 transition hover:bg-ink/5 hover:text-coral dark:text-white/40 dark:hover:bg-white/10"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {error ? (
              <div className="mb-3 rounded-xl border border-coral/30 bg-coral/10 px-3 py-2.5 text-sm font-medium text-coral">
                {error}
              </div>
            ) : null}
          </div>

          {/* Footer mirrors MailReader action bar */}
          <footer className="flex shrink-0 items-center gap-2 border-t border-ink/8 px-4 py-3.5 dark:border-white/10">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || sent}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/88 disabled:opacity-70 dark:bg-white dark:text-ink dark:hover:bg-white/92"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : sent ? (
                <Check className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {sending ? 'Sending…' : sent ? 'Sent' : 'Send'}
            </button>

            <input
              ref={fileRef}
              id={fileInputId}
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <label
              htmlFor={fileInputId}
              className="grid size-10 cursor-pointer place-items-center rounded-full text-ink/48 transition hover:bg-ink/[0.06] hover:text-ink dark:text-white/48 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Attach files"
              title="Attach"
            >
              <Paperclip className="size-5" />
            </label>

            <button
              type="button"
              onClick={handleDiscard}
              className="ml-auto grid size-10 place-items-center rounded-full text-ink/36 transition hover:bg-ink/[0.06] hover:text-coral dark:text-white/36 dark:hover:bg-white/10"
              aria-label="Discard"
            >
              <Trash2 className="size-5" />
            </button>
          </footer>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
