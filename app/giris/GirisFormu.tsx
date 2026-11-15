'use client';
/**
 * Giriş: önce "Google ile devam et" (tek dokunuş), yedek olarak e-postaya kod.
 * Hesap yoksa otomatik açılır. Google adı otomatik alınır; e-postada ilk girişte ad soyad sorulur.
 */
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { sozluk, type Sozluk } from '@/lib/ceviri';
import type { Dil } from '@/lib/dil';
import { createClient } from '@/lib/supabase/client';

type Adim = 'eposta' | 'kod' | 'ad';

const epostaGecerli = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/** Supabase hata iletisinin bir parçası → sözlükteki karşılığı */
const HATALAR: [string, keyof Sozluk['form']['hata']][] = [
  ['Token has expired or is invalid', 'kodHatali'],
  ['otp_expired', 'kodDoldu'],
  ['For security purposes', 'sik'],
  ['rate limit', 'limit'],
  ['Error sending', 'gonderilemedi'],
  ['Signups not allowed', 'kayitKapali'],
  ['invalid format', 'bicim'],
];
const hataMetni = (m: string, h: Sozluk['form']['hata']) => {
  const bul = HATALAR.find(([k]) => m.toLowerCase().includes(k.toLowerCase()));
  return bul ? h[bul[1]] : m;
};

export function GirisFormu({ dil = 'tr', sonra, ilkAdim = 'eposta', ilkHata = null }: { dil?: Dil; sonra: string; ilkAdim?: Adim; ilkHata?: string | null }) {
  const f = sozluk(dil).form;
  const h = f.hata;
  const router = useRouter();
  const supabase = createClient();
  const [adim, setAdim] = useState<Adim>(ilkAdim);
  const [eposta, setEposta] = useState('');
  const [kod, setKod] = useState('');
  const [ad, setAd] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(ilkHata);
  const [bekle, setBekle] = useState(0);
  const kodRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bekle <= 0) return;
    const t = setTimeout(() => setBekle((b) => b - 1), 1000);
    return () => clearTimeout(t);
  }, [bekle]);

  const googleIleGiris = async () => {
    setHata(null);
    setYukleniyor(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?sonra=${encodeURIComponent(sonra)}` },
    });
    // Başarılıysa tarayıcı Google'a gider; buraya yalnızca hata olursa düşülür
    if (error) {
      setYukleniyor(false);
      setHata(error.message.includes('provider is not enabled') ? h.googleKapali : hataMetni(error.message, h));
    }
  };

  const kodGonder = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setHata(null);
    const adres = eposta.trim().toLowerCase();
    if (!epostaGecerli(adres)) return setHata(h.gecersizEposta);
    setYukleniyor(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: adres,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback?sonra=${encodeURIComponent(sonra)}` },
    });
    setYukleniyor(false);
    if (error) return setHata(hataMetni(error.message, h));
    setEposta(adres);
    setKod('');
    setBekle(60);
    setAdim('kod');
    setTimeout(() => kodRef.current?.focus(), 50);
  };

  const kodDogrula = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setHata(null);
    if (!/^\d{6,8}$/.test(kod)) return setHata(h.kodYok);
    setYukleniyor(true);
    const { data, error } = await supabase.auth.verifyOtp({ email: eposta, token: kod, type: 'email' });
    if (error || !data.user) {
      setYukleniyor(false);
      return setHata(hataMetni(error?.message ?? h.girisYok, h));
    }
    const { data: profil } = await supabase.from('profiller').select('ad_soyad').eq('id', data.user.id).maybeSingle();
    setYukleniyor(false);
    if (!profil?.ad_soyad) return setAdim('ad');
    router.replace(sonra);
    router.refresh();
  };

  const adKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata(null);
    if (ad.trim().length < 2) return setHata(h.adYok);
    setYukleniyor(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await supabase.from('profiller').upsert({ id: user.id, ad_soyad: ad.trim() });
    router.replace(sonra);
    router.refresh();
  };

  const kutu =
    'w-full rounded-2xl border border-[#1d2a22]/12 bg-white px-4 py-3.5 text-lg font-semibold outline-none transition focus:border-[#2f7a4f] focus:ring-4 focus:ring-[#2f7a4f]/10';
  const dugme =
    'mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#1d2a22] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#2f7a4f] disabled:opacity-60';
  const ikon = 'flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7a4f]/10 text-[#2f7a4f]';
  const baslik = 'mt-5 font-display text-3xl font-medium tracking-[-0.01em]';

  return (
    <div className="w-full rounded-[28px] bg-[#fbf8f2] p-6 shadow-[0_40px_80px_-24px_rgba(0,0,0,.6)] sm:p-8">
      {adim === 'eposta' && (
        <form onSubmit={kodGonder} noValidate>
          <h1 className="font-display text-3xl font-medium tracking-[-0.01em]">{f.girisYap}</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">{f.sifreYok}</p>

          <button
            type="button"
            onClick={googleIleGiris}
            disabled={yukleniyor}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#1d2a22] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#2f3d34] disabled:opacity-60"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white"><GoogleLogo /></span> {f.google}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-medium text-[#8a968d]">
            <span className="h-px flex-1 bg-[#1d2a22]/10" /> {f.yaDa} <span className="h-px flex-1 bg-[#1d2a22]/10" />
          </div>

          <label htmlFor="eposta" className="block text-sm font-semibold text-[#3e5248]">
            {f.eposta}
          </label>
          <input
            id="eposta"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={f.epostaOrnek}
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            className={`mt-2 ${kutu}`}
          />
          {hata && <p className="mt-3 text-sm text-[#a83422]">{hata}</p>}
          <button
            type="submit"
            disabled={yukleniyor}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#1d2a22]/20 px-6 py-3.5 text-base font-semibold text-[#1d2a22] transition hover:bg-[#1d2a22]/5 disabled:opacity-60"
          >
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : <><Mail size={18} /> {f.kodGonder} <ArrowRight size={18} /></>}
          </button>
        </form>
      )}

      {adim === 'kod' && (
        <form onSubmit={kodDogrula}>
          <button type="button" onClick={() => setAdim('eposta')} className="flex items-center gap-1 text-sm font-semibold text-[#476456]">
            <ArrowLeft size={16} /> {f.adresDegistir}
          </button>
          <div className={`mt-5 ${ikon}`}>
            <KeyRound size={24} />
          </div>
          <h1 className={baslik}>{f.kodGirin}</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">
            <strong className="break-all">{eposta}</strong> {dil === 'tr' ? '' : '· '}{f.gonderdik1} <strong>{f.spam}</strong> {f.gonderdik2}
          </p>
          <input
            ref={kodRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="••••••"
            value={kod}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className={`mt-6 ${kutu} text-center tracking-[0.5em]`}
            aria-label={f.kodEtiket}
          />
          {hata && <p className="mt-3 text-sm text-[#a83422]">{hata}</p>}
          <button type="submit" disabled={yukleniyor} className={dugme}>
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : f.girisYap}
          </button>
          <button
            type="button"
            onClick={() => kodGonder()}
            disabled={bekle > 0 || yukleniyor}
            className="mt-3 w-full text-sm font-semibold text-[#2f7a4f] disabled:text-[#9aa7a0]"
          >
            {bekle > 0 ? f.yeniKod(bekle) : f.tekrar}
          </button>
        </form>
      )}

      {adim === 'ad' && (
        <form onSubmit={adKaydet}>
          <div className={ikon}>
            <UserRound size={24} />
          </div>
          <h1 className={baslik}>{f.hosGeldiniz}</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">{f.hitap}</p>
          <input
            type="text"
            autoComplete="name"
            placeholder={f.adSoyad}
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className={`mt-6 ${kutu}`}
          />
          {hata && <p className="mt-3 text-sm text-[#a83422]">{hata}</p>}
          <button type="submit" disabled={yukleniyor} className={dugme}>
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : f.devam}
          </button>
        </form>
      )}
    </div>
  );
}

/** Google'ın "G" işareti (Google giriş düğmesi kurallarına uygun, renkli) */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
