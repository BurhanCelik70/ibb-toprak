'use client';
import { ChevronLeft, Printer, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SonucEkrani, type SonucTarla } from '@/components/analiz/Sonuc';
import { createClient } from '@/lib/supabase/client';
import type { SoilReport } from '@/lib/toprak';
import type { CozumPlani } from '@/lib/veri';

export function AnalizSonucu({
  tarlaId,
  analizId,
  tarla,
  rapor,
  tarih,
  cozum,
  onceki,
}: {
  tarlaId: string;
  analizId: string;
  tarla: SonucTarla;
  rapor: SoilReport;
  tarih: string;
  cozum: CozumPlani | null;
  onceki: { rapor: SoilReport; tarih: string } | null;
}) {
  const router = useRouter();
  const [ai, setAi] = useState<CozumPlani | null>(cozum);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'error'>(cozum ? 'idle' : 'loading');
  const istendi = useRef(false);

  const getir = useCallback(
    async (yenile = false) => {
      setAiState('loading');
      if (yenile) setAi(null);
      try {
        const res = await fetch('/api/yorum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analizId, yenile }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setAi(json);
        setAiState('idle');
      } catch {
        setAiState('error');
      }
    },
    [analizId],
  );

  useEffect(() => {
    // Çözüm planı kayıtlı değilse bir kez oluştur (sonra veritabanından gelir)
    if (!cozum && !istendi.current) {
      istendi.current = true;
      getir();
    }
  }, [cozum, getir]);

  const sil = async () => {
    if (!confirm('Bu analiz silinsin mi? Bu işlem geri alınamaz.')) return;
    await createClient().from('analizler').delete().eq('id', analizId);
    router.push(`/tarlalar/${tarlaId}`);
    router.refresh();
  };

  const ikincil = 'inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe9df] bg-white px-5 py-3 font-semibold text-[#476456] hover:bg-[#f4faf3]';

  return (
    <SonucEkrani
      report={rapor}
      ai={ai}
      aiState={aiState}
      onRetryAi={() => getir()}
      tarla={tarla}
      onceki={onceki ? { ...onceki, simdiTarih: tarih } : null}
      tarih={tarih}
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
          <button onClick={() => getir(true)} disabled={aiState === 'loading'} className={ikincil}>
            <RefreshCw size={18} /> Çözüm planını yenile
          </button>
          <button onClick={sil} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-[#a83422] hover:bg-[#fff5f3] sm:ml-auto">
            <Trash2 size={18} /> Analizi sil
          </button>
        </>
      }
    />
  );
}
