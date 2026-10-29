'use client';
/**
 * Raporda: tarladaki bitki için toprak analizine göre öne çıkan noksanlık kartları.
 * Ölçülüp düşük çıkan besinler önce; kireçli / yüksek pH'lı toprakta demir-çinko-mangan-bor riski ayrıca belirtilir.
 */
import { ArrowRight, Leaf } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { NOKSANLIKLAR, katalogBitkisi, type Noksanlik } from '@/lib/noksanliklar';
import { uygunFark, type ParamKey, type SoilReport } from '@/lib/toprak';
import { NoksanlikDetayi, NoksanlikKarti } from './Katalog';

const KIREC_RISKI: ParamKey[] = ['demir', 'cinko', 'mangan', 'bor'];

export function RaporNoksanliklari({ report, bitki }: { report: SoilReport; bitki: string | null }) {
  const [secili, setSecili] = useState<Noksanlik>();
  const kb = katalogBitkisi(bitki);
  if (!kb) return null;
  const kartlar = NOKSANLIKLAR.filter((n) => n.bitki === kb);
  const v = report.values;

  const dusuk = new Set<ParamKey>();
  for (const n of kartlar) {
    if (!n.anahtar) continue;
    const d = v[n.anahtar];
    if (d !== undefined && uygunFark(n.anahtar, d).durum === 'eksik') dusuk.add(n.anahtar);
  }
  const kirecli = (v.ph !== undefined && v.ph > 7.5) || (v.kirec !== undefined && v.kirec > 5);
  const risk = new Set<ParamKey>();
  if (kirecli) for (const k of KIREC_RISKI) if (!dusuk.has(k) && v[k] === undefined) risk.add(k);

  const sec = [
    ...kartlar.filter((n) => n.anahtar && dusuk.has(n.anahtar)).map((n) => ({ n, neden: 'Toprağınızda düşük çıktı' })),
    ...kartlar.filter((n) => n.anahtar && risk.has(n.anahtar)).map((n) => ({ n, neden: 'Kireçli / yüksek pH: risk var' })),
  ].slice(0, 3);
  const kisa = kb === 'Mısır (dane)' ? 'mısırda' : `${kb.replace(/\s*\(.*\)/, '').toLocaleLowerCase('tr-TR')} bitkisinde`;

  return (
    <section className="mt-10" aria-labelledby="noksanlik-baslik">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7a877e]">
            <Leaf size={15} /> Yaprağınıza bakın
          </p>
          <h2 id="noksanlik-baslik" className="mt-1 font-display text-3xl font-medium text-[#17352a]">
            {sec.length ? 'Görülebilecek besin noksanlıkları' : 'Besin noksanlıklarını tanıyın'}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5b6f65]">
            {sec.length
              ? `Analizinize göre ${kisa} bu belirtilere dikkat edin. Kartlara dokunarak nasıl tanınacağını ve ne yapılacağını görün.`
              : `Analizinizde belirgin bir besin eksikliği görünmüyor. Yine de ${kisa} sık görülen noksanlıkların resimlerine göz atabilirsiniz.`}
          </p>
        </div>
        <Link
          href={`/noksanliklar?bitki=${encodeURIComponent(kb)}`}
          className="inline-flex items-center gap-2 rounded-full border border-[#cfc6b2] bg-white px-4 py-2 text-sm font-semibold text-[#17352a] hover:border-[#238f61] print:hidden"
        >
          Tüm katalog ({kartlar.length}) <ArrowRight size={16} />
        </Link>
      </div>
      {sec.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sec.map(({ n, neden }) => (
            <div key={n.id} className="flex flex-col">
              <span className={`mb-2 self-start rounded-full px-3 py-1 text-xs font-bold ${neden.startsWith('Toprağınızda') ? 'bg-[#fbe3dd] text-[#a5402c]' : 'bg-[#f6ecd2] text-[#7a5a1c]'}`}>
                {neden}
              </span>
              <NoksanlikKarti n={n} onAc={() => setSecili(n)} />
            </div>
          ))}
        </div>
      )}
      {secili && <NoksanlikDetayi n={secili} onKapat={() => setSecili(undefined)} />}
    </section>
  );
}
