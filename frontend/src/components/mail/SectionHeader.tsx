type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center gap-3 px-1">
      <h2 className="m-0 shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink/55 dark:text-white/55">
        {title}
      </h2>
      <div className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
    </div>
  );
}
