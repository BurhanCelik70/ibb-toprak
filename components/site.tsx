/**
 * Site geneli: marka logosu, üst menü, alt bilgi ve ana sayfa çizimleri.
 * Sunucu bileşenleridir (hook yok).
 */
import Link from 'next/link';
import { MARKA } from '@/lib/marka';
import { oturumKullanici } from '@/lib/supabase/server';

/** Marka işareti: filiz + "4.0" */
export function LogoIsareti({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <rect width="48" height="48" rx="13" fill="#1f6f4a" />
      <path d="M24 38V22" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 25c0-6.5 4.5-11 11.5-11 0 7-4.5 11-11.5 11Z" fill="#9bdd68" />
      <path d="M24 29c0-5.5-3.8-9.5-9.8-9.5 0 6 3.8 9.5 9.8 9.5Z" fill="#d7f3c2" />
      <path d="M14 38h20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = 40, yazi = true, acik = false }: { size?: number; yazi?: boolean; acik?: boolean }) {
  const [ana, surum] = MARKA.ad.split(' ');
  return (
    <span className="flex items-center gap-2.5">
      <LogoIsareti size={size} />
      {yazi && (
        <span className={`text-xl font-extrabold tracking-tight ${acik ? 'text-white' : 'text-[#17352a]'}`}>
          {ana} <span className={acik ? 'text-[#9bdd68]' : 'text-[#2f8f57]'}>{surum}</span>
        </span>
      )}
    </span>
  );
}

/** seffaf: ana sayfadaki koyu açılış görselinin üstünde, arka plansız ve beyaz yazılı. */
export async function AppHeader({ aktif, seffaf = false }: { aktif?: 'tarlalar' | 'hesap'; seffaf?: boolean }) {
  let girisli = false;
  try {
    girisli = !!(await oturumKullanici()).kullaniciId;
  } catch {
    // Supabase ayarlanmamışsa misafir gibi davran
  }
  const link = (href: string, ad: string, on: boolean) => (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm font-semibold ${
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
        <Link href="/" aria-label={`${MARKA.ad} ana sayfa`}>
          <Logo size={36} acik={seffaf} />
        </Link>
        <nav className="flex items-center gap-1">
          {girisli ? (
            <>
              {link('/tarlalar', 'Tarlalarım', aktif === 'tarlalar')}
              {link('/hesap', 'Hesabım', aktif === 'hesap')}
            </>
          ) : (
            <>
              <a href="/#ornek" className={`hidden rounded-full px-3 py-2 text-sm font-semibold md:block ${seffaf ? 'text-white/80 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'}`}>Örnek alma</a>
              <a href="/#videolar" className={`hidden rounded-full px-3 py-2 text-sm font-semibold md:block ${seffaf ? 'text-white/80 hover:text-white' : 'text-[#3e5248] hover:bg-[#f0f5f1]'}`}>Videolar</a>
              <Link
                href="/giris"
                className={`ml-1 rounded-full px-4 py-2 text-sm font-bold ${seffaf ? 'border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20' : 'bg-[#238f61] text-white hover:bg-[#1d7d54]'}`}
              >
                Giriş yap
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#0e100c] text-white/70 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="max-w-sm">
          <span className="flex items-center gap-2.5 text-lg font-extrabold text-white">
            <LogoIsareti size={32} /> {MARKA.ad}
          </span>
          <p className="mt-3 text-sm leading-6">{MARKA.slogan}.</p>
        </div>
        <div className="text-sm leading-7">
          {MARKA.eposta && (
            <a href={`mailto:${MARKA.eposta}`} className="block hover:text-white">{MARKA.eposta}</a>
          )}
          {MARKA.telefon && (
            <a href={`tel:${MARKA.telefon.replace(/\s/g, '')}`} className="block hover:text-white">{MARKA.telefon}</a>
          )}
          <Link href="/tarlalar" className="block hover:text-white">Tarlalarım</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-4 text-xs text-white/45 sm:px-8">© {new Date().getFullYear()} {MARKA.ad}</div>
      </div>
    </footer>
  );
}

/** Tarlada zikzak örnek alma noktaları (broşürdeki çizimin sade hâli). */
export function ZikzakCizimi() {
  const pts = [
    [40, 150], [80, 50], [120, 150], [160, 50], [200, 150], [240, 50], [280, 150], [320, 50], [360, 150], [400, 50],
  ];
  return (
    <svg viewBox="0 0 440 200" className="w-full" role="img" aria-label="Tarlada zikzak çizerek 10 noktadan örnek alma">
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
export function DerinlikCizimi() {
  const katman = [
    { h: 'h-14', renk: '#8b6a45', etiket: '0–30 cm', not: 'Tarla, sera ve tek yıllık bitkiler' },
    { h: 'h-14', renk: '#a6845c', etiket: '30–60 cm', not: 'Meyve bahçesi ve bağ (0–30 cm ile birlikte)' },
    { h: 'h-11', renk: '#c2a47e', etiket: '60–90 cm', not: 'Meyve bahçesi kurulumu öncesi' },
    { h: 'h-9', renk: '#d6bf9f', etiket: '90–120 cm', not: 'Meyve bahçesi kurulumu öncesi' },
  ];
  return (
    <div className="flex gap-4" role="img" aria-label="Bitkiye göre toprak örneği alma derinlikleri">
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
