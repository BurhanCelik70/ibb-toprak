import { ArrowRight, Droplets, GitCompareArrows, MapPinned } from 'lucide-react';
import Link from 'next/link';
import { DilSecici } from '@/components/DilSecici';
import { EbruGiris, YuzenMenu } from '@/components/VideoGiris';
import { DerinlikCizimi, SiteFooter, ZikzakCizimi } from '@/components/site';
import { oturumKullanici } from '@/lib/supabase/server';
import { alanYaz, DILLER, dozCevir, modullerAcik } from '@/lib/dil';
import { ceviriAl } from '@/lib/dilSunucu';
import { MARKA } from '@/lib/marka';
import { SITE_URL } from '@/lib/site';

/** Ana sayfanın tek resmî adresi (www'li ve www'siz, parametreli adresler buna bağlanır) */
export const metadata = { alternates: { canonical: '/' } };

/** Google için yapılandırılmış veri: site adı ve logo arama sonuçlarında doğru görünsün. */
const YAPILANDIRILMIS_VERI = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, url: SITE_URL, name: MARKA.ad, alternateName: MARKA.kisa, inLanguage: 'tr-TR', description: MARKA.aciklama },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#kurum`,
      name: MARKA.ad,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      parentOrganization: { '@type': 'CollegeOrUniversity', name: MARKA.kurum },
      member: MARKA.ekip.map((ad) => ({ '@type': 'Person', name: ad })),
    },
  ],
};

const MODUL_YOLLARI = [
  { href: '/ornek', resim: '/toprak.jpg' },
  { href: '/ornek/su', resim: '/su/kapak.webp' },
  { href: '/noksanliklar', resim: '/noksanlik/misir-fe.webp' },
  { href: '/noksanliklar/teshis', resim: '/noksanlik/uzum-fe.webp' },
  { href: '/besinler', resim: '/besin/n.webp' },
];

const OZELLIK_IKONLARI = [MapPinned, GitCompareArrows, Droplets];

/** "**kalın**" işaretli metni <strong> ile yazar */
const kalin = (metin: string) =>
  metin.split(/\*\*(.+?)\*\*/).map((parca, i) => (i % 2 ? <strong key={i}>{parca}</strong> : parca));

export default async function AnaSayfa() {
  const { dil, t } = await ceviriAl();
  let girisli = false;
  try {
    girisli = !!(await oturumKullanici()).kullaniciId;
  } catch {
    // Supabase ayarlanmamışsa misafir
  }
  const sh = t.sahne;
  const mn = t.menu;
  const a = t.ana;
  const o = a.onizleme;
  // Su karnesi, noksanlık ve besin rehberi henüz yalnızca Türkçe: Almancada yalnız çevrilmiş modüller gösterilir
  const MODULLER = MODUL_YOLLARI.map((y, k) => ({ ...y, ...a.moduller[k] })).filter((x) => modullerAcik(dil) || x.href === '/ornek');
  const OZELLIKLER = a.ozellikler.map((x, k) => ({ ...x, i: OZELLIK_IKONLARI[k] }));
  const veri = {
    ...YAPILANDIRILMIS_VERI,
    '@graph': [{ ...YAPILANDIRILMIS_VERI['@graph'][0], inLanguage: DILLER[dil].locale, description: t.marka.aciklama }, YAPILANDIRILMIS_VERI['@graph'][1]],
  };
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#f5f0e6] text-[#1d2a22]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(veri) }} />
      <EbruGiris
        m={{ bolum: sh.bolum, baslik: sh.paneller[0].baslik, metin: sh.paneller[0].metin, asagi: sh.asagi, basla: sh.basla, ornek: sh.ornek }}
        baslaHref="/tarlalar"
        ustSag={
          <>
            <Link
              href={girisli ? '/tarlalar' : '/giris'}
              className="rounded-full border border-white/30 bg-black/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
            >
              {girisli ? mn.tarlalar : mn.giris}
            </Link>
            <DilSecici dil={dil} seffaf etiket={mn.dil} baslik={mn.dilSec} />
          </>
        }
      />
      <YuzenMenu
        etiket={sh.menu}
        linkler={[
          { href: '/ornek', ad: mn.ornekRapor },
          ...(modullerAcik(dil)
            ? [
                { href: '/noksanliklar', ad: mn.noksanliklar },
                { href: '/besinler', ad: mn.besinler },
              ]
            : [{ href: '/giris', ad: mn.giris }]),
        ]}
        cta={girisli ? { href: '/tarlalar', ad: mn.tarlalar } : { href: '/tarlalar', ad: sh.basla }}
      />

      {/* Modüller */}
      <section id="icerik" className="scroll-mt-6 px-5 pt-20 sm:px-8 lg:pt-28" aria-labelledby="moduller">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{a.modullerUst}</p>
          <h2 id="moduller" className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
            {a.modullerBaslik}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {MODULLER.map((m) => (
              <Link key={m.href} href={m.href} className="group flex flex-col overflow-hidden rounded-[26px] border border-[#e3dccb] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(18,20,16,.5)]">
                <span className="relative block aspect-[4/3] overflow-hidden bg-[#e9e3d4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.resim} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{m.etiket}</span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-xl font-medium text-[#17352a]">{m.baslik}</span>
                  <span className="mt-2 text-sm leading-6 text-[#5e6a60]">{m.metin}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-[#2f7a4f]">
                    {m.link} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tarla defteri */}
      <section id="tarla-defteri" className="scroll-mt-10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{a.defterUst}</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
              {a.defterBaslik}
            </h2>
            <ul className="mt-10 divide-y divide-[#1d2a22]/10 border-y border-[#1d2a22]/10">
              {OZELLIKLER.map(({ i: Ikon, t, d }) => (
                <li key={t} className="flex gap-5 py-6">
                  <Ikon size={22} strokeWidth={1.6} className="mt-1 shrink-0 text-[#2f7a4f]" />
                  <div>
                    <h3 className="text-lg font-semibold">{t}</h3>
                    <p className="mt-1.5 text-[15px] leading-7 text-[#5e6a60]">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Uygulama önizlemesi */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 -z-0 rounded-[38px] sm:-inset-6 sm:rounded-[44px] bg-[url('/hasat.jpg')] bg-cover bg-center opacity-90" aria-hidden />
            <div className="relative rounded-[30px] bg-white p-5 shadow-[0_40px_80px_-20px_rgba(18,20,16,0.45)] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">{o.tarla}</div>
                  <div className="mt-1 text-xs text-[#6d786f]">{o.bitki} · {o.sulama} · {alanYaz(12, dil)}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl font-medium leading-none">64</div>
                  <div className="mt-1 text-xs font-semibold text-[#3f8f3a]">▲ 8 · {o.durum}</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-xs font-medium text-[#6d786f]">{o.damla}</div>
                <div className="mt-2 flex h-8 overflow-hidden rounded-xl text-[11px] font-semibold">
                  <div className="flex w-1/4 items-center justify-center bg-[#e4eef1] text-[#3d5a66]">{o.su}</div>
                  <div className="flex w-1/2 items-center justify-center bg-[#2f7a4f] text-white">1:30–4:30 {o.gubre}</div>
                  <div className="flex w-1/4 items-center justify-center bg-[#eef4f6] text-[#3d5a66]">{o.su}</div>
                </div>
              </div>
              <ul className="mt-5 space-y-1">
                {[
                  ['UAN-32', 'İGSAŞ', dozCevir('14–18 L/da', dil), '168–216 L'],
                  ['NPK 18-18-18', 'İGSAŞ', dozCevir('4 kg/da', dil), '48 kg'],
                ].map(([u, e, d, t]) => (
                  <li key={u} className="flex items-center justify-between gap-3 border-t border-[#1d2a22]/8 py-3 text-sm">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${e === 'KIANA' ? 'bg-[#e6f4e4] text-[#1f6f4a]' : 'bg-[#1C4734] text-white'}`}
                      >
                        {e}
                      </span>
                      {u}
                    </span>
                    <span className="text-right">
                      <span className="block text-xs font-semibold text-[#2f7a4f]">{d}</span>
                      <span className="block text-[11px] text-[#6d786f]">{o.tarlaIcin} {t}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Toprak hakkında */}
      <section className="bg-[#121410] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-28">
          <blockquote>
            <p className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.02em] sm:text-5xl">
              {a.toprakSoz1}
              <span className="italic text-[#e2b65c]">{a.toprakSoz2}</span>
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
              {a.toprakMetin}
            </p>
          </blockquote>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <dt className="font-display text-3xl">%95</dt>
              <dd className="mt-1 text-sm leading-6 text-white/60">{a.gida}</dd>
            </div>
            <div>
              <dt className="font-display text-3xl">{a.kasikBaslik}</dt>
              <dd className="mt-1 text-sm leading-6 text-white/60">{a.kasik}</dd>
            </div>
            <p className="text-xs text-white/35 sm:col-span-2 lg:col-span-1">{a.kaynak}</p>
          </dl>
        </div>
      </section>

      {/* Örnek alma rehberi */}
      <section id="ornek" className="scroll-mt-10 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">{a.ornekUst}</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
            {a.ornekBaslik}
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] bg-[#fbf8f2] p-6 sm:p-8">
              <h3 className="text-lg font-semibold">{a.nasil}</h3>
              <div className="mt-5">
                <ZikzakCizimi dil={dil} />
              </div>
              <ol className="mt-6 space-y-3 text-[15px] leading-7 text-[#3f4a42]">
                {a.adimlar.map((m, k) => (
                  <li key={k}><span className="font-display text-[#a87a2a]">{k + 1}.</span> {kalin(m)}</li>
                ))}
              </ol>
            </div>
            <div className="grid gap-6">
              <div className="rounded-[28px] bg-[#fbf8f2] p-6 sm:p-8">
                <h3 className="text-lg font-semibold">{a.derinlik}</h3>
                <div className="mt-5">
                  <DerinlikCizimi dil={dil} />
                </div>
              </div>
              <div className="rounded-[28px] bg-[#fbf8f2] p-6 sm:p-8">
                <h3 className="text-lg font-semibold">{a.neZaman}</h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-7 text-[#3f4a42]">
                  {a.zamanlar.map(([b, m]) => (
                    <li key={b}><strong>{b}</strong> {m}</li>
                  ))}
                  <li className="text-[#a3402a]">{a.donmus}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Son çağrı */}
      <section className="relative overflow-hidden bg-[#121410] text-white">
        <div className="absolute inset-0 bg-[url('/hasat.jpg')] bg-cover bg-[center_30%] opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121410] via-[#121410]/70 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
          <h2 className="max-w-lg font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">{a.sonBaslik}</h2>
          <p className="mt-5 max-w-md text-white/70">{a.sonMetin}</p>
          <Link
            href="/tarlalar"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-[#f5f0e6] px-7 py-4 font-semibold text-[#121410] transition hover:bg-white"
          >
            {a.basla} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
      {/* Yüzen menü altbilgiyi örtmesin */}
      <div className="h-24 bg-[#0e100c] print:hidden" aria-hidden />
    </div>
  );
}
