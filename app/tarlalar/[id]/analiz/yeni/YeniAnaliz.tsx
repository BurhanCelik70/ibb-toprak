'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sihirbaz, type SihirbazTarla } from '@/components/analiz/Sihirbaz';
import { kaliteIndeksi } from '@/lib/indeks';
import { createClient } from '@/lib/supabase/client';
import type { SoilReport } from '@/lib/toprak';

/** "2/10/2026", "21.09.2026", "2026-09-21" → "2026-09-21" (okunamazsa bugün) */
function tarihCoz(s?: string): string {
  const bugun = new Date().toISOString().slice(0, 10);
  if (!s) return bugun;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const m = s.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (!m) return bugun;
  const [g, a, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (a < 1 || a > 12 || g < 1 || g > 31) return bugun;
  const t = `${y}-${String(a).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
  return t > bugun ? bugun : t;
}

export function YeniAnaliz({ tarlaId, tarla }: { tarlaId: string; tarla: SihirbazTarla }) {
  const router = useRouter();
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const kaydet = async (rapor: SoilReport, kaynak: 'dosya' | 'manuel') => {
    setHata(null);
    setKaydediliyor(true);
    const { data, error } = await createClient()
      .from('analizler')
      .insert({
        tarla_id: tarlaId,
        rapor,
        kaynak,
        rapor_no: rapor.raporNo ?? null,
        analiz_tarihi: tarihCoz(rapor.raporTarihi),
        indeks: kaliteIndeksi(rapor)?.yuzde ?? null,
      })
      .select('id')
      .single();
    if (error || !data) {
      setKaydediliyor(false);
      setHata('Analiz kaydedilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      return;
    }
    router.push(`/tarlalar/${tarlaId}/analiz/${data.id}`);
    router.refresh();
  };

  return <Sihirbaz tarla={tarla} onKaydet={kaydet} kaydediliyor={kaydediliyor} hata={hata} />;
}
