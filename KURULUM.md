# Tarım 4.0 — Kurulum Rehberi

Bu, ayrı ve yeni bir projedir (eski İBB sitesinin üstüne kopyalamayın). Yeni bir GitHub deposu açıp bu klasörü oraya koyun.

## 1. Bilgisayarda çalıştırma

```bash
cd tarim40
npm install
cp .env.example .env.local     # sonra .env.local'i doldurun (adım 2 ve 4)
npm run dev                    # http://localhost:3000
```

## 2. Supabase projesi (veritabanı + giriş)

1. https://supabase.com → **New project**. Bölge olarak **Frankfurt (eu-central-1)** seçin (Türkiye'ye en yakın).
2. Sol menü **SQL Editor** → **New query** → `supabase/schema.sql` dosyasının tamamını yapıştırın → **Run**.
   - Tablolar (profiller, tarlalar, analizler) ve "herkes yalnızca kendi tarlasını görür" kuralları kurulur.
   - Dosyayı tekrar çalıştırmak zarar vermez.
3. **Project Settings → API Keys**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` / secret anahtarını **hiçbir yere koymayın**, gerekmiyor.

## 3. E-postayla giriş (şifresiz, ücretsiz)

Kullanıcı e-postasını yazar, gelen 6 haneli kodu girer. Hesap yoksa otomatik açılır.

1. **Authentication → Sign In / Providers → Email**: açık olsun. **Confirm email** açık kalabilir.
2. **Authentication → Emails → Templates**: `supabase/eposta-sablonu.html` dosyasının içeriğini hem **Magic Link** hem **Confirm signup** şablonuna yapıştırın. Konu satırı: `Tarım 4.0 giriş kodunuz: {{ .Token }}`. (Şablonda `{{ .Token }}` yoksa kod yerine bağlantı gider ve giriş çalışmaz.)
3. **E-posta gönderici (zorunlu):** Supabase'in kendi göndericisi yalnızca deneme içindir; saatte çok az e-posta gönderir. Ücretsiz **Resend** bağlayın (ayda 3.000, günde 100 e-posta):
   - resend.com'da hesap açın → **Domains → Add Domain** → `toprakanaliz40.online`.
   - Resend'in gösterdiği DNS kayıtlarını (TXT/MX/DKIM) GoDaddy → DNS'e ekleyin, Resend'de **Verify**'a basın.
   - **API Keys → Create** (yetki: Sending access) → anahtarı kopyalayın.
   - Supabase → **Authentication → Emails → SMTP Settings → Enable custom SMTP**:
     - Sender email: `kod@toprakanaliz40.online` · Sender name: `Tarım 4.0`
     - Host: `smtp.resend.com` · Port: `465` · Username: `resend` · Password: Resend API anahtarı
4. **Authentication → Rate Limits**: "emails per hour" değerini ihtiyaca göre artırın (ör. 100).
5. **Authentication → URL Configuration → Site URL**: `https://www.toprakanaliz40.online`

## 4. Yapay zekâ anahtarı

`ANTHROPIC_API_KEY` → console.anthropic.com. Daha önce ekran görüntüsünde görünen anahtarı iptal edip yenisini oluşturduğunuzdan emin olun.
`ANTHROPIC_MODEL=claude-sonnet-4-6` (istediğiniz modeli yazabilirsiniz).

## 5. Vercel'e yayınlama

1. Kodu yeni GitHub deposuna gönderin (`.env.local` `.gitignore` sayesinde gitmez — kontrol edin).
2. Vercel → **Add New → Project** → depoyu seçin.
3. **Environment Variables**: `.env.example`'daki 4 değişkenin hepsini girin → **Deploy**.
4. Çıkan adresi Supabase'te **Site URL** olarak kaydedin (adım 3.4).

## 6. Telefona kurma

Siteyi telefonda Chrome/Safari ile açın:
- Android: menü → **Ana ekrana ekle / Uygulamayı yükle**
- iPhone: Paylaş → **Ana Ekrana Ekle**

Uygulama simgesiyle, tam ekran açılır ve doğrudan "Tarlalarım"a gider.

## Nasıl çalışıyor

- **Giriş:** e-posta → e-postaya gelen kod → (ilk girişte) ad soyad.
- **Tarlalarım → +:** tarla adı, dekar, ilçe, bitki, sulama yöntemi (damla / yağmurlama / pivot / salma / kuru) ve süresi bir kez girilir.
- **Analiz ekle:** Excel/PDF/fotoğraf ya da elle giriş. Tarla bilgileri tekrar sorulmaz. Kayıt sonrası yapay zekâ çözüm planını bir kez üretir ve saklar (tekrar açınca ücret ödenmez; "Çözüm planını yenile" ile yeniden üretilir).
- **İkinci analizden itibaren:** her parametre için İyileşti / Kötüleşti / Değişmedi / Uygun kaldı, kalite indeksi seyri grafiği.
- **Uygulama reçetesi:** bitkinin Z-kart programı sulama yöntemine göre süzülür, "Bu ay" vurgulanır, dozlar tarlanın dekarıyla çarpılıp toplam miktar yazılır; damla/yağmurlamada sulama saat çizelgesi, pivotta enjeksiyon hızı gösterilir.

## Hocanın onaylaması gerekenler

`lib/sulama.ts` dosyası **taslaktır** — üstte açıklamalar var, rakamlar tek yerde:
- `ZAMANLAMA`: damlada ilk %25 su, ortadaki %50 gübre, son %25 temiz su (6 saatte 0:00–1:30 / 1:30–4:30 / 4:30–6:00). Yağmurlamada 6 saatin 2. saati.
- `GRUPLAR`: hangi sulama yönteminde Z-kartın hangi sütunu (damla / yapraktan / topraktan) kullanılacak.
- `KURALLAR`: her yöntem için dikkat maddeleri (A/B tankı, asit + mikrobiyal ürün, pivotta rüzgâr ve yıkama vb.).

Ayrıca netleştirilecek: notlardaki "KIANA 1–2 kg/da" ürününün KIANA SOIL SOUL olarak eşlenmesi, "ODA granül"ün doğru ürün adı.

## Ticari kullanım öncesi

- Z-kart içerikleri ve ürün dozları İGSAŞ / Prof. Dr. Metin Turan'a ait — uygulamayı satmadan veya herkese açmadan önce yazılı izin alın.
- "Tarım 4.0" genel bir ifade; markalaşmak isterseniz TÜRKPATENT'te benzer tescilleri kontrol edin. Ad tek yerden değişir: `lib/marka.ts`.
- Kişisel veri (telefon numarası) topladığınız için KVKK aydınlatma metni eklemeniz gerekir.
