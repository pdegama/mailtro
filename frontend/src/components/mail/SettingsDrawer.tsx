import { useState, type FormEvent } from 'react';
import { Drawer } from 'vaul';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AtSign, ChevronDown, ChevronRight, Globe, Plus, Trash2, X } from 'lucide-react';
import {
  addAlias,
  addDomain,
  deleteAlias,
  deleteDomain,
  fetchAliases,
  fetchDomains,
  verifyDomain,
} from '../../api/mail';
import type { DomainWithRecords } from '../../api/types';
import { getErrorMessage } from '../../lib/errors';
import { Button, Input } from '../ui/primitives';
import { DnsRecordsTable } from '../domains/DnsRecordsTable';

type Props = {
  open: boolean;
  onClose: () => void;
  username: string;
};

function DomainCard({ item, username }: { item: DomainWithRecords; username: string }) {
  const { domain, records } = item;
  const [expanded, setExpanded] = useState(!domain.verified);
  const [aliasName, setAliasName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['domains'] });
    queryClient.invalidateQueries({ queryKey: ['identities'] });
    queryClient.invalidateQueries({ queryKey: ['aliases', domain.id] });
  };

  const { data: aliases = [] } = useQuery({
    queryKey: ['aliases', domain.id],
    queryFn: () => fetchAliases(domain.id),
    enabled: expanded,
  });

  const verify = useMutation({
    mutationFn: () => verifyDomain(domain.id),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => deleteDomain(domain.id),
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const createAlias = useMutation({
    mutationFn: (name: string) => addAlias(domain.id, name),
    onSuccess: () => {
      setAliasName('');
      setError(null);
      invalidate();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const removeAlias = useMutation({
    mutationFn: (aliasId: number) => deleteAlias(domain.id, aliasId),
    onSuccess: invalidate,
  });

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="rounded p-0.5 text-ink-3 hover:text-ink"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="flex-1 truncate text-[13px] font-semibold">{domain.name}</span>
        {domain.verified ? (
          <span className="rounded-full bg-good/10 px-2 py-0.5 text-[11px] font-medium text-good">
            Verified
          </span>
        ) : (
          <>
            <span className="rounded-full bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
              Pending DNS
            </span>
            <Button size="sm" onClick={() => verify.mutate()} disabled={verify.isPending}>
              {verify.isPending ? 'Checking…' : 'Verify'}
            </Button>
          </>
        )}
        <button
          onClick={() => {
            if (window.confirm(`Remove ${domain.name} and its aliases?`)) remove.mutate();
          }}
          className="rounded p-1 text-ink-3 hover:bg-bad/10 hover:text-bad"
          title="Remove domain"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-line/70 px-3 py-3">
          {domain.verified && (
            <p className="text-[12px] text-ink-2">
              Primary address: <span className="font-medium text-ink">{username}@{domain.name}</span>
              {' · '}plus addressing works out of the box ({username}+tag@{domain.name}).
            </p>
          )}

          <div>
            <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              DNS records
            </h4>
            <DnsRecordsTable records={records} />
          </div>

          <div>
            <h4 className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              <AtSign size={11} /> Aliases
            </h4>
            {aliases.length > 0 && (
              <ul className="mb-2 space-y-1">
                {aliases.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-md bg-canvas px-2.5 py-1.5 text-[12.5px]"
                  >
                    <span className="font-mono">{a.name}@{domain.name}</span>
                    <button
                      onClick={() => removeAlias.mutate(a.id)}
                      className="rounded p-1 text-ink-3 hover:bg-bad/10 hover:text-bad"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form
              className="flex gap-2"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (aliasName.trim()) createAlias.mutate(aliasName.trim());
              }}
            >
              <Input
                value={aliasName}
                onChange={(e) => setAliasName(e.target.value.toLowerCase())}
                placeholder="hello"
                className="h-8"
              />
              <Button type="submit" size="sm" className="h-8 shrink-0" disabled={createAlias.isPending}>
                <Plus size={13} /> Add alias
              </Button>
            </form>
          </div>

          {error && (
            <p className="rounded-md border border-bad/25 bg-bad/8 px-3 py-2 text-[12px] text-bad">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SettingsDrawer({ open, onClose, username }: Props) {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: fetchDomains,
    enabled: open,
  });

  const create = useMutation({
    mutationFn: (name: string) => addDomain(name),
    onSuccess: () => {
      setNewDomain('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <Drawer.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col border-l border-line bg-canvas shadow-2xl"
          aria-describedby={undefined}
        >
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <Drawer.Title className="flex items-center gap-2 text-[15px] font-semibold">
              <Globe size={15} className="text-accent" /> Domains & aliases
            </Drawer.Title>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-ink-3 hover:bg-line/50 hover:text-ink"
            >
              <X size={15} />
            </button>
          </header>

          <div className="mail-scroll flex-1 space-y-3 overflow-y-auto px-6 py-5">
            <p className="text-[12.5px] leading-relaxed text-ink-2">
              Verified domains receive and send mail as{' '}
              <span className="font-medium text-ink">{username}@domain</span>. Verifying a domain
              that someone else holds moves ownership to you.
            </p>

            <form
              className="flex gap-2"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (newDomain.trim()) create.mutate(newDomain.trim());
              }}
            >
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                placeholder="yourdomain.com"
              />
              <Button
                type="submit"
                variant="primary"
                className="h-9 shrink-0"
                disabled={create.isPending}
              >
                <Plus size={14} /> Add
              </Button>
            </form>

            {error && (
              <p className="rounded-md border border-bad/25 bg-bad/8 px-3 py-2 text-[12.5px] text-bad">
                {error}
              </p>
            )}

            {isLoading ? (
              <p className="py-8 text-center text-[12.5px] text-ink-3">Loading…</p>
            ) : domains.length === 0 ? (
              <p className="py-8 text-center text-[12.5px] text-ink-3">
                No domains yet — add one to start receiving mail.
              </p>
            ) : (
              domains.map((item) => (
                <DomainCard key={item.domain.id} item={item} username={username} />
              ))
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
