'use client';
/**
 * Bir damla/yağmurlama sulamasının sade özeti (kaydırmalı sahne kaldırıldı):
 *  1) Bir sulamanın saatleri: yalnızca su · gübreli su · temiz su (süreyle orantılı çubuk + üç kutu)
 *  2) Hangi dönemde suyla ne verilecek: tüm dönemler tek tabloda, doz ve tarla toplamıyla; içinde bulunulan dönem işaretli.
 */
import { useTx } from '@/components/DilSaglayici';
import { useState } from 'react';
import { takvimAyi } from '@/lib/dunya';
import { evreUygulamalari, simdikiEvreler, toplamMiktar, zamanCizelgesi, type SulamaYontemi } from '@/lib/sulama';
import type { ZKart } from '@/lib/zkartlar';

const BASLANGIC_SAATLERI = ['05:00', '06:00', '07:00', '17:00', '18:00', '19:00'];
const dk = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
const saatEkle = (bas: string, dakika: number) => {
  const t = (((dk(bas) + Math.round(dakika)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
const sureYaz = (dakika: number) => {
  const s = dakika / 60;
  return s.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
};
const fertigasyon = (g: string) => g === 'Damla sulama' || g === 'Yağmurlama';

export function SuSutunu({ yontem, sure, zkart, alan, il }: { yontem: SulamaYontemi; sure: number; zkart: ZKart; alan?: number | null; il?: string | null }) {
  const tx = useTx();
  const dilimler = zamanCizelgesi(yontem, sure);
  const evreler = zkart.evreler;
  const simdi = simdikiEvreler(zkart, takvimAyi(il));
  const [baslangic, setBaslangic] = useState('06:00');

  if (!dilimler || dilimler.length !== 3) return null;

  const dakikalar = dilimler.map((d) => dk(d.bit) - dk(d.bas));
  const toplam = dakikalar.reduce((a, b) => a + b, 0) || 1;
  const parca = dilimler.map((d, i) => ({
    bas: saatEkle(baslangic, dk(d.bas)),
    bit: saatEkle(baslangic, dk(d.bit)),
    sure: tx('{a} saat', { a: sureYaz(dakikalar[i]) }),
    oran: (dakikalar[i] / toplam) * 100,
  }));
  const renk = ['#7fc8ec', '#2f9a58', '#a9dcf3'];
  const koyu = ['#1f6f8f', '#1f7a45', '#1f6f8f'];
  const ad = [tx("Yalnızca su"), tx("Gübreli su"), tx("Temiz su")];
  const metin = [
    yontem === 'damla' ? tx("Hat dolar, basınç oturur, kök bölgesi ıslanır.") : tx("Toprak ve kök bölgesi ıslanır."),
    tx("Aşağıdaki tabloda o dönemin gübresi bu sürede suya verilir."),
    yontem === 'damla' ? tx("Hat ve damlatıcılar yıkanır; gübre kök bölgesinde kalır.") : tx("Yapraklardaki gübre yıkanır, yanık olmaz."),
  ];
  const satirlar = evreler.map((e, i) => {
    const tum = evreUygulamalari(e, yontem);
    return {
      i,
      evre: e.evre,
      donem: e.donem,
      suyla: tum.filter((g) => fertigasyon(g.yontem)).flatMap((g) => g.urunler),
      yaprak: tum.filter((g) => g.yontem === 'Yapraktan').flatMap((g) => g.urunler),
    };
  });

  return (
    <div className="rounded-[24px] bg-white p-5 ring-1 ring-[#1d2a22]/8 sm:p-6">
      {/* 1) Bir sulamanın saatleri */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f7f9a]">{tx("Bir sulamanın saatleri")}</p>
          <h4 className="mt-1 font-display text-2xl font-medium text-[#17352a]">
            {tx('{a} saat', { a: sureYaz(toplam) })} · {parca[0].bas} – {parca[2].bit}
          </h4>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#5b6f65] print:hidden">
          {tx("Başlangıç")}
          <select value={baslangic} onChange={(e) => setBaslangic(e.target.value)} className="rounded-full border-0 bg-[#f1efe8] px-3 py-1.5 font-semibold text-[#17352a]">
            {BASLANGIC_SAATLERI.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden>
        {parca.map((x, i) => (
          <span key={i} style={{ width: `${x.oran}%`, background: renk[i] }} />
        ))}
      </div>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {parca.map((x, i) => (
          <li key={i} className="rounded-2xl bg-[#f6f9f6] p-4" style={{ borderTop: `3px solid ${renk[i]}` }}>
            <p className="text-lg font-bold tabular-nums text-[#17352a]">
              {x.bas} – {x.bit}
            </p>
            <p className="text-sm font-bold" style={{ color: koyu[i] }}>
              {i + 1}. {ad[i]} <span className="font-medium text-[#6b7d72]">· {x.sure}</span>
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#4b5f55]">{metin[i]}</p>
          </li>
        ))}
      </ol>

      {/* 2) Hangi dönemde, suyla ne kadar */}
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f7a45]">{tx("Hangi dönemde suyla ne verilecek")}</p>
      <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-[#1d2a22]/10">
        {satirlar.map((r) => {
          const suAn = simdi.includes(r.i);
          return (
            <div key={r.i} className={`grid gap-x-5 gap-y-2 border-b border-[#1d2a22]/8 p-4 last:border-b-0 sm:grid-cols-[minmax(0,210px)_minmax(0,1fr)] ${suAn ? 'bg-[#f1f8f2]' : ''}`}>
              <div>
                <p className="font-bold text-[#17352a]">
                  {r.i + 1}. {tx(r.evre)}
                </p>
                <p className="text-xs text-[#6b7d72]">{tx(r.donem)}</p>
                {suAn && <span className="mt-1 inline-block rounded-full bg-[#e2b65c] px-2 py-0.5 text-[10px] font-bold text-[#121410]">{tx("Şu an bu dönem")}</span>}
              </div>
              <div className="min-w-0">
                {r.suyla.length ? (
                  <ul className="space-y-1.5">
                    {r.suyla.map((u, j) => {
                      const t = toplamMiktar(u.doz, alan);
                      return (
                        <li key={j} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                          <span className="font-semibold text-[#17352a]">{tx(u.urun)}</span>
                          <span className="font-bold tabular-nums text-[#1f7a45]">{tx.doz(u.doz)}</span>
                          {t && <span className="text-xs text-[#6b7d72]">{tx("· tarlanız için")}{' '}{tx(t)}</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-[#6b7d72]">{tx("Suyla gübre yok; yalnızca su verin.")}</p>
                )}
                {r.yaprak.length > 0 && (
                  <p className="mt-2 text-[13px] leading-5 text-[#5b4a8a]">
                    <span className="font-semibold">{tx("Yapraktan (akşam 18:00–20:00):")}</span>{' '}
                    {r.yaprak.map((u) => `${tx(u.urun)} ${tx.doz(u.doz)}`).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
