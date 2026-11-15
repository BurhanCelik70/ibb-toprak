'use client';
/**
 * Üst menüdeki dil seçici (küre simgesi + "TR/DE"). Seçim `dil` çerezine bir yıl yazılır,
 * sayfa sunucudan yeni dille yeniden çizilir.
 */
import { Check, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { DIL_COOKIE, DILLER, type Dil, ACIK_DILLER } from '@/lib/dil';

/** Seçimi bir yıllık çereze yazar; sunucu sonraki çizimde bu dili kullanır. */
function diliKaydet(dil: Dil) {
  document.cookie = `${DIL_COOKIE}=${dil}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = dil;
}

export function DilSecici({ dil, seffaf = false, etiket, baslik }: { dil: Dil; seffaf?: boolean; etiket: string; baslik: string }) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [bekliyor, gecis] = useTransition();
  const kapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!acik) return;
    const kapat = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !kapRef.current?.contains(e.target as Node)) setAcik(false);
    };
    document.addEventListener('mousedown', kapat);
    document.addEventListener('keydown', kapat);
    return () => {
      document.removeEventListener('mousedown', kapat);
      document.removeEventListener('keydown', kapat);
    };
  }, [acik]);

  const sec = (yeni: Dil) => {
    setAcik(false);
    if (yeni === dil) return;
    diliKaydet(yeni);
    gecis(() => router.refresh());
  };

  return (
    <div ref={kapRef} className="relative">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-haspopup="listbox"
        aria-expanded={acik}
        aria-label={`${etiket}: ${DILLER[dil].ad}`}
        title={baslik}
        className={`flex items-center gap-1 rounded-full px-2 py-2 sm:px-2.5 text-[13px] font-bold sm:text-sm ${
          seffaf ? 'text-white/85 hover:bg-white/10 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'
        } ${bekliyor ? 'opacity-60' : ''}`}
      >
        <Globe size={17} strokeWidth={2} />
        {DILLER[dil].kisa}
      </button>
      {acik && (
        <ul
          role="listbox"
          aria-label={baslik}
          className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-[#e3e8e4] bg-white p-1 text-[#17352a] shadow-[0_18px_40px_-16px_rgba(18,20,16,.45)]"
        >
          <li className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a968d]">{baslik}</li>
          {ACIK_DILLER.map((k) => (
            <li key={k} role="option" aria-selected={k === dil}>
              <button
                type="button"
                onClick={() => sec(k)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-semibold hover:bg-[#f0f5f1] ${k === dil ? 'bg-[#e8f3e6]' : ''}`}
              >
                <span className="w-7 rounded-md bg-[#f1efe8] py-0.5 text-center text-[11px] font-bold text-[#6b5520]">{DILLER[k].kisa}</span>
                <span className="flex-1">{DILLER[k].ad}</span>
                {k === dil && <Check size={16} className="text-[#2f8f57]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
