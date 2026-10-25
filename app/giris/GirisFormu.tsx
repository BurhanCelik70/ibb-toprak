'use client';
/**
 * E-postayla şifresiz giriş: e-posta → 6 haneli kod → (ilk girişte) ad soyad.
 * Hesap yoksa ilk kodla otomatik açılır. Supabase e-posta şablonlarında {{ .Token }} kullanılmalı (KURULUM.md).
 */
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Adim = 'eposta' | 'kod' | 'ad';

const epostaGecerli = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

const HATALAR: Record<string, string> = {
  'Token has expired or is invalid': 'Kod hatalı ya da süresi dolmuş. Yeni kod isteyin.',
  'otp_expired': 'Kodun süresi dolmuş. Yeni kod isteyin.',
  'For security purposes': 'Çok sık denediniz. Lütfen biraz bekleyip tekrar deneyin.',
  'rate limit': 'Şu an çok fazla kod istendi. Birkaç dakika sonra tekrar deneyin.',
  'Error sending': 'E-posta gönderilemedi. Adresi kontrol edip tekrar deneyin.',
  'Signups not allowed': 'Yeni kayıtlar şu an kapalı.',
  'invalid format': 'Geçerli bir e-posta adresi yazın.',
};
const hataMetni = (m: string) => Object.entries(HATALAR).find(([k]) => m.toLowerCase().includes(k.toLowerCase()))?.[1] ?? m;

export function GirisFormu({ sonra }: { sonra: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [adim, setAdim] = useState<Adim>('eposta');
  const [eposta, setEposta] = useState('');
  const [kod, setKod] = useState('');
  const [ad, setAd] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [bekle, setBekle] = useState(0);
  const kodRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bekle <= 0) return;
    const t = setTimeout(() => setBekle((b) => b - 1), 1000);
    return () => clearTimeout(t);
  }, [bekle]);

  const kodGonder = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setHata(null);
    const adres = eposta.trim().toLowerCase();
    if (!epostaGecerli(adres)) return setHata('Geçerli bir e-posta adresi yazın (ör. ad@gmail.com).');
    setYukleniyor(true);
    const { error } = await supabase.auth.signInWithOtp({ email: adres, options: { shouldCreateUser: true } });
    setYukleniyor(false);
    if (error) return setHata(hataMetni(error.message));
    setEposta(adres);
    setKod('');
    setBekle(60);
    setAdim('kod');
    setTimeout(() => kodRef.current?.focus(), 50);
  };

  const kodDogrula = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setHata(null);
    if (!/^\d{6,8}$/.test(kod)) return setHata('E-postanıza gelen kodu girin.');
    setYukleniyor(true);
    const { data, error } = await supabase.auth.verifyOtp({ email: eposta, token: kod, type: 'email' });
    if (error || !data.user) {
      setYukleniyor(false);
      return setHata(hataMetni(error?.message ?? 'Giriş yapılamadı.'));
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
    if (ad.trim().length < 2) return setHata('Adınızı ve soyadınızı yazın.');
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
          <div className={ikon}>
            <Mail size={24} />
          </div>
          <h1 className={baslik}>E-postayla giriş</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">
            E-postanıza tek kullanımlık bir kod göndereceğiz. Şifre gerekmez; hesabınız yoksa otomatik açılır.
          </p>
          <label htmlFor="eposta" className="mt-6 block text-sm font-semibold text-[#3e5248]">
            E-posta adresi
          </label>
          <input
            id="eposta"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="ad@gmail.com"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            className={`mt-2 ${kutu}`}
          />
          {hata && <p className="mt-3 text-sm text-[#a83422]">{hata}</p>}
          <button type="submit" disabled={yukleniyor} className={dugme}>
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : <>Kod gönder <ArrowRight size={18} /></>}
          </button>
        </form>
      )}

      {adim === 'kod' && (
        <form onSubmit={kodDogrula}>
          <button type="button" onClick={() => setAdim('eposta')} className="flex items-center gap-1 text-sm font-semibold text-[#476456]">
            <ArrowLeft size={16} /> Adresi değiştir
          </button>
          <div className={`mt-5 ${ikon}`}>
            <KeyRound size={24} />
          </div>
          <h1 className={baslik}>Kodu girin</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">
            <strong className="break-all">{eposta}</strong> adresine bir kod gönderdik. Gelen kutusunda yoksa{' '}
            <strong>Spam / Gereksiz</strong> klasörüne bakın.
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
            aria-label="Doğrulama kodu"
          />
          {hata && <p className="mt-3 text-sm text-[#a83422]">{hata}</p>}
          <button type="submit" disabled={yukleniyor} className={dugme}>
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : 'Giriş yap'}
          </button>
          <button
            type="button"
            onClick={() => kodGonder()}
            disabled={bekle > 0 || yukleniyor}
            className="mt-3 w-full text-sm font-semibold text-[#2f7a4f] disabled:text-[#9aa7a0]"
          >
            {bekle > 0 ? `Yeni kod ${bekle} sn sonra istenebilir` : 'Kodu tekrar gönder'}
          </button>
        </form>
      )}

      {adim === 'ad' && (
        <form onSubmit={adKaydet}>
          <div className={ikon}>
            <UserRound size={24} />
          </div>
          <h1 className={baslik}>Hoş geldiniz</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">Size nasıl hitap edelim?</p>
          <input
            type="text"
            autoComplete="name"
            placeholder="Ad Soyad"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className={`mt-6 ${kutu}`}
          />
          {hata && <p className="mt-3 text-sm text-[#a83422]">{hata}</p>}
          <button type="submit" disabled={yukleniyor} className={dugme}>
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : 'Devam et'}
          </button>
        </form>
      )}
    </div>
  );
}
