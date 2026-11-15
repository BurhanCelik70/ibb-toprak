'use client';
/** Seçili dili ve çeviri fonksiyonunu istemci bileşenlerine ulaştırır (kök layout'ta sarılır). */
import { createContext, useContext, useMemo } from 'react';
import { alanBirimi, alanDegeri, alanYaz, dozCevir, VARSAYILAN_DIL, type Dil } from '@/lib/dil';
import { ceviriFonk } from '@/lib/i18n';

const DilBaglami = createContext<Dil>(VARSAYILAN_DIL);

export function DilSaglayici({ dil, children }: { dil: Dil; children: React.ReactNode }) {
  return <DilBaglami.Provider value={dil}>{children}</DilBaglami.Provider>;
}

/** { dil, t, alan(dekar) → "1,2 ha", doz("5 kg/da") → "50 kg/ha", birim: 'da'|'ha' } */
export function useDil() {
  const dil = useContext(DilBaglami);
  return useMemo(
    () => ({
      dil,
      t: ceviriFonk(dil),
      alan: (dekar: number) => alanYaz(dekar, dil),
      alanSayi: (dekar: number) => alanDegeri(dekar, dil),
      doz: (metin: string) => dozCevir(metin, dil),
      birim: alanBirimi(dil),
    }),
    [dil],
  );
}

export const useT = () => useDil().t;
/** Bileşenlerde kısa ad: const tx = useTx(); */
export const useTx = () => useDil().t;
