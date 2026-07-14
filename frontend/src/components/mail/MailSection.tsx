import type { MailItem } from '../../data/imbox';
import { MailRow } from './MailRow';
import { SectionHeader } from './SectionHeader';

type MailSectionProps = {
  title: string;
  items: MailItem[];
  action?: string;
};

export function MailSection({ title, items, action }: MailSectionProps) {
  return (
    <section className="py-3">
      <SectionHeader title={title} action={action} />
      <div className="space-y-1">
        {items.map((item) => (
          <MailRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
