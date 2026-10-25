/** Veritabanı tablolarının tipleri (supabase/schema.sql ile aynı). */
import type { SulamaYontemi } from './sulama';
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
export type CozumPlani = {
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

export const tarihYaz = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
