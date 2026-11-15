'use client';
/**
 * 3B atlasın altında "Bu dönemde verilecek gübre" paneli (İGSAŞ sürümü).
 * Program İGSAŞ Z-kartından gelir (lib/zkartlar.ts): seçili dönemin, tarlanın sulama yöntemine uyan uygulamaları
 * (lib/sulama.ts → evreUygulamalari), ürün rozetleri ve dekar başı dozlarla.
 * Atlasla iki yönlü dönem eşitlemesi AtlasKarti'nde: atlasın dönem sayısı Z-kartınkinden farklıysa orantılı eşlenir.
 * (Hocanın atlas programı Humintech ürünleriyle yazılı olduğu için bu sürümde kullanılmaz; atlasın Program sekmesi gizli.)
 */
import { useEffect, useState } from 'react';
import { useTx } from '@/components/DilSaglayici';
import { atlasBitkiKodu } from '@/lib/atlas';
import { zkartBul } from '@/lib/bitki';
import { evreUygulamalari, type SulamaYontemi } from '@/lib/sulama';
import type { Program } from '@/lib/hocaProgram';
import { hocaProgramiYukle } from './HocaProgrami';
import { UrunRozeti } from './RaporParcalari';

/** n elemanlı bir dizideki i. konumu m elemanlı diziye orantılı eşler */
const esle = (i: number, n: number, m: number) => (n <= 1 || m <= 1 ? 0 : Math.round((i * (m - 1)) / (n - 1)));

export function AtlasEvrePaneli({
  bitki,
  sulama = 'damla',
  evre,
  onEvre,
}: {
  bitki?: string | null;
  sulama?: SulamaYontemi;
  /** Atlasın toprak tipi (kullanılmıyor; eski imza korunuyor) */
  toprak?: string;
  /** Atlasta seçili dönem (atlasın sırası) */
  evre: number;
  /** Atlasın sırasıyla dönem seçer */
  onEvre: (i: number) => void;
}) {
  const tx = useTx();
  const kod = atlasBitkiKodu(bitki);
  const zkart = zkartBul(bitki ?? undefined);
  // Atlasın dönem sayısı (eşleme için); yüklenemezse Z-kartla aynı sayılır
  const [atlasN, setAtlasN] = useState<number>();
  useEffect(() => {
    if (!kod) return;
    let iptal = false;
    hocaProgramiYukle()
      .then((v: Program) => !iptal && setAtlasN(v.bitki[kod]?.evreler.length))
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, [kod]);

  if (!zkart) return null;
  const zn = zkart.evreler.length;
  const an = atlasN ?? zn;
  const i = Math.min(Math.max(esle(evre, an, zn), 0), zn - 1);
  const e = zkart.evreler[i];
  const gruplar = evreUygulamalari(e, sulama);

  return (
    <div className="border-t border-[#1d2a22]/8 p-5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1f7a45]">{tx("Bu dönemde verilecek gübre")}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label={tx("Gelişme dönemi")}>
        {zkart.evreler.map((z, k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === i}
            onClick={() => onEvre(esle(k, zn, an))}
            className={`rounded-full px-3.5 py-2 text-left text-[13px] font-semibold transition ${k === i ? 'bg-[#1C4734] text-white' : 'bg-[#eef3ee] text-[#1d2a22] hover:bg-[#e1ebe2]'}`}
          >
            <span className="opacity-70">{k + 1}.</span> {tx(z.evre)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl ring-1 ring-[#1d2a22]/10">
        <p className="border-b border-[#1d2a22]/8 px-4 py-3 text-[13px] font-bold text-[#17352a]">
          {tx("İGSAŞ dönem programı")} · {tx(e.donem)}
          {e.bbch ? <span className="font-normal text-[#6b7d72]"> · BBCH {e.bbch}</span> : null}
        </p>
        {gruplar.length ? (
          <div className="divide-y divide-[#1d2a22]/6">
            {gruplar.map((g, k) => (
              <div key={k} className="px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2f7f9a]">{tx(g.yontem)}</p>
                {'not' in g && g.not ? <p className="mt-1 text-xs leading-5 text-[#8a6a2a]">{tx(g.not as string)}</p> : null}
                <ul className="mt-1.5 space-y-1.5">
                  {g.urunler.map((u, j) => (
                    <li key={j} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <UrunRozeti ad={u.urun} />
                      <span className="font-semibold text-[#17352a]">{tx(u.urun)}</span>
                      <span className="font-bold tabular-nums text-[#1f7a45]">{tx.doz(u.doz)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-3 text-sm text-[#6b7d72]">{tx("Bu dönemde gübre uygulaması yok.")}</p>
        )}
      </div>
    </div>
  );
}
