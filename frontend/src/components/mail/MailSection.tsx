import type { MailItem } from '../../data/imbox';
import { MailRow } from './MailRow';
import { SectionHeader } from './SectionHeader';

type MailSectionProps = {
  title: string;
  items: MailItem[];
  activeId?: string | null;
  onSelect?: (item: MailItem) => void;
};

export function MailSection({ title, items, activeId, onSelect }: MailSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-2">
      <SectionHeader title={title} />
      <div className="space-y-0.5">
        {items.map((item) => (
          <MailRow
            key={item.id}
            item={item}
            active={activeId === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
