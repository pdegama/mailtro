import { useState, type FormEvent } from 'react';
import { ArrowRight, Globe } from 'lucide-react';
import { addDomain, verifyDomain } from '../../api/mail';
import type { DomainWithRecords } from '../../api/types';
import { getErrorMessage } from '../../lib/errors';
import { Button, Input } from '../ui/primitives';
import { BrandMark } from '../BrandMark';
import { DnsRecordsTable } from '../domains/DnsRecordsTable';

type Props = {
  username: string;
  onDone: () => void;
};

/**
 * Post-registration step: connect a custom domain (skippable — domains can
 * always be added later from Settings).
 */
export function Onboarding({ username, onDone }: Props) {
  const [name, setName] = useState('');
  const [claim, setClaim] = useState<DomainWithRecords | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submitDomain(e: FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setClaim(await addDomain(name.trim()));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function checkVerify() {
    if (!claim || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await verifyDomain(claim.domain.id);
      setClaim(updated);
      setNotice(`${updated.domain.name} verified — your address is ${username}@${updated.domain.name}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-canvas mail-scroll">
      <header className="flex items-center justify-between px-6 py-5">
        <BrandMark />
        <Button variant="ghost" size="sm" onClick={onDone}>
          Skip for now <ArrowRight size={13} />
        </Button>
      </header>

      <main className="mx-auto w-full max-w-[560px] flex-1 px-4 pb-16 pt-[6vh]">
        <div className="mb-8">
          <div className="mb-4 grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
            <Globe size={17} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight">Connect your domain</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
            Mail on Mailtro lives on your own domain — you'll receive and send as{' '}
            <span className="font-medium text-ink">{username}@yourdomain.com</span>. You can skip
            this and add a domain later in Settings.
          </p>
        </div>

        {!claim ? (
          <form onSubmit={submitDomain} className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="yourdomain.com"
              autoFocus
            />
            <Button type="submit" variant="primary" className="h-9 shrink-0" disabled={busy}>
              {busy ? 'Adding…' : 'Add domain'}
            </Button>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
              <div>
                <p className="text-[13.5px] font-semibold">{claim.domain.name}</p>
                <p className="text-[12px] text-ink-2">
                  {claim.domain.verified
                    ? 'Verified — mail is live on this domain.'
                    : 'Waiting for DNS — add the records below, then verify.'}
                </p>
              </div>
              {claim.domain.verified ? (
                <span className="rounded-full bg-good/10 px-2.5 py-1 text-[11.5px] font-medium text-good">
                  Verified
                </span>
              ) : (
                <Button size="sm" onClick={checkVerify} disabled={busy}>
                  {busy ? 'Checking…' : 'Verify DNS'}
                </Button>
              )}
            </div>

            <div>
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-3">
                Add these DNS records
              </h2>
              <DnsRecordsTable records={claim.records} />
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                The CNAME proves ownership. MX routes your mail to Mailtro, SPF authorizes our
                servers, and the DKIM key lets receivers verify your signatures. DNS changes can
                take a few minutes to propagate.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-md border border-bad/25 bg-bad/8 px-3 py-2 text-[12.5px] text-bad">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded-md border border-good/25 bg-good/8 px-3 py-2 text-[12.5px] text-good">
            {notice}
          </p>
        )}

        {claim && (
          <div className="mt-8 flex justify-end">
            <Button variant="primary" onClick={onDone}>
              {claim.domain.verified ? 'Go to inbox' : 'Finish later — go to inbox'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
