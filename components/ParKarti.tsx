'use client';
/**
 * Tarlanın bulunduğu ilin ortalama PAR (fotosentetik aktif ışınım) değeri: yıllık, aylık ve bitkinin büyüme sezonunda.
 */
import { useTx } from '@/components/DilSaglayici';
import { Sun } from 'lucide-react';
import { DILLER } from '@/lib/dil';
import { AY_KISA, PAR_KAYNAK, PAR_KAYNAK_DE, PAR_KAYNAK_DUNYA, PAR_KAYNAK_ES, dli, isikSinifi, parOzeti } from '@/lib/par';
import { ilGoster } from '@/lib/dunya';

const f1 = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const f0 = (n: number) => Math.round(n).toLocaleString('tr-TR');

export function ParKarti({ il, bitki, className = '' }: { il?: string | null; bitki?: string | null; className?: string }) {
  const tx = useTx();
  const p = parOzeti(il, bitki);
  if (!p) return null;
  const yer = ilGoster(p.il, tx.dil);
  const enCok = Math.max(...p.aylik);
  const yil = isikSinifi(dli(p.yillik));
  const sez = p.sezon ? isikSinifi(dli(p.sezon.ortalama)) : undefined;
  const ay = (i: number) => new Date(2000, i, 1).toLocaleDateString(DILLER[tx.dil].locale, { month: 'long' });
  const sezonEtiket = p.sezon && (tx.dil !== 'tr' ? `${ay(p.sezon.aylar[0])}–${ay(p.sezon.aylar[p.sezon.aylar.length - 1])}` : p.sezon.etiket);

  return (
    <section className={`overflow-hidden rounded-[26px] border border-[#ecdcae] bg-gradient-to-br from-[#fffaf0] to-[#fdf3dc] p-5 sm:p-6 ${className}`} aria-labelledby="par-baslik">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a87a2a]">{tx("Işık ·")}{' '}{tx(yer)}</p>
          <h2 id="par-baslik" className="mt-1 flex items-center gap-2 font-display text-2xl font-medium text-[#17352a]">
            <Sun size={22} className="text-[#e0a21b]" />{' '}{tx("Fotosentetik aktif ışınım (PAR)")}
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a4a2a]">
            
            {tx("Güneş ışığının bitkinin fotosentezde kullanabildiği kısmı (400–700 nm). Fotosentez intensitesini, yani bitkinin birim sürede ürettiği şeker miktarını belirleyen ana etkendir.")}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-[#ecdcae]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a7a55]">{tx("Yıllık ortalama")}</p>
            <p className="mt-0.5 font-display text-3xl tabular-nums text-[#17352a]">{tx(f1(p.yillik))}</p>
            <p className="text-[11px] text-[#8a7a55]">{tx("MJ/m²·gün · ≈")}{' '}{tx(f0(dli(p.yillik)))}{' '}{tx("mol/m²·gün")}</p>
            <p className="mt-1 text-[11px] font-bold" style={{ color: yil.renk }}>{tx("Fotosentez intensitesi:")}{' '}{tx(yil.ad)}</p>
          </div>
          {p.sezon && sez && (
            <div className="rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-[#ecdcae]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a7a55]">{tx("Büyüme sezonu")}</p>
              <p className="mt-0.5 font-display text-3xl tabular-nums text-[#17352a]">{tx(f1(p.sezon.ortalama))}</p>
              <p className="text-[11px] text-[#8a7a55]">{sezonEtiket} · ≈ {tx(f0(dli(p.sezon.ortalama)))}{' '}{tx("mol")}</p>
              <p className="mt-1 text-[11px] font-bold" style={{ color: sez.renk }}>{tx("Fotosentez intensitesi:")}{' '}{tx(sez.ad)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Aylık çubuklar */}
      <div className="mt-5 grid grid-cols-12 items-end gap-1 sm:gap-2" style={{ height: 120 }} role="img" aria-label={tx("{a} aylık ortalama PAR", { a: yer })}>
        {p.aylik.map((v, i) => {
          const sezonda = p.sezon?.aylar.includes(i);
          return (
            <div key={i} className="flex h-full flex-col items-center justify-end gap-1">
              <span className="text-[9px] tabular-nums text-[#8a7a55] sm:text-[10px]">{tx(f1(v))}</span>
              <div
                className="w-full rounded-t-md"
                style={{ height: `${(v / enCok) * 80}%`, background: sezonda ? '#e0a21b' : '#ead9b0' }}
                title={tx("{a}: {b} MJ/m²·gün", { a: tx(AY_KISA[i]), b: f1(v) })}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-12 gap-1 text-center text-[10px] text-[#8a7a55] sm:gap-2">
        {AY_KISA.map((a) => (
          <span key={a}>{tx(a)}</span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5a4a2a]">
        {p.sezon && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#e0a21b]" />{' '}{tx("Bitkinin tarlada olduğu aylar")}
          </span>
        )}
        {p.ulke !== 'DUNYA' && <span>
          
          {p.ulke === 'DE' ? tx("Almanya ortalamasının") : p.ulke === 'ES' ? tx("İspanya ortalamasının") : tx("Türkiye ortalamasının")}{' '}<b>{p.farkYuzde >= 0 ? tx("%{a} üstünde", { a: p.farkYuzde }) : tx("%{a} altında", { a: -p.farkYuzde })}</b>{' '}{p.ulke === 'DE' ? tx("· 16 eyalet içinde") : p.ulke === 'ES' ? tx("· 50 il içinde") : tx("· 81 il içinde")}{' '}<b>{p.sira}.</b>
        </span>}
      </div>
      <div className="mt-4 grid gap-2 text-xs leading-5 text-[#5a4a2a] sm:grid-cols-3">
        <p className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-[#ecdcae]">
          <b className="text-[#17352a]">{tx("PAR → fotosentez intensitesi:")}</b>{' '}{tx("ışık arttıkça fotosentez hızlanır; bir noktadan sonra (ışık doygunluğu) artış durur.")}
        </p>
        <p className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-[#ecdcae]">
          <b className="text-[#17352a]">{tx("Işık ve su birlikte:")}</b>{' '}{tx("fotosentez için gözenekler açılır, CO₂ girer, su terlenir (transpirasyon). Susuz kalan bitki gözeneğini kapatır, ışık bol olsa da fotosentez düşer.")}
        </p>
        <p className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-[#ecdcae]">
          <b className="text-[#17352a]">{tx("DLI (günlük ışık integrali):")}</b>{' '}{tx("bir günde yaprağa düşen toplam fotosentetik ışık, mol/m²·gün. 1 MJ PAR ≈ 4,57 mol foton.")}
        </p>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-[#8a7a55]">
        {p.ulke === 'DE' ? tx(PAR_KAYNAK_DE) : p.ulke === 'ES' ? tx(PAR_KAYNAK_ES) : p.ulke === 'DUNYA' ? tx(PAR_KAYNAK_DUNYA) : tx(PAR_KAYNAK)}{p.ulke === 'DE' ? tx(", eyaletin temsilci istasyonları için. Tarlanın yönü, eğimi ve gölgelenme bu değeri değiştirebilir.") : p.ulke === 'DUNYA' ? tx(", bölge merkezi için (yaklaşık). Tarlanın yönü, eğimi ve gölgelenme bu değeri değiştirebilir.") : tx(", il merkezi için. Tarlanın yönü, eğimi ve gölgelenme bu değeri değiştirebilir.")}
      </p>
    </section>
  );
}
