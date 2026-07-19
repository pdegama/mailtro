import type { MailItem } from '../../data/imbox';
import { MailRow } from './MailRow';

type MailListProps = {
  items: MailItem[];
  onSelect: (item: MailItem) => void;
};

/** One flat list of all emails. */
export function MailList({ items, onSelect }: MailListProps) {
  if (items.length === 0) {
    return (
      <p className="px-2 py-12 text-center text-sm font-medium text-ink/45 dark:text-white/45">
        No mail yet.
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <MailRow key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
}
