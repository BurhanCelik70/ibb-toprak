'use client';
import { useTx } from '@/components/DilSaglayici';
import { jsonOku } from '@/lib/dosya';
import { ChevronLeft, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SuKarnesi, type SuTarla } from '@/components/su/SuKarnesi';
import type { SuRaporu } from '@/lib/su';
import { createClient } from '@/lib/supabase/client';
import type { SuYorumu } from '@/lib/veri';

export function SuSonucu({ tarlaId, suId, tarla, rapor, tarih, yorum }: { tarlaId: string; suId: string; tarla: SuTarla; rapor: SuRaporu; tarih: string; yorum: SuYorumu | null }) {
  const tx = useTx();
  const router = useRouter();
  // Yorum dil başına: Türkçesi kaydın kendisi, diğer diller kaydın "diller" kısmında. Dil değişince o dilin yorumu
  // gösterilir; kayıtlı değilse bir kez yazdırılır.
  const kayitliHam = yorum as (SuYorumu & { diller?: Partial<Record<string, SuYorumu>> }) | null;
  const kayitli = tx.dil === 'tr' ? (kayitliHam?.ozet ? kayitliHam : null) : (kayitliHam?.diller?.[tx.dil] ?? null);
  const [yorumlar, setYorumlar] = useState<Partial<Record<string, SuYorumu | null>>>({});
  const [durumlar, setDurumlar] = useState<Partial<Record<string, 'idle' | 'loading' | 'error'>>>({});
  const ai = tx.dil in yorumlar ? (yorumlar[tx.dil] ?? null) : kayitli;
  const durum = durumlar[tx.dil] ?? (kayitli ? 'idle' : 'loading');
  const istenen = useRef(new Set<string>());

  const getir = useCallback(
    async (yenile = false) => {
      const d = tx.dil;
      setDurumlar((x) => ({ ...x, [d]: 'loading' }));
      if (yenile) setYorumlar((x) => ({ ...x, [d]: null }));
      try {
        const res = await fetch('/api/su-yorum', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suAnaliziId: suId, yenile, dil: d }) });
        const json = await jsonOku<SuYorumu & { error?: string }>(res);
        if (!res.ok) throw new Error(json.error);
        setYorumlar((x) => ({ ...x, [d]: json }));
        setDurumlar((x) => ({ ...x, [d]: 'idle' }));
      } catch {
        setDurumlar((x) => ({ ...x, [d]: 'error' }));
      }
    },
    [suId, tx.dil],
  );
  useEffect(() => {
    if (kayitli || istenen.current.has(tx.dil)) return;
    istenen.current.add(tx.dil);
    getir();
  }, [tx.dil, kayitli, getir]);

  const sil = async () => {
    if (!confirm(tx('Bu su analizi silinsin mi? Bu işlem geri alınamaz.'))) return;
    await createClient().from('su_analizleri').delete().eq('id', suId);
    router.push(`/tarlalar/${tarlaId}`);
    router.refresh();
  };
  const ikincil = 'inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe9df] bg-white px-5 py-3 font-semibold text-[#476456] hover:bg-[#f4faf3]';

  return (
    <SuKarnesi
      rapor={rapor}
      tarla={tarla}
      tarih={tarih}
      yorum={ai}
      yorumDurumu={durum}
      onYorumYenile={() => getir(true)}
      baslikUstu={
        <Link href={`/tarlalar/${tarlaId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456] print:hidden">
          <ChevronLeft size={16} /> {tx(tarla.ad)}
        </Link>
      }
      eylemler={
        <>
          <button onClick={() => window.print()} className={ikincil}>
            <Printer size={18} /> {tx("Yazdır / PDF kaydet")}
          </button>
          <button onClick={sil} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-[#a83422] hover:bg-[#fff5f3] sm:ml-auto">
            <Trash2 size={18} /> {tx("Su analizini sil")}
          </button>
        </>
      }
    />
  );
}
