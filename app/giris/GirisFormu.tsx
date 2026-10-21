'use client';

import { ArrowLeft, ArrowRight, KeyRound, Loader2, Phone, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Adim = 'telefon' | 'kod' | 'ad';

/** "0532 123 45 67", "5321234567", "+90 532..." → "+905321234567" */
function telefonDuzelt(girdi: string): string | null {
  let d = girdi.replace(/\D/g, '');
  if (d.startsWith('90') && d.length === 12) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return /^5\d{9}$/.test(d) ? `+90${d}` : null;
}

const goster = (e164: string) => `0${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9, 11)} ${e164.slice(11)}`;

const HATALAR: Record<string, string> = {
  'Token has expired or is invalid': 'Kod hatalı ya da süresi dolmuş. Yeni kod isteyin.',
  'For security purposes': 'Çok sık denediniz. Lütfen biraz bekleyip tekrar deneyin.',
  'Phone provider': 'SMS servisi henüz ayarlanmamış (Supabase → Authentication → Phone).',
  'Unsupported phone provider': 'SMS servisi henüz ayarlanmamış (Supabase → Authentication → Phone).',
};
const hataMetni = (m: string) => Object.entries(HATALAR).find(([k]) => m.includes(k))?.[1] ?? m;

export function GirisFormu({ sonra }: { sonra: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [adim, setAdim] = useState<Adim>('telefon');
  const [telefon, setTelefon] = useState('');
  const [e164, setE164] = useState('');
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
    const n = telefonDuzelt(telefon);
    if (!n) return setHata('Geçerli bir cep telefonu girin (ör. 0532 123 45 67).');
    setYukleniyor(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: n });
    setYukleniyor(false);
    if (error) return setHata(hataMetni(error.message));
    setE164(n);
    setKod('');
    setBekle(60);
    setAdim('kod');
    setTimeout(() => kodRef.current?.focus(), 50);
  };

  const kodDogrula = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setHata(null);
    if (!/^\d{6}$/.test(kod)) return setHata('SMS ile gelen 6 haneli kodu girin.');
    setYukleniyor(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone: e164, token: kod, type: 'sms' });
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
    if (user) await supabase.from('profiller').upsert({ id: user.id, ad_soyad: ad.trim(), telefon: e164 });
    router.replace(sonra);
    router.refresh();
  };

  const kutu = 'w-full rounded-2xl border border-[#1d2a22]/12 bg-white px-4 py-3.5 text-lg font-semibold outline-none transition focus:border-[#2f7a4f] focus:ring-4 focus:ring-[#2f7a4f]/10';
  const dugme =
    'mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#1d2a22] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#2f7a4f] disabled:opacity-60';

  return (
    <div className="w-full rounded-[28px] bg-[#fbf8f2] p-6 shadow-[0_40px_80px_-24px_rgba(0,0,0,.6)] sm:p-8">
      {adim === 'telefon' && (
        <form onSubmit={kodGonder}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7a4f]/10 text-[#2f7a4f]">
            <Phone size={24} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-medium tracking-[-0.01em]">Telefonla giriş</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">Cep telefonunuza tek kullanımlık bir kod göndereceğiz. Şifre gerekmez; hesabınız yoksa otomatik açılır.</p>
          <label htmlFor="tel" className="mt-6 block text-sm font-semibold text-[#3e5248]">
            Cep telefonu
          </label>
          <input
            id="tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0532 123 45 67"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
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
          <button type="button" onClick={() => setAdim('telefon')} className="flex items-center gap-1 text-sm font-semibold text-[#476456]">
            <ArrowLeft size={16} /> Numarayı değiştir
          </button>
          <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7a4f]/10 text-[#2f7a4f]">
            <KeyRound size={24} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-medium tracking-[-0.01em]">Kodu girin</h1>
          <p className="mt-2 text-sm leading-6 text-[#64766c]">
            <strong>{goster(e164)}</strong> numarasına 6 haneli bir kod gönderdik.
          </p>
          <input
            ref={kodRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={kod}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
            className="mt-3 w-full text-sm font-semibold text-[#238f61] disabled:text-[#9aa7a0]"
          >
            {bekle > 0 ? `Yeni kod ${bekle} sn sonra istenebilir` : 'Kodu tekrar gönder'}
          </button>
        </form>
      )}

      {adim === 'ad' && (
        <form onSubmit={adKaydet}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7a4f]/10 text-[#2f7a4f]">
            <UserRound size={24} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-medium tracking-[-0.01em]">Hoş geldiniz</h1>
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
