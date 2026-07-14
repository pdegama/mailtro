import { Clock3, Pin } from 'lucide-react';

export function BottomShelf() {
  const cards = [
    { label: 'SLA queue: 7 replies before 5pm', sender: 'Ops signal', icon: Clock3 },
    { label: 'Pinned context: Go webhook contract', sender: 'Engineering route', icon: Pin },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 hidden justify-center gap-12 md:flex">
      {cards.map((card) => (
        <div
          key={card.label}
          className="pointer-events-auto flex w-72 items-center gap-3 rounded-2xl border border-white/10 bg-[#121826]/86 p-3 text-white shadow-[0_18px_48px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl dark:bg-white/10"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#51e6c2,#4d8dff)] text-ink">
            <card.icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-semibold">{card.label}</p>
            <p className="m-0 truncate text-sm text-white/62">{card.sender}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
