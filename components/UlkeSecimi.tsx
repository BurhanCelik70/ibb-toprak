'use client';
/**
 * Ülke ve bölge seçimi (tarla formu ve analiz sihirbazı ortak kullanır).
 * Türkiye, Almanya, İspanya başta; diğer bütün ülkeler arayüz dilinde alfabetik.
 * Dünya ülkesinin bölgeleri /api/dunya'dan bir kez alınır; seçim değeri "Bölge (ISO)" biçimindedir.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useTx } from '@/components/DilSaglayici';
import { ULKELER, anaUlkeMi, ulkeIlleri, type Ulke } from '@/lib/bolgeler';
import { DUNYA_ULKELERI, dunyaIli, dunyaIlYap, ulkeAdi } from '@/lib/dunya';

/**
 * Ülke seçenekleri. Uzun dünya listesi tarayıcıda (yüklendikten sonra) çizilir: ülke adları ve sıralama tarayıcının
 * dil verisinden gelir, sunucudakiyle birebir aynı olmayabilir (hydration uyuşmazlığı olmasın).
 * Seçili dünya ülkesi ilk çizimde de vardır, kutu boş görünmez.
 */
const bos = () => () => {};

export function UlkeSecenekleri({ secili }: { secili?: Ulke }) {
  const tx = useTx();
  // Sunucuda ve ilk (hydration) çiziminde false, tarayıcıda sonra true
  const hazir = useSyncExternalStore(bos, () => true, () => false);
  const digerleri = useMemo(() => {
    if (!hazir) return secili && !anaUlkeMi(secili) ? [{ k: secili, ad: ulkeAdi(secili, tx.dil) }] : [];
    const l = DUNYA_ULKELERI.map((k) => ({ k, ad: ulkeAdi(k, tx.dil) }));
    return l.sort((a, b) => a.ad.localeCompare(b.ad, tx.dil));
  }, [hazir, secili, tx.dil]);
  return (
    <>
      {ULKELER.map((u) => (
        <option key={u.k} value={u.k}>{tx(u.ad)}</option>
      ))}
      <optgroup label={tx('Diğer ülkeler')}>
        {digerleri.map((u) => (
          <option key={u.k} value={u.k} suppressHydrationWarning>{u.ad}</option>
        ))}
      </optgroup>
    </>
  );
}

const onbellek = new Map<string, Promise<string[]>>();
const bolgeleriAl = (u: string) => {
  let p = onbellek.get(u);
  if (!p) {
    p = fetch(`/api/dunya?u=${u}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { bolgeler?: string[] }) => j.bolgeler ?? []);
    // Başarısız istek önbellekte kalmasın; bir sonraki denemede yeniden sorulur
    p.catch(() => onbellek.delete(u));
    onbellek.set(u, p);
  }
  return p;
};

export type IlSecenegi = { deger: string; ad: string };

/** Ülkenin il / bölge seçenekleri. deger kaydedilecek il değeridir (dünya ülkesinde "Bölge (ISO)"). */
export function useIlSecenekleri(ulke: Ulke, secili?: string | null) {
  const ana = anaUlkeMi(ulke);
  const [dunya, setDunya] = useState<{ u: string; l: string[] } | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  useEffect(() => {
    if (ana) return;
    let iptal = false;
    bolgeleriAl(ulke).then(
      (l) => { if (!iptal) { setDunya({ u: ulke, l }); setHata(null); } },
      () => { if (!iptal) setHata(ulke); },
    );
    return () => { iptal = true; };
  }, [ulke, ana]);

  const yukleniyor = !ana && dunya?.u !== ulke && hata !== ulke;
  const secenekler: IlSecenegi[] = ana
    ? ulkeIlleri(ulke).map((i) => ({ deger: i, ad: i }))
    : dunya?.u === ulke
      ? dunya.l.map((b) => ({ deger: dunyaIlYap(b, ulke), ad: b }))
      : [];
  // Kayıtlı il listede yoksa (ör. liste henüz gelmedi) yine görünsün
  if (secili && !secenekler.some((s) => s.deger === secili)) {
    const d = dunyaIli(secili);
    if (!d || d.ulke === ulke) secenekler.unshift({ deger: secili, ad: d ? d.bolge : secili });
  }
  return { secenekler, yukleniyor, hata: hata === ulke };
}
