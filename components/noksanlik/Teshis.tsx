'use client';
/**
 * Yaprak teşhisi: fotoğraf + kısa sorular → yapay zekadan olasılıklı teşhis → etken madde ve İGSAŞ/KIANA ürünleri.
 */
import { jsonOku } from '@/lib/dosya';
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, ImagePlus, Leaf, Loader2, LogIn, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import { ZKART_BITKILERI } from '@/lib/igsas';
import { NOKSANLIKLAR, katalogBitkisi, noksanlikGorseli, type Noksanlik } from '@/lib/noksanliklar';
import {
  BELIRTILER,
  BESIN_COZUM,
  DAGILIMLAR,
  DONEMLER,
  KONUMLAR,
  OLAYLAR,
  TUR_AD,
  TUR_DESTEK,
  cozumUrunleri,
  type Olasilik,
  type TeshisCevaplari,
  type TeshisSonucu,
} from '@/lib/teshis';
import { hastalikBul, hastalikGorseli, type Hastalik } from '@/lib/hastaliklar';
import { HastalikDetayi } from './Hastalik';
import { NoksanlikDetayi } from './Katalog';

type TarlaSecenek = { id: string; ad: string; bitki: string | null };
const BITKILER = [...ZKART_BITKILERI, 'Keten', 'Diğer'];
const FOTO_ALANLARI = [
  { etiket: 'Yakından yaprak', ipucu: 'Belirtili yaprak tek başına, gün ışığında', zorunlu: true },
  { etiket: 'Bitkinin tamamı', ipucu: 'Hangi yapraklarda olduğu görünsün', zorunlu: false },
  { etiket: 'Tarladan genel görünüm', ipucu: 'Tek tük mü, her yerde mi?', zorunlu: false },
];

/** Fotoğrafı tarayıcıda küçültür (uzun kenar 1280 px, JPEG) — yükleme hızlı ve sunucu sınırının altında kalır */
async function kucult(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, hata) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = hata;
      i.src = url;
    });
    const k = Math.min(1, 1280 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Secim({ secenekler, deger, onChange, coklu = false }: { secenekler: readonly string[]; deger: string[]; onChange: (v: string[]) => void; coklu?: boolean }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {secenekler.map((s) => {
        const on = deger.includes(s);
        return (
          <button
            key={s}
            type="button"
            aria-pressed={on}
            onClick={() => {
              if (!coklu) return onChange(on ? [] : [s]);
              if (s === 'Hiçbiri') return onChange(on ? [] : ['Hiçbiri']);
              const yeni = on ? deger.filter((x) => x !== s) : [...deger.filter((x) => x !== 'Hiçbiri'), s];
              onChange(yeni);
            }}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${on ? 'border-[#238f61] bg-[#238f61] text-white' : 'border-[#ddd5c3] bg-white text-[#2c3d33] hover:border-[#238f61]'}`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

function Soru({ no, baslik, alt, children }: { no: number; baslik: string; alt?: string; children: ReactNode }) {
  return (
    <div className="border-t border-[#efe9dc] py-5 first:border-t-0 first:pt-0">
      <p className="flex items-baseline gap-2 font-semibold text-[#17352a]">
        <span className="text-sm text-[#2f8f57]">{no}.</span> {baslik}
      </p>
      {alt && <p className="mt-0.5 text-xs text-[#7a877e]">{alt}</p>}
      {children}
    </div>
  );
}

const marka = (ad: string) => (/^kiana/i.test(ad) ? 'KIANA' : 'İGSAŞ');

/** Hastalık / zararlı sonucu: ilaç önerisi yok, yalnızca bilgilendirme ve katalog kartı */
function HastalikBilgisi({ o, bitki }: { o: Olasilik; bitki: string }) {
  const [detay, setDetay] = useState<Hastalik>();
  const [nDetay, setNDetay] = useState<Noksanlik>();
  const d = TUR_DESTEK[o.tur]!;
  const kart = o.tur === 'hastalik' ? hastalikBul(katalogBitkisi(bitki), o.ad) : undefined;
  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[24px] border border-[#ecd9b0] bg-[#fbf4e4] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a5a2b]">Bilgilendirme</p>
        <p className="mt-2 font-display text-xl text-[#3f3420]">{d.etkenMadde}</p>
        <p className="mt-2 text-sm leading-6 text-[#5a4a2a]">{d.not}</p>
        {kart && (
          <>
            <p className="mt-4 text-sm font-semibold text-[#3f3420]">Yayılmasını azaltmak için (ilaçsız)</p>
            <ul className="mt-2 space-y-1.5">
              {kart.onlemler.map((x) => (
                <li key={x} className="flex gap-2 text-sm leading-6 text-[#4a3f2a]">
                  <Leaf size={15} className="mt-1 shrink-0 text-[#238f61]" /> {x}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {kart && (
        <button type="button" onClick={() => setDetay(kart)} className="group overflow-hidden rounded-[24px] border border-[#e3dccb] bg-white text-left">
          <span className="relative block aspect-[4/3] overflow-hidden bg-[#3c4f3f]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hastalikGorseli(kart.id)} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
          </span>
          <span className="block p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7a877e]">Katalogla karşılaştırın</span>
            <span className="mt-1 block font-display text-lg text-[#17352a]">
              {kart.bitki.replace(/\s*\(.*\)/, '')}: {kart.ad.toLocaleLowerCase('tr-TR')}
            </span>
            <span className="mt-1 block text-sm text-[#5b6f65]">{kart.kisa}</span>
          </span>
        </button>
      )}
      {detay && (
        <HastalikDetayi
          h={detay}
          onKapat={() => setDetay(undefined)}
          onNoksanlik={(n) => {
            setDetay(undefined);
            setNDetay(n);
          }}
        />
      )}
      {nDetay && <NoksanlikDetayi n={nDetay} onKapat={() => setNDetay(undefined)} />}
    </section>
  );
}

function UrunOnerisi({ o, bitki }: { o: Olasilik; bitki: string }) {
  const [detay, setDetay] = useState<Noksanlik>();
  if (o.tur === 'hastalik' || o.tur === 'zararli') return <HastalikBilgisi o={o} bitki={bitki} />;
  const b = o.besin ? BESIN_COZUM[o.besin] : undefined;
  const destek = !b ? TUR_DESTEK[o.tur] : undefined;
  if (!b && !destek) return null;
  const urunler = cozumUrunleri(b ? b.urunler : destek!.urunler);
  const kb = katalogBitkisi(bitki);
  const kart = o.besin ? NOKSANLIKLAR.find((n) => n.bitki === kb && n.sembol === o.besin) ?? NOKSANLIKLAR.find((n) => n.sembol === o.besin) : undefined;
  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[24px] border border-[#cfe5d3] bg-[#f3faf4] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f8f57]">Gidermek için</p>
        <p className="mt-2 text-sm text-[#4f6158]">Etken madde</p>
        <p className="font-display text-xl text-[#17352a]">{b ? b.etkenMadde : destek!.etkenMadde}</p>
        {(b?.not || destek?.not) && <p className="mt-2 text-sm leading-6 text-[#4f6158]">{b?.not ?? destek?.not}</p>}
        {urunler.length > 0 && (
          <>
            <p className="mt-4 text-sm font-semibold text-[#17352a]">İGSAŞ ve KIANA’dan kullanabilecekleriniz</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {urunler.map((u) => (
                <li key={u.ad} className="rounded-2xl border border-[#d9ead9] bg-white p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[#17352a]">{u.ad}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${marka(u.ad) === 'KIANA' ? 'bg-[#e6eefb] text-[#2c4f8f]' : 'bg-[#e6f4ea] text-[#1f6b3f]'}`}>{marka(u.ad)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#5b6f65]">{u.rol}</p>
                  <p className="mt-1 text-xs font-semibold text-[#2f8f57]">{u.doz}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-3 text-[11px] leading-4 text-[#7a877e]">Dozu bitkinin dönemine göre ürün etiketinden kontrol edin. Emin değilseniz önce yaprak analizi yaptırın.</p>
      </div>
      {kart && (
        <button type="button" onClick={() => setDetay(kart)} className="group overflow-hidden rounded-[24px] border border-[#e3dccb] bg-white text-left">
          <span className="relative block aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={noksanlikGorseli(kart.id)} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
          </span>
          <span className="block p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#7a877e]">Katalogla karşılaştırın</span>
            <span className="mt-1 block font-display text-lg text-[#17352a]">
              {kart.bitki.replace(/\s*\(.*\)/, '')}: {kart.besin.toLocaleLowerCase('tr-TR')} noksanlığı
            </span>
            <span className="mt-1 block text-sm text-[#5b6f65]">{kart.kisa}</span>
          </span>
        </button>
      )}
      {detay && <NoksanlikDetayi n={detay} onKapat={() => setDetay(undefined)} />}
    </section>
  );
}

export function TeshisSonucKarti({ s, bitki, onYeni, onlar }: { s: TeshisSonucu; bitki: string; onYeni: () => void; onlar: string[] }) {
  const ilk = s.olasiliklar[0];
  const renk = (y: number) => (y >= 70 ? '#238f61' : y >= 40 ? '#d99a1e' : '#9aa39b');
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onYeni} className="inline-flex items-center gap-1 text-sm font-semibold text-[#476456]">
          <ArrowLeft size={16} /> Yeni teşhis
        </button>
        <span className="rounded-full bg-[#f0ebe0] px-3 py-1 text-xs font-semibold text-[#5a4a2a]">Güven: {s.guven}</span>
      </div>

      {!s.gorselUygun && s.gorselNotu && (
        <p className="mt-4 flex gap-2 rounded-2xl bg-[#fbf1dc] px-4 py-3 text-sm leading-6 text-[#7a5310]">
          <Camera size={18} className="mt-0.5 shrink-0" />
          <span>
            <b>Daha iyi bir fotoğraf gerekiyor:</b> {s.gorselNotu}
          </span>
        </p>
      )}

      <section className="mt-4 overflow-hidden rounded-[28px] bg-[#17352a] text-white">
        <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
          {onlar[0] && (
            <div className="relative hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={onlar[0]} alt="Yüklediğiniz yaprak" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#bfe6a6]">Ön teşhis</p>
            {ilk ? (
              <>
                <h2 className="mt-2 font-display text-3xl font-medium leading-tight sm:text-4xl">
                  <span style={{ color: '#9bdd68' }}>%{ilk.yuzde}</span> ihtimalle {ilk.ad.toLocaleLowerCase('tr-TR')}
                </h2>
                <p className="mt-1 text-sm text-white/70">{TUR_AD[ilk.tur]}</p>
              </>
            ) : (
              <h2 className="mt-2 font-display text-3xl">Belirgin bir sonuç çıkmadı</h2>
            )}
            <p className="mt-3 text-[15px] leading-7 text-white/85">{s.ozet}</p>
            {s.gorulenBitki && <p className="mt-2 text-xs text-white/60">Fotoğrafta görülen: {s.gorulenBitki}</p>}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#e3dccb] bg-white p-5 sm:p-6">
          <h3 className="font-display text-xl text-[#17352a]">Olasılıklar</h3>
          <ul className="mt-4 space-y-4">
            {s.olasiliklar.map((o) => (
              <li key={o.ad}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-[#17352a]">{o.ad}</span>
                  <span className="font-display text-lg" style={{ color: renk(o.yuzde) }}>
                    %{o.yuzde}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#efe9dc]">
                  <div className="h-full rounded-full" style={{ width: `${o.yuzde}%`, background: renk(o.yuzde) }} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4f6158]">{o.neden}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-5">
          {s.ipuclari.length > 0 && (
            <div className="rounded-[24px] border border-[#e3dccb] bg-white p-5 sm:p-6">
              <h3 className="flex items-center gap-2 font-display text-xl text-[#17352a]">
                <Search size={18} className="text-[#2f8f57]" /> Neye dayanıyor?
              </h3>
              <ul className="mt-3 space-y-2">
                {s.ipuclari.map((x) => (
                  <li key={x} className="flex gap-2 text-sm leading-6 text-[#24342b]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f8f57]" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {s.kontrol.length > 0 && (
            <div className="rounded-[24px] border border-[#ecd9b0] bg-[#fbf6ea] p-5 sm:p-6">
              <h3 className="flex items-center gap-2 font-display text-xl text-[#17352a]">
                <CheckCircle2 size={18} className="text-[#b07d1a]" /> Emin olmak için
              </h3>
              <ul className="mt-3 space-y-2">
                {s.kontrol.map((x) => (
                  <li key={x} className="flex gap-2 text-sm leading-6 text-[#4a3d22]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b07d1a]" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {s.yapilacaklar.length > 0 && (
        <section className="mt-6 rounded-[24px] border border-[#e3dccb] bg-white p-5 sm:p-6">
          <h3 className="font-display text-xl text-[#17352a]">Ne yapmalı?</h3>
          <ol className="mt-3 space-y-3">
            {s.yapilacaklar.map((x, i) => (
              <li key={x} className="flex gap-3 text-[15px] leading-6 text-[#24342b]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#238f61] text-sm font-bold text-white">{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
        </section>
      )}

      {ilk && <UrunOnerisi o={ilk} bitki={bitki} />}

      <p className="mt-8 flex gap-2 rounded-2xl bg-[#efe8d8] p-4 text-xs leading-5 text-[#5a4a2a]">
        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
        Bu bir ön teşhistir; fotoğraftan yapılan değerlendirme yanılabilir. Kesin sonuç için yaprak (bitki) analizi yaptırın ya da ziraat mühendisinize gösterin.
      </p>
    </div>
  );
}

export function YaprakTeshisi({ girisli, tarlalar = [] }: { girisli: boolean; tarlalar?: TarlaSecenek[] }) {
  const [fotolar, setFotolar] = useState<(Blob | null)[]>([null, null, null]);
  const [onizleme, setOnizleme] = useState<(string | null)[]>([null, null, null]);
  const [tarlaId, setTarlaId] = useState<string>(tarlalar.length === 1 ? tarlalar[0].id : '');
  const [bitki, setBitki] = useState<string>(tarlalar.length === 1 ? tarlalar[0].bitki ?? '' : '');
  const [digerBitki, setDigerBitki] = useState('');
  const [donem, setDonem] = useState<string[]>([]);
  const [konum, setKonum] = useState<string[]>([]);
  const [belirtiler, setBelirtiler] = useState<string[]>([]);
  const [dagilim, setDagilim] = useState<string[]>([]);
  const [olaylar, setOlaylar] = useState<string[]>([]);
  const [baslangic, setBaslangic] = useState<string[]>([]);
  const [not, setNot] = useState('');
  const [durum, setDurum] = useState<'form' | 'yukleniyor' | 'sonuc'>('form');
  const [hata, setHata] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<TeshisSonucu | null>(null);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const bitkiAd = bitki === 'Diğer' ? digerBitki.trim() : bitki;

  const fotoSec = async (i: number, file?: File) => {
    if (!file) return;
    try {
      const blob = await kucult(file);
      setFotolar((f) => f.map((x, j) => (j === i ? blob : x)));
      setOnizleme((p) => p.map((x, j) => (j === i ? URL.createObjectURL(blob) : x)));
    } catch {
      setHata('Fotoğraf açılamadı. Başka bir fotoğraf deneyin.');
    }
  };
  const fotoSil = (i: number) => {
    setFotolar((f) => f.map((x, j) => (j === i ? null : x)));
    setOnizleme((p) => p.map((x, j) => (j === i ? null : x)));
  };

  const gonder = async () => {
    setHata(null);
    if (!fotolar[0]) return setHata('Önce belirtili yaprağın yakından fotoğrafını ekleyin.');
    if (!bitkiAd) return setHata('Bitkiyi seçin.');
    if (!konum.length && !belirtiler.length) return setHata('Belirtinin nerede başladığını ya da neye benzediğini seçin; teşhis çok daha doğru olur.');
    const cevaplar: TeshisCevaplari = {
      bitki: bitkiAd,
      donem: donem[0],
      konum: konum[0],
      belirtiler,
      dagilim: dagilim[0],
      olaylar,
      baslangic: baslangic[0],
      not: not.trim() || undefined,
      tarlaId: tarlaId || undefined,
    };
    const fd = new FormData();
    fotolar.forEach((f, i) => {
      if (f) {
        fd.append('foto', f, `foto${i}.jpg`);
        fd.append(`etiket${fd.getAll('foto').length - 1}`, FOTO_ALANLARI[i].etiket);
      }
    });
    fd.append('cevaplar', JSON.stringify(cevaplar));
    setDurum('yukleniyor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch('/api/teshis', { method: 'POST', body: fd });
      const json = await jsonOku<TeshisSonucu & { error?: string }>(res);
      if (!res.ok) throw new Error(json.error);
      setSonuc(json);
      setDurum('sonuc');
    } catch (e) {
      setHata(e instanceof Error && e.message ? e.message : 'Teşhis yapılamadı.');
      setDurum('form');
    }
  };

  if (!girisli) {
    return (
      <div className="rounded-[28px] border border-[#e3dccb] bg-white p-8 text-center">
        <Leaf className="mx-auto text-[#238f61]" size={36} />
        <p className="mt-4 font-display text-2xl text-[#17352a]">Yaprak teşhisi için giriş yapın</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5b6f65]">Ücretsiz hesapla yaprağınızın fotoğrafını yükleyin; tarlanızın toprak analiziyle birlikte değerlendirelim.</p>
        <Link href="/giris?sonra=%2Fnoksanliklar%2Fteshis" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#238f61] px-6 py-3 font-bold text-white hover:bg-[#1d7d54]">
          <LogIn size={18} /> Giriş yap
        </Link>
      </div>
    );
  }

  if (durum === 'yukleniyor') {
    return (
      <div className="flex flex-col items-center rounded-[28px] border border-[#e3dccb] bg-white px-6 py-16 text-center">
        <div className="relative">
          {onizleme[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={onizleme[0]} alt="" className="h-32 w-32 rounded-3xl object-cover opacity-80" />
          )}
          <Loader2 size={40} className="absolute inset-0 m-auto animate-spin text-white drop-shadow" />
        </div>
        <p className="mt-6 font-display text-2xl text-[#17352a]">Yaprağınız inceleniyor…</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#5b6f65]">Renk, desen, yaprağın yaşı ve verdiğiniz bilgiler birlikte değerlendiriliyor. Bu 20–40 saniye sürebilir.</p>
      </div>
    );
  }

  if (durum === 'sonuc' && sonuc) {
    return (
      <TeshisSonucKarti
        s={sonuc}
        bitki={bitkiAd}
        onlar={onizleme.filter((x): x is string => !!x)}
        onYeni={() => {
          setSonuc(null);
          setDurum('form');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1) Fotoğraflar */}
      <section className="rounded-[28px] border border-[#e3dccb] bg-white p-5 sm:p-7">
        <h2 className="flex items-center gap-2 font-display text-2xl text-[#17352a]">
          <Camera size={22} className="text-[#238f61]" /> Fotoğraflar
        </h2>
        <p className="mt-1 text-sm text-[#5b6f65]">Gün ışığında, gölgesiz çekin. İlk fotoğraf zorunlu, diğerleri teşhisi güçlendirir.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {FOTO_ALANLARI.map((a, i) => (
            <div key={a.etiket}>
              {onizleme[i] ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#e3dccb]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={onizleme[i]!} alt={a.etiket} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => fotoSil(i)} aria-label="Fotoğrafı kaldır" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                    <X size={16} />
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">{a.etiket}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => refs[i].current?.click()}
                  className={`flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-3 text-center hover:border-[#238f61] ${a.zorunlu ? 'border-[#9ccd8e] bg-[#f3faf1]' : 'border-[#ddd5c3] bg-[#faf8f3]'}`}
                >
                  <ImagePlus className={a.zorunlu ? 'text-[#238f61]' : 'text-[#9aa39b]'} />
                  <span className="mt-2 text-sm font-bold text-[#17352a]">
                    {a.etiket}
                    {a.zorunlu ? '' : ' (isteğe bağlı)'}
                  </span>
                  <span className="mt-0.5 text-xs text-[#7a877e]">{a.ipucu}</span>
                </button>
              )}
              <input ref={refs[i]} type="file" accept="image/*" className="hidden" onChange={(e) => fotoSec(i, e.target.files?.[0])} />
            </div>
          ))}
        </div>
      </section>

      {/* 2) Sorular */}
      <section className="rounded-[28px] border border-[#e3dccb] bg-white p-5 sm:p-7">
        <h2 className="flex items-center gap-2 font-display text-2xl text-[#17352a]">
          <Leaf size={22} className="text-[#238f61]" /> Birkaç soru
        </h2>
        <p className="mt-1 mb-5 text-sm text-[#5b6f65]">Aynı görüntü farklı sorunlardan olabilir; bu cevaplar doğru teşhisin yarısıdır.</p>

        {tarlalar.length > 0 && (
          <Soru no={0} baslik="Hangi tarla? (isteğe bağlı)" alt="Seçerseniz son toprak ve su analiziniz de değerlendirmeye katılır.">
            <select
              value={tarlaId}
              onChange={(e) => {
                setTarlaId(e.target.value);
                const t = tarlalar.find((x) => x.id === e.target.value);
                if (t?.bitki) setBitki(BITKILER.includes(t.bitki) ? t.bitki : katalogBitkisi(t.bitki) ?? 'Diğer');
                if (t?.bitki && !BITKILER.includes(t.bitki) && !katalogBitkisi(t.bitki)) setDigerBitki(t.bitki);
              }}
              className="mt-2 w-full max-w-sm rounded-xl border border-[#dcd4c2] bg-white px-3 py-2.5 text-[15px]"
            >
              <option value="">Tarla seçmeden devam et</option>
              {tarlalar.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ad}
                  {t.bitki ? ` · ${t.bitki}` : ''}
                </option>
              ))}
            </select>
          </Soru>
        )}
        <Soru no={1} baslik="Bitki">
          <select value={bitki} onChange={(e) => setBitki(e.target.value)} className="mt-2 w-full max-w-sm rounded-xl border border-[#dcd4c2] bg-white px-3 py-2.5 text-[15px]">
            <option value="">Seçin</option>
            {BITKILER.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {bitki === 'Diğer' && (
            <input value={digerBitki} onChange={(e) => setDigerBitki(e.target.value)} placeholder="Bitkinin adı" className="mt-2 block w-full max-w-sm rounded-xl border border-[#dcd4c2] px-3 py-2.5" />
          )}
        </Soru>
        <Soru no={2} baslik="Bitki hangi dönemde?">
          <Secim secenekler={DONEMLER} deger={donem} onChange={setDonem} />
        </Soru>
        <Soru no={3} baslik="Belirti önce nerede başladı?" alt="En önemli soru: alt yapraktan başlayanla üst yapraktan başlayan farklı besinlerdir.">
          <Secim secenekler={KONUMLAR} deger={konum} onChange={setKonum} />
        </Soru>
        <Soru no={4} baslik="Neye benziyor?" alt="Birden fazla seçebilirsiniz.">
          <Secim secenekler={BELIRTILER} deger={belirtiler} onChange={setBelirtiler} coklu />
        </Soru>
        <Soru no={5} baslik="Tarlada nasıl dağılmış?">
          <Secim secenekler={DAGILIMLAR} deger={dagilim} onChange={setDagilim} />
        </Soru>
        <Soru no={6} baslik="Ne zamandır var?">
          <Secim secenekler={['Birkaç gün', '1–2 hafta', 'Daha uzun']} deger={baslangic} onChange={setBaslangic} />
        </Soru>
        <Soru no={7} baslik="Son 2 haftada neler oldu?" alt="Birden fazla seçebilirsiniz.">
          <Secim secenekler={OLAYLAR} deger={olaylar} onChange={setOlaylar} coklu />
        </Soru>
        <Soru no={8} baslik="Eklemek istediğiniz bir şey (isteğe bağlı)">
          <textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder="ör. Geçen hafta yabancı ot ilacı attık; sadece kumlu tarafta oluyor"
            className="mt-2 w-full rounded-xl border border-[#dcd4c2] px-3 py-2.5 text-[15px]"
          />
        </Soru>
      </section>

      {hata && <p className="rounded-2xl bg-[#fbe6e1] px-4 py-3 text-sm text-[#8f2f1f]">{hata}</p>}
      <button
        type="button"
        onClick={gonder}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#238f61] px-6 py-4 text-base font-bold text-white hover:bg-[#1d7d54] sm:w-auto"
      >
        <Sparkles size={18} /> Yaprağımı incele
      </button>
    </div>
  );
}
