import type { DNSRecord } from '../../api/types';
import { CopyButton } from '../ui/primitives';

export function DnsRecordsTable({ records }: { records: DNSRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full border-collapse text-left text-[12.5px]">
        <thead>
          <tr className="border-b border-line bg-canvas text-[11.5px] uppercase tracking-wide text-ink-3">
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Host</th>
            <th className="px-3 py-2 font-medium">Value</th>
            <th className="w-8 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i} className="border-b border-line/60 last:border-0 align-top">
              <td className="px-3 py-2.5 font-mono text-[11.5px] font-semibold text-accent">
                {r.type}
              </td>
              <td className="max-w-[180px] break-all px-3 py-2.5 font-mono text-[11.5px]">
                {r.host}
              </td>
              <td className="max-w-[260px] px-3 py-2.5">
                <p className="break-all font-mono text-[11.5px] leading-relaxed">
                  {r.value.length > 120 ? r.value.slice(0, 120) + '…' : r.value}
                </p>
                <p className="mt-1 text-[11px] text-ink-3">{r.purpose}</p>
              </td>
              <td className="px-2 py-2.5">
                <CopyButton value={r.value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
