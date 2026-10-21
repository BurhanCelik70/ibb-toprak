'use client';
/** Küçük, yeniden kullanılabilir arayüz parçaları. */
import { AlertTriangle, Check } from 'lucide-react';
import type { ReactNode } from 'react';

export function Panel({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#e1ebdf] bg-[#f9fbf9] p-5 sm:p-6">
      <div className="text-lg font-bold">{title}</div>
      <div className="mt-1 text-xs leading-5 text-[#75867a]">{helper}</div>
      {children}
    </div>
  );
}

export function ChoiceGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const sel = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={sel}
            onClick={() => onChange(sel ? '' : o)}
            className={`flex min-h-[52px] items-center justify-between rounded-2xl border px-4 py-2 text-left font-semibold transition ${
              sel ? 'border-[#38a66d] bg-[#eefaf0]' : 'border-[#dfe9df] bg-white hover:border-[#9aca89]'
            }`}
          >
            {o}
            {sel && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#238f61] text-white">
                <Check size={14} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Warning({ text }: { text: string }) {
  return (
    <div className="mt-3 flex gap-2 rounded-xl bg-[#fff4e5] px-3 py-2 text-xs leading-5 text-[#7a4b00]">
      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
      {text}
    </div>
  );
}

export function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm font-semibold text-[#51675d]">{label}</dt>
      <dd className={`text-right text-sm font-bold ${muted ? 'text-[#9aa7a0]' : ''}`}>{value}</dd>
    </div>
  );
}

export function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e2ebe1] bg-white p-7 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f3e7] text-sm font-bold text-[#238f61]">{number}</div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#718078]">{description}</p>
    </div>
  );
}

export function MethodCard({
  icon,
  title,
  description,
  detail,
  selected,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  detail: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-[28px] border bg-white p-7 text-left transition-all ${
        selected ? 'border-[#38a66d] ring-2 ring-[#d9f1d0]' : 'border-[#dfe9df] shadow-sm hover:-translate-y-1 hover:border-[#9aca89] hover:shadow-xl'
      }`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${selected ? 'bg-[#238f61] text-white' : 'bg-[#eaf6e4] text-[#238f61]'}`}>{icon}</div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm font-medium text-[#53685c]">{description}</p>
      <p className="mt-4 text-xs leading-5 text-[#829087]">{detail}</p>
    </button>
  );
}

