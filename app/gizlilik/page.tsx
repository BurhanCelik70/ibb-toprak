import { Fragment } from 'react';
import { AppHeader, SiteFooter } from '@/components/site';
import { GIZLILIK } from '@/lib/gizlilikMetni';
import { MARKA } from '@/lib/marka';
import { ceviriAl } from '@/lib/dilSunucu';

export async function generateMetadata() {
  const { dil } = await ceviriAl();
  return { title: GIZLILIK[dil].baslik };
}

/** "{iletisim}" yerine kalın yazılmış iletişim adresi */
function Metin({ s, ad, iletisim }: { s: string; ad: string; iletisim: string }) {
  const parcalar = s.replaceAll('{ad}', ad).split('{iletisim}');
  return (
    <>
      {parcalar.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <strong>{iletisim}</strong>}
          {p}
        </Fragment>
      ))}
    </>
  );
}

export default async function GizlilikSayfasi() {
  const { dil, tx } = await ceviriAl();
  const g = GIZLILIK[dil];
  const ad = tx(MARKA.ad);
  const iletisim = MARKA.eposta || g.yedekIletisim;
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">
          {g.guncelleme}: {g.tarih}
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">{g.baslik}</h1>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-[#3f4a42] [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#1d2a22] [&_li]:ms-5 [&_li]:list-disc">
          {g.bolumler.map((b, i) => (
            <section key={i}>
              {b.baslik && <h2>{b.baslik}</h2>}
              {b.paragraf && (
                <p>
                  <Metin s={b.paragraf} ad={ad} iletisim={iletisim} />
                </p>
              )}
              {b.maddeler && (
                <ul>
                  {b.maddeler.map(([k, v]) => (
                    <li key={k}>
                      <strong>{k}</strong> {v}
                    </li>
                  ))}
                </ul>
              )}
              {b.liste && (
                <ul>
                  {b.liste.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
              {b.son && <p className="mt-2">{b.son}</p>}
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
