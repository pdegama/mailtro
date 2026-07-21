export function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span className="grid size-6 place-items-center rounded-md bg-accent text-[13px] font-bold text-white">
        m
      </span>
      {!compact && <span className="text-[14px] font-semibold tracking-tight">mailtro</span>}
    </span>
  );
}
