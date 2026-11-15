/**
 * Site geneli: marka logosu, üst menü, alt bilgi ve ana sayfa çizimleri.
 * Sunucu bileşenleridir (hook yok).
 */
import Link from 'next/link';
import { DilSecici } from '@/components/DilSecici';
import { dilAl } from '@/lib/dilSunucu';
import { sozluk } from '@/lib/ceviri';
import { ceviriFonk } from '@/lib/i18n';
import { modullerAcik, type Dil } from '@/lib/dil';
import { MARKA } from '@/lib/marka';
import { oturumKullanici } from '@/lib/supabase/server';

/** Marka işareti: dışı çim, içi toprak kesiti olan küre (public/logo.png) */
export function LogoIsareti({ size = 40 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" width={size} height={size} alt="" aria-hidden className="shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]" />;
}

export function Logo({ size = 40, yazi = true, acik = false, mobildeGizle = false, dil = 'tr' }: { size?: number; yazi?: boolean; acik?: boolean; mobildeGizle?: boolean; dil?: Dil }) {
  const [ust, trAlt] = MARKA.logoSatirlari;
  const alt = dil === 'tr' ? trAlt : sozluk(dil).marka.logoAlt;
  return (
    <span className="flex items-center gap-2 sm:gap-2.5">
      <LogoIsareti size={size} />
      {yazi && (
        <span className={`${mobildeGizle ? 'hidden sm:block' : 'block'} font-display font-medium leading-[1.05] tracking-[-0.01em] ${acik ? 'text-white' : 'text-[#17352a]'}`}>
          <span className="block whitespace-nowrap text-[0.8rem] sm:text-[1.05rem]">{ust}</span>
          <span className="block whitespace-nowrap text-[0.8rem] sm:text-[1.05rem]">
            {alt} <span className={`font-semibold ${acik ? 'text-[#9bdd68]' : 'text-[#2f8f57]'}`}>{MARKA.surum}</span>
          </span>
        </span>
      )}
    </span>
  );
}

/** seffaf: ana sayfadaki koyu açılış görselinin üstünde, arka plansız ve beyaz yazılı. */
export async function AppHeader({ aktif, seffaf = false }: { aktif?: 'tarlalar' | 'hesap' | 'noksanlik' | 'besin'; seffaf?: boolean }) {
  let girisli = false;
  try {
    girisli = !!(await oturumKullanici()).kullaniciId;
  } catch {
    // Supabase ayarlanmamışsa misafir gibi davran
  }
  const dil = await dilAl();
  const m = sozluk(dil).menu;
  const ceviriVar = modullerAcik(dil);
  const link = (href: string, ad: string, on: boolean) => (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-semibold sm:px-3 sm:text-sm ${
        seffaf ? 'text-white/85 hover:bg-white/10 hover:text-white' : on ? 'bg-[#e8f3e6] text-[#17352a]' : 'text-[#3e5248] hover:bg-[#f0f5f1]'
      }`}
    >
      {ad}
    </Link>
  );
  return (
    <header
      className={
        seffaf
          ? 'absolute inset-x-0 top-0 z-40 print:static'
          : 'sticky top-0 z-40 border-b border-[#e3e8e4] bg-white/95 backdrop-blur print:static'
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link href="/" aria-label={`${ceviriFonk(dil)(MARKA.ad)} ${m.anaSayfa}`}>
          <Logo size={36} acik={seffaf} mobildeGizle={girisli} dil={dil} />
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {girisli ? (
            <>
              {link('/tarlalar', m.tarlalar, aktif === 'tarlalar')}
              {/* Noksanlık ve besin rehberi henüz yalnızca Türkçe: Almancada bağlantıları gizli */}
              {ceviriVar && link('/noksanliklar', m.noksanliklar, aktif === 'noksanlik')}
              {ceviriVar && <span className="hidden sm:contents">{link('/besinler', m.besinler, aktif === 'besin')}</span>}
              {link('/hesap', m.hesap, aktif === 'hesap')}
            </>
          ) : (
            <>
              <Link href="/ornek" className={`hidden whitespace-nowrap rounded-full min-[420px]:block px-2.5 py-2 text-[13px] sm:px-3 sm:text-sm font-semibold ${seffaf ? 'text-white/80 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'}`}>{m.ornekRapor}</Link>
              {ceviriVar && <Link href="/noksanliklar" className={`hidden rounded-full px-3 py-2 text-sm font-semibold sm:block ${seffaf ? 'text-white/80 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'}`}>{m.noksanliklar}</Link>}
              {ceviriVar && <Link href="/besinler" className={`hidden rounded-full px-3 py-2 text-sm font-semibold sm:block ${seffaf ? 'text-white/80 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'}`}>{m.besinler}</Link>}
              <Link href="/#ornek" className={`hidden rounded-full px-3 py-2 text-sm font-semibold md:block ${seffaf ? 'text-white/80 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'}`}>{m.ornekAlma}</Link>
              <Link
                href="/giris"
                className={`ml-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${seffaf ? 'border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20' : 'bg-[#238f61] text-white hover:bg-[#1d7d54]'}`}
              >
                {m.giris}
              </Link>
            </>
          )}
          <DilSecici dil={dil} seffaf={seffaf} etiket={m.dil} baslik={m.dilSec} />
        </nav>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const dil = await dilAl();
  const { altBilgi: a, marka } = sozluk(dil);
  const tx = ceviriFonk(dil);
  return (
    <footer className="mt-auto bg-[#0e100c] text-white/70 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="max-w-sm">
          <span className="flex items-center gap-2.5 text-lg font-extrabold text-white">
            <LogoIsareti size={32} /> <span className="leading-tight">{tx(MARKA.ad)}</span>
          </span>
          {MARKA.isbirligi && <p className="mt-1.5 pl-[42px] text-xs font-semibold leading-5 text-[#9bdd68]">{MARKA.isbirligi}</p>}
          <p className="mt-3 text-sm leading-6">{marka.slogan}.</p>
        </div>
        <div className="text-sm leading-7">
          <Link href="/tarlalar" className="block hover:text-white">{a.tarlalar}</Link>
          {modullerAcik(dil) && <Link href="/noksanliklar" className="block hover:text-white">{a.noksanliklar}</Link>}
          {modullerAcik(dil) && <Link href="/besinler" className="block hover:text-white">{a.besinler}</Link>}
          <Link href="/gizlilik" className="block hover:text-white">{a.gizlilik}</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>
            <span className="font-semibold text-white/80">{tx(MARKA.kurum)}</span> · {MARKA.ekip.map((e) => tx(e)).join(' · ')}
          </span>
          <span className="text-white/40">© {new Date().getFullYear()} {tx(MARKA.ad)}</span>
        </div>
      </div>
    </footer>
  );
}

/** Tarlada zikzak örnek alma noktaları (broşürdeki çizimin sade hâli). */
export function ZikzakCizimi({ dil = 'tr' }: { dil?: Dil }) {
  const pts = [
    [40, 150], [80, 50], [120, 150], [160, 50], [200, 150], [240, 50], [280, 150], [320, 50], [360, 150], [400, 50],
  ];
  return (
    <svg viewBox="0 0 440 200" className="w-full" role="img" aria-label={sozluk(dil).cizim.zikzak}>
      <rect x="10" y="20" width="420" height="160" rx="18" fill="#e9f3e3" stroke="#bcd8b0" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1="10" x2="430" y1={36 + i * 16} y2={36 + i * 16} stroke="#d5e8cc" strokeWidth="1" />
      ))}
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#238f61" strokeWidth="2.5" strokeDasharray="6 6" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="13" fill="#fff" stroke="#238f61" strokeWidth="2.5" />
          <text x={x} y={y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#17352a">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Örnek alma derinlikleri. */
export function DerinlikCizimi({ dil = 'tr' }: { dil?: Dil }) {
  const c = sozluk(dil).cizim;
  const katman = [
    { h: 'h-14', renk: '#8b6a45', etiket: '0–30 cm', not: c.katmanlar[0] },
    { h: 'h-14', renk: '#a6845c', etiket: '30–60 cm', not: c.katmanlar[1] },
    { h: 'h-11', renk: '#c2a47e', etiket: '60–90 cm', not: c.katmanlar[2] },
    { h: 'h-9', renk: '#d6bf9f', etiket: '90–120 cm', not: c.katmanlar[3] },
  ];
  return (
    <div className="flex gap-4" role="img" aria-label={c.derinlik}>
      <div className="w-20 shrink-0 overflow-hidden rounded-xl sm:w-28">
        <div className="h-2.5 bg-[#5aa832]" />
        {katman.map((k) => (
          <div key={k.etiket} className={k.h} style={{ background: k.renk }} />
        ))}
      </div>
      <ul className="flex-1 pt-2.5">
        {katman.map((k) => (
          <li key={k.etiket} className={`${k.h} flex flex-col justify-center border-b border-dashed border-[#e1e7e2] last:border-0`}>
            <span className="text-sm font-bold text-[#17352a]">{k.etiket}</span>
            <span className="text-xs leading-4 text-[#5b6f65]">{k.not}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
