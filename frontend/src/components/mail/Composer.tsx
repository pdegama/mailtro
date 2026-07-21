import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minimize2,
  Quote,
  RemoveFormatting,
  Send,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react';
import { fetchAliases, fetchDomains, sendMail } from '../../api/mail';
import { getErrorMessage } from '../../lib/errors';
import { cn } from '../../lib/cn';
import { Button } from '../ui/primitives';

export type ComposerDraft = {
  to: string;
  subject: string;
  html: string;
};

type Props = {
  username: string;
  draft: ComposerDraft;
  onClose: () => void;
};

/** All addresses the user may send from: username@ + aliases@ every verified domain. */
function useIdentities(username: string) {
  return useQuery({
    queryKey: ['identities', username],
    queryFn: async () => {
      const domains = await fetchDomains();
      const verified = domains.filter((d) => d.domain.verified);
      const identities: string[] = [];
      for (const d of verified) {
        identities.push(`${username}@${d.domain.name}`);
        try {
          const aliases = await fetchAliases(d.domain.id);
          for (const a of aliases) identities.push(`${a.name}@${d.domain.name}`);
        } catch {
          // aliases are optional — identity list still works without them
        }
      }
      return identities;
    },
  });
}

function ToolbarButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      // preserve the editor selection — don't take focus on click
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded p-1.5 text-ink-2 hover:bg-line/60 hover:text-ink"
    >
      {children}
    </button>
  );
}

export function Composer({ username, draft, onClose }: Props) {
  const [to, setTo] = useState(draft.to);
  const [subject, setSubject] = useState(draft.subject);
  const [from, setFrom] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: identities = [], isLoading: identitiesLoading } = useIdentities(username);

  useEffect(() => {
    if (!from && identities.length > 0) setFrom(identities[0]);
  }, [identities, from]);

  // seed the editor once with the draft body (reply quote etc.)
  useEffect(() => {
    if (editorRef.current && draft.html) {
      editorRef.current.innerHTML = draft.html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const send = useMutation({
    mutationFn: async () => {
      const html = editorRef.current?.innerHTML ?? '';
      const text = editorRef.current?.innerText ?? '';
      return sendMail({ from, to: to.trim(), subject: subject.trim(), text, html });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mails'] });
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const noIdentity = !identitiesLoading && identities.length === 0;

  return (
    <div
      className={cn(
        'fixed bottom-0 right-6 z-50 flex w-[540px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden',
        'rounded-t-xl border border-b-0 border-line bg-surface shadow-2xl'
      )}
    >
      {/* title bar */}
      <div
        className="flex cursor-pointer items-center justify-between border-b border-line bg-canvas px-4 py-2.5"
        onClick={() => setMinimized((v) => !v)}
      >
        <span className="truncate text-[13px] font-semibold">
          {subject || 'New message'}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="rounded p-1 text-ink-3 hover:bg-line/60 hover:text-ink"
            onClick={() => setMinimized((v) => !v)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 size={13} />
          </button>
          <button
            className="rounded p-1 text-ink-3 hover:bg-line/60 hover:text-ink"
            onClick={onClose}
            title="Discard"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* envelope fields */}
          <div className="border-b border-line/70 px-4">
            <div className="flex items-center gap-2 border-b border-line/70 py-1.5">
              <span className="w-12 shrink-0 text-[12px] text-ink-3">From</span>
              {noIdentity ? (
                <span className="text-[12.5px] text-warn">
                  No verified domain — verify one in Settings to send mail.
                </span>
              ) : (
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-7 flex-1 rounded-md bg-transparent text-[13px] focus:outline-none"
                >
                  {identities.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2 border-b border-line/70 py-1.5">
              <span className="w-12 shrink-0 text-[12px] text-ink-3">To</span>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="someone@example.com"
                className="h-7 flex-1 bg-transparent text-[13px] focus:outline-none"
                autoFocus={!draft.to}
              />
            </div>
            <div className="flex items-center gap-2 py-1.5">
              <span className="w-12 shrink-0 text-[12px] text-ink-3">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="h-7 flex-1 bg-transparent text-[13px] font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* formatting toolbar */}
          <div className="flex items-center gap-0.5 border-b border-line/70 px-2 py-1">
            <ToolbarButton title="Bold (Ctrl+B)" onClick={() => exec('bold')}>
              <Bold size={13} />
            </ToolbarButton>
            <ToolbarButton title="Italic (Ctrl+I)" onClick={() => exec('italic')}>
              <Italic size={13} />
            </ToolbarButton>
            <ToolbarButton title="Underline (Ctrl+U)" onClick={() => exec('underline')}>
              <Underline size={13} />
            </ToolbarButton>
            <ToolbarButton title="Strikethrough" onClick={() => exec('strikeThrough')}>
              <Strikethrough size={13} />
            </ToolbarButton>
            <span className="mx-1 h-4 w-px bg-line" />
            <ToolbarButton title="Bulleted list" onClick={() => exec('insertUnorderedList')}>
              <List size={13} />
            </ToolbarButton>
            <ToolbarButton title="Numbered list" onClick={() => exec('insertOrderedList')}>
              <ListOrdered size={13} />
            </ToolbarButton>
            <ToolbarButton title="Quote" onClick={() => exec('formatBlock', 'blockquote')}>
              <Quote size={13} />
            </ToolbarButton>
            <ToolbarButton
              title="Insert link"
              onClick={() => {
                const url = window.prompt('Link URL');
                if (url) exec('createLink', url);
              }}
            >
              <Link2 size={13} />
            </ToolbarButton>
            <span className="mx-1 h-4 w-px bg-line" />
            <ToolbarButton title="Clear formatting" onClick={() => exec('removeFormat')}>
              <RemoveFormatting size={13} />
            </ToolbarButton>
          </div>

          {/* editing surface */}
          <div className="mail-scroll max-h-[38vh] overflow-y-auto">
            <div
              ref={editorRef}
              contentEditable
              className="rich-editor px-4 py-3 text-[13.5px]"
              data-placeholder="Write your message…"
            />
          </div>

          {error && (
            <p className="mx-4 mb-2 rounded-md border border-bad/25 bg-bad/8 px-3 py-2 text-[12.5px] text-bad">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
            <Button
              variant="primary"
              size="sm"
              disabled={send.isPending || noIdentity || !to.trim() || !from}
              onClick={() => send.mutate()}
            >
              <Send size={13} /> {send.isPending ? 'Sending…' : 'Send'}
            </Button>
            <span className="text-[11.5px] text-ink-3">Signed with DKIM · queued via Box</span>
          </div>
        </>
      )}
    </div>
  );
}
