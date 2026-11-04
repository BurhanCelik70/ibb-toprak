/**
 * Tarlanın bulunduğu ilin ortalama PAR (fotosentetik aktif ışınım) değeri: yıllık, aylık ve bitkinin büyüme sezonunda.
 */
import { Sun } from 'lucide-react';
import { AY_KISA, PAR_KAYNAK, dli, isikSinifi, parOzeti } from '@/lib/par';

const f1 = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const f0 = (n: number) => Math.round(n).toLocaleString('tr-TR');

export function ParKarti({ il, bitki, className = '' }: { il?: string | null; bitki?: string | null; className?: string }) {
  const p = parOzeti(il, bitki);
  if (!p) return null;
  const enCok = Math.max(...p.aylik);
  const yil = isikSinifi(dli(p.yillik));
  const sez = p.sezon ? isikSinifi(dli(p.sezon.ortalama)) : undefined;

  return (
    <section className={`overflow-hidden rounded-[26px] border border-[#ecdcae] bg-gradient-to-br from-[#fffaf0] to-[#fdf3dc] p-5 sm:p-6 ${className}`} aria-labelledby="par-baslik">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a87a2a]">Işık · {p.il}</p>
          <h2 id="par-baslik" className="mt-1 flex items-center gap-2 font-display text-2xl font-medium text-[#17352a]">
            <Sun size={22} className="text-[#e0a21b]" /> Fotosentetik aktif ışınım (PAR)
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a4a2a]">
            Güneş ışığının bitkinin fotosentezde kullanabildiği kısmı. Bitkinin ürettiği şekerin ve dolayısıyla verimin enerji kaynağıdır.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-[#ecdcae]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a7a55]">Yıllık ortalama</p>
            <p className="mt-0.5 font-display text-3xl tabular-nums text-[#17352a]">{f1(p.yillik)}</p>
            <p className="text-[11px] text-[#8a7a55]">MJ/m²·gün · ≈ {f0(dli(p.yillik))} mol/m²·gün</p>
            <p className="mt-1 text-[11px] font-bold" style={{ color: yil.renk }}>{yil.ad}</p>
          </div>
          {p.sezon && sez && (
            <div className="rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-[#ecdcae]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a7a55]">Büyüme sezonu</p>
              <p className="mt-0.5 font-display text-3xl tabular-nums text-[#17352a]">{f1(p.sezon.ortalama)}</p>
              <p className="text-[11px] text-[#8a7a55]">{p.sezon.etiket} · ≈ {f0(dli(p.sezon.ortalama))} mol</p>
              <p className="mt-1 text-[11px] font-bold" style={{ color: sez.renk }}>{sez.ad}</p>
            </div>
          )}
        </div>
      </div>

      {/* Aylık çubuklar */}
      <div className="mt-5 grid grid-cols-12 items-end gap-1 sm:gap-2" style={{ height: 120 }} role="img" aria-label={`${p.il} aylık ortalama PAR`}>
        {p.aylik.map((v, i) => {
          const sezonda = p.sezon?.aylar.includes(i);
          return (
            <div key={i} className="flex h-full flex-col items-center justify-end gap-1">
              <span className="text-[9px] tabular-nums text-[#8a7a55] sm:text-[10px]">{f1(v)}</span>
              <div
                className="w-full rounded-t-md"
                style={{ height: `${(v / enCok) * 80}%`, background: sezonda ? '#e0a21b' : '#ead9b0' }}
                title={`${AY_KISA[i]}: ${f1(v)} MJ/m²·gün`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-12 gap-1 text-center text-[10px] text-[#8a7a55] sm:gap-2">
        {AY_KISA.map((a) => (
          <span key={a}>{a}</span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5a4a2a]">
        {p.sezon && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#e0a21b]" /> Bitkinin tarlada olduğu aylar
          </span>
        )}
        <span>
          Türkiye ortalamasının <b>{p.farkYuzde >= 0 ? `%${p.farkYuzde} üstünde` : `%${-p.farkYuzde} altında`}</b> · 81 il içinde <b>{p.sira}.</b>
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-[#8a7a55]">
        {PAR_KAYNAK}, il merkezi için. Tarlanın yönü, eğimi ve gölgelenme bu değeri değiştirebilir.
      </p>
    </section>
  );
}
