'use client';
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
  const router = useRouter();
  const [ai, setAi] = useState<SuYorumu | null>(yorum);
  const [durum, setDurum] = useState<'idle' | 'loading' | 'error'>(yorum ? 'idle' : 'loading');
  const istendi = useRef(false);

  const getir = useCallback(
    async (yenile = false) => {
      setDurum('loading');
      if (yenile) setAi(null);
      try {
        const res = await fetch('/api/su-yorum', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suAnaliziId: suId, yenile }) });
        const json = await jsonOku<SuYorumu & { error?: string }>(res);
        if (!res.ok) throw new Error(json.error);
        setAi(json);
        setDurum('idle');
      } catch {
        setDurum('error');
      }
    },
    [suId],
  );
  useEffect(() => {
    if (!yorum && !istendi.current) {
      istendi.current = true;
      getir();
    }
  }, [yorum, getir]);

  const sil = async () => {
    if (!confirm('Bu su analizi silinsin mi? Bu işlem geri alınamaz.')) return;
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
          <ChevronLeft size={16} /> {tarla.ad}
        </Link>
      }
      eylemler={
        <>
          <button onClick={() => window.print()} className={ikincil}>
            <Printer size={18} /> Yazdır / PDF kaydet
          </button>
          <button onClick={sil} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-[#a83422] hover:bg-[#fff5f3] sm:ml-auto">
            <Trash2 size={18} /> Su analizini sil
          </button>
        </>
      }
    />
  );
}
