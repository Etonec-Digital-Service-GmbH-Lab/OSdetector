import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  accent?: 'blue' | 'red';
  icon?: ReactNode;
  children: ReactNode;
}

export function Card({ title, accent = 'blue', icon, children }: CardProps) {
  const accentClass = accent === 'red' ? 'bg-brand-red' : 'bg-brand-blue';

  return (
    <section className="card flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} aria-hidden />
        {icon}
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
      </header>
      <div className="flex-1 px-5 py-4">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value ?? '—'}</span>
    </div>
  );
}
