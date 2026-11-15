/** Veritabanı tablolarının tipleri (supabase/schema.sql ile aynı). */
import { DILLER, type Dil } from './dil';
import type { SulamaYontemi } from './sulama';
import type { SuRaporu } from './su';
import type { SoilReport } from './toprak';

export type Tarla = {
  id: string;
  kullanici_id: string;
  ad: string;
  il: string | null;
  ilce: string | null;
  konum: string | null;
  alan_dekar: number | null;
  bitki: string | null;
  sulama: SulamaYontemi;
  sulama_suresi_saat: number | null;
  notlar: string | null;
  olusturma: string;
  guncelleme: string;
};

export type UrunOnerisi = { urun: string; doz: string; aciklama: string };
/** Yapay zekâ planının güncel sürümü (app/api/yorum ile aynı) */
export const COZUM_SURUMU = 'igsas-1';

export type CozumPlani = {
  /** Plan sürümü (eski İGSAŞ dönemi planlar yeniden yazılır) */
  surum?: string;
  /** Diğer dillerdeki planlar (aynı analiz için ayrı üretilir, Türkçe planın içinde saklanır) */
  de?: CozumPlani;
  en?: CozumPlani;
  es?: CozumPlani;
  ar?: CozumPlani;
  dil?: Dil;
  ozet: string;
  sorunlar: { parametre: string; etki: string; urunler: { urun: string; doz: string }[]; zaman: string }[];
  kokGelisimi: UrunOnerisi[];
  iklimKoruma: UrunOnerisi[];
  gubreleme: UrunOnerisi[];
  sulamaNotlari?: string[];
  bolgeNotu?: string | null;
  bitkiUygunlugu: string | null;
};

export type Analiz = {
  id: string;
  tarla_id: string;
  kullanici_id: string;
  analiz_tarihi: string;
  rapor_no: string | null;
  kaynak: 'dosya' | 'manuel';
  rapor: SoilReport;
  indeks: number | null;
  cozum: CozumPlani | null;
  cozum_tarihi: string | null;
  olusturma: string;
};

export type SuYorumu = { ozet: string; yapilacaklar: string[]; yontemNotu: string; bitkiNotu: string | null };
export type SuAnalizi = {
  id: string;
  tarla_id: string;
  kullanici_id: string;
  analiz_tarihi: string;
  rapor_no: string | null;
  kaynak: 'dosya' | 'manuel';
  rapor: SuRaporu;
  sinif: string | null;
  yorum: SuYorumu | null;
  yorum_tarihi: string | null;
  olusturma: string;
};

export const tarihYaz = (iso: string, dil: Dil = 'tr') =>
  new Date(iso).toLocaleDateString(DILLER[dil].locale, { day: 'numeric', month: 'long', year: 'numeric' });

/** Kayıtlı çözümden seçili dile ait güncel planı seçer (yoksa null → yeniden üretilir) */
export function dildekiPlan(cozum: CozumPlani | null | undefined, dil: Dil): CozumPlani | null {
  const p = dil === 'tr' ? cozum : cozum?.[dil];
  return p && p.surum === COZUM_SURUMU ? p : null;
}
