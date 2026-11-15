# Proje notları: İGSAŞ sürümü (İGSAŞ Toprak Asistanı)

Yeni sohbette ilk iş: **"Önce PROJE_NOTLARI.md dosyasını oku."**

## 1. Ne bu proje

- İGSAŞ (İstanbul Gübre Sanayii A.Ş.) için çiftçiye yönelik toprak analizi sitesi. Çiftçi toprak analiz raporunu yükler,
  site hangi İGSAŞ gübresini ne zaman ve dekara ne kadar vereceğini söyler.
- Temel kod: huminsoil.online (Humintech sürümü, `C:\Users\user\toprak-humintech`) kopyalandı; bütün özellikler duruyor.
  Ürün önerileri Humintech yerine İGSAŞ / KIANA ürünleri.
- Ürün bilgisinin kaynağı: ibb-toprak deposu (`lib/igsas.ts`, `lib/zkartlar.ts`), yani Prof. Dr. Metin Turan'ın
  "İGSAŞ Azərbaycan · dönem dönem infografik seti" (Z-kartlar ve "İGSAŞ Biyolojik ve Organik Destek" kutuları).

| | İGSAŞ sürümü |
|---|---|
| Bilgisayardaki klasör | `C:\Users\user\toprak-igsas` |
| GitHub | `BurhanCelik70/toprak-igsas` (açılacak) |
| Vercel projesi | `toprak-igsas` (mevcut hesapta yeni proje; iş kesinleşince Pro) |
| Alan adı | demo: `toprak-igsas.vercel.app`; ideal: İGSAŞ alt alanı (ör. `toprak.igsas.com.tr`, CNAME) |
| Supabase | ayrı yeni proje (İGSAŞ verisi ayrı) |
| Yapay zekâ anahtarı | bu siteye ayrı anahtar (maliyet ayrı izlensin) |

## 1b. Alınmış kararlar ve yapılanlar (15 Kasım 2026)

- **Dil:** şimdilik yalnız Türkçe (`lib/dil.ts` → `ACIK_DILLER = ['tr']`). İngilizce sonra: listeye `'en'` eklemek altyapıyı açar,
  ama önce `lib/ceviri-en.ts` içindeki ürün/rapor metinleri İGSAŞ'a göre gözden geçirilmeli (sözlükte eski Humintech metinleri var).
- **Alan birimi:** Türkçede dekar (`dekarli(dil)`; `alanYaz`, `dozCevir`, `tx.ha`, `dekaraCevir` Türkçede çevirmez). Diğer dillerde hektar.
  `lib/ceviri-tr.ts` (dekar → hektar sözlüğü) Türkçede kullanılmıyor.
- **Ürün kataloğu:** `lib/igsas.ts` (34 ürün: KIANA biyolojik, organik madde, yaprak, mineral; marka İGSAŞ/KIANA, grup, rol,
  yol başına doz, etiket, öneri kuralları, organik madde protokolü, `urunBilgisi`, `igsasUrunBul`, `satinAlmaLinki`).
  `lib/humintech.ts` silindi.
- **Z-kartlar:** `lib/zkartlar.ts` ibb-toprak'taki İGSAŞ sürümü (25 bitki). OCR düzeltmeleri: "K2SOs" → K₂SO₄, "bölünmüş" yazımları,
  Çeltik hedef metnindeki karışmış satır. Mineral gübreler ürün adıyla (DAP, NPK, UAN-32 …) önerilir, saf besine çevrilmez.
- `lib/tahilSulama.ts`, `lib/besinler.ts`, `lib/teshis.ts`, `lib/noksanliklar.ts`: ibb-toprak'taki İGSAŞ sürümleri (dekar).
- **Yapay zekâ:** `app/api/yorum` sistem mesajı İGSAŞ/KIANA kataloğu ve dekarla; plan sürümü `COZUM_SURUMU = 'igsas-1'`.
  `su-yorum` ve `teshis` uygulama adı "İGSAŞ Toprak Asistanı".
- **Rapor:** rozetler İGSAŞ (koyu yeşil) / KIANA (açık yeşil yapraklı). "Tarlanız için İGSAŞ ürünleri" listesi Z-karttan + yapay zekâ
  planından hesaplanır (`RaporParcalari.tsx` → `HOCA_PROGRAMI = false`).
- **3D atlas:** duruyor. Atlastaki marka metinleri İGSAŞ yapıldı (`public/atlas/index.html`). Atlasın "Program" sekmesi Humintech
  ürünleriyle yazılı olduğu için her dilde ve tam ekranda gizli (`prog=0`). Atlasın altındaki "Bu dönemde verilecek gübre" paneli
  İGSAŞ Z-kartından gelir (`AtlasEvrePaneli.tsx`; atlasın dönemleriyle orantılı eşleme).
  ⚠️ Atlas içindeki kontrol / "İGSAŞ programı" verim karşılaştırması hocanın Humintech modelinden geliyor; hocaya sorulmalı.
- **Giriş ekranı:** `components/VideoGiris.tsx` → `EbruGiris` (ebru resmi + yavaş yakınlaşma + altın toz, ortada başlık,
  yarı saydam bilgi kutusu, iki düğme). Resim: `public/giris/igsas-ebru.webp` ve `-m.webp` (Gemini'den yüksek çözünürlük; yoksa
  `public/hasat.jpg` görünür). Taslak `igsas-giris-ebru.html`'deki "çuvaldan huniye taneler" hareketi resim gelince eklenecek.
- **Marka:** `lib/marka.ts` (İGSAŞ Toprak Asistanı, slogan "Toprağınızı tanıyın, bereketi büyütün"), geçici yazı logosu
  `components/IgsasLogo.tsx` (resmî logo İGSAŞ'tan istenecek). Ana renk koyu yeşil #1C4734, düğmeler parlak yeşil.
- Ana sayfa önizleme kartı UAN-32 + NPK 18-18-18; örnek rapor (`OrnekRapor.tsx`) İGSAŞ ürünleriyle.

## 1c. Bekleyenler (İGSAŞ'tan istenecekler)

- Resmî logo, iletişim, bayi/e-mağaza adresi → `lib/igsas.ts` `SATIN_ALMA` (boşken "Fiyat al" düğmesi çıkmaz).
- Ürünlerin garanti edilen içerikleri, ürün sayfası adresleri, yazısız çuval görselleri (`public/urunler/<kod>.png`, üründe `kod`).
- Gizlilik metninde veri sorumlusu (İGSAŞ mı, Yeditepe mi?) ve Impressum.
- "~2 dakika" ve "ÜCRETSİZ" ifadeleri (ana sayfa "Ücretsiz başla").

## 2. Teknik yapı

- Next.js 16 (App Router), React 19, Tailwind v4, lucide-react, Supabase (giriş + veritabanı), Anthropic SDK (rapor okuma, yorum, teşhis), Vercel.
- `AGENTS.md`: bu Next.js sürümü eskilerden farklı; kod yazmadan önce `node_modules/next/dist/docs/` okunmalı.
- **Ortam değişkenleri (Vercel → Settings → Environment Variables):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (Config); `ANTHROPIC_API_KEY` (Secret); `ANTHROPIC_MODEL` (boşsa kod `claude-sonnet-5-5` kullanır).
  `.env.local` ve anahtarlar asla GitHub'a gönderilmez, sohbete yapıştırılmaz.
- **Veritabanı:** `supabase/schema.sql` (+ `guncelleme-il.sql`). Supabase → SQL Editor'da çalıştırılır; tekrar çalıştırmak zarar vermez.
- **Giriş:** Google (Supabase provider) ve e-posta kodu. E-posta için Resend SMTP kurulacak (bkz. `KURULUM.md`, alan adını `(İGSAŞ alan adı)` yaparak).

### Önemli dosyalar

| Dosya | Ne yapar |
|---|---|
| `lib/marka.ts` | Site adı, slogan, kurum, iş birliği, iletişim. Marka değişikliği önce buradan. |
| `lib/toprak.ts` | Toprak raporu tipi, değerlendirme eşikleri |
| `lib/indeks.ts` | Toprak Kalite İndeksi (hocanın Excel tablosu; 0–5 puan, ortalama → 100 üzerinden; kimyasal/fiziksel/biyolojik) |
| `lib/zkartlar.ts` | Bitki büyüme evreleri ve İGSAŞ/KIANA gübre programları (25 bitki) |
| `lib/igsas.ts` | İGSAŞ/KIANA ürün kataloğu, öneri kuralları, organik madde protokolü |
| `lib/tahilSulama.ts` | Buğday/arpa/kanola/bezelye su sayısına göre İGSAŞ gübre planı |
| `lib/su.ts` | Sulama suyu karnesi (FAO 29: tuzluluk, SAR, klorür, bor, nitrat) |
| `lib/suIhtiyaci.ts`, `lib/tagem.ts`, `lib/iklim.ts` | Bitki su ihtiyacı (FAO-56) ve TAGEM-SUET verileri |
| `lib/par.ts` | İllere göre PAR (NASA POWER) |
| `lib/noksanliklar.ts`, `lib/hastaliklar.ts` | 63 noksanlık, 28 hastalık kataloğu (resimli; ilaç önermez) |
| `lib/besinler.ts` | "Besinleri tanıyalım" (15 element) + gübre torbası hesaplayıcı |
| `components/site.tsx` | Üst menü ve alt kısım (footer'da İBB satırı burada) |
| `app/api/*` | Yapay zekâ uçları: `rapor-oku`, `yorum`, `su-oku`, `su-yorum`, `teshis` |

## 3. Veri kaynakları (sunumda söylenebilir)

- **Su ihtiyacı:** FAO-56. ETc = ETo × Kc → − etkili yağış (USDA-SCS) = net sulama. 1 mm = dekara 1 m³.
  - **TAGEM-SUET** (tagemsuet.tarimorman.gov.tr, Burhan'ın hesabıyla): Penman-Monteith ETo, MGM istasyonları, TAGEM 2017 Kc değerleri.
  - İstanbul'da 7 istasyon eklendi (Kumköy, Bahçeköy, Florya, Kartal, Kireçburnu, Göztepe, Şile); tarlanın ilçesine göre en yakın istasyon seçiliyor.
  - TAGEM bitki verisi (İstanbul listesinden): mısır, ayçiçeği, kanola, domates, salatalık (hıyar), soğan. Doğrulama: mısır ve ayçiçeğinde SUET sonucuyla fark < %1.
  - Veri SUET'in ETo grafiğinin SVG dışa aktarımından okunuyor (Referans Bitki Su Tüketimi → grafik menüsü → SVG). Okuma betiği eski sohbette; yıllık toplam SUET'in yazdığı değerle %1 içinde.
  - SUET'in herkese açık API'si yok; siteye arka kapıdan bağlanılmıyor. Resmî veri talebi (hoca/İBB üzerinden) uzun vadeli yol.
  - Diğer illerde: Hargreaves ETo (NASA POWER 2001–2025) + FAO Tablo 12 Kc.
- **PAR:** NASA POWER, 2001–2025, il merkezi. DLI = MJ × 4,57.
- **Toprak kalite indeksi:** hocanın tablosu (`Toprak_kalite_indeksi_tablo.xlsx`). Hocaya sorulacak: toplam azot aralık yazım hatası, kireç puanı yönü, Ca/K/Mg tavanı (2 me/100 g).

## 4. Çalışma yöntemi

- Claude, bilgisayardaki klasöre köprü (device bridge) üzerinden dosya yazar; terminale doğrudan erişemez.
  Değişikliği Burhan GitHub'a gönderir; Vercel otomatik yayınlar:
  ```
  cd C:\Users\user\toprak-igsas
  git add <dosyalar>
  git commit -m "açıklama"
  git push
  ```
- `git add .` yerine dosyaları tek tek eklemek tercih edilir (yanlışlıkla `.env.local` vb. gitmesin).
- `package.json`, `tsconfig.json`, `next.config.ts` bilgisayardaki hâliyle kalır; Claude bunları değiştirmez.
- Resimler Gemini/Higgsfield ile üretilip webp'ye çevriliyor (noksanlık 1024×768, evre 1280×720, hastalık 1280×960; resimde yazı olmaz).
- Burhan kısa, net, kopyala-yapıştır hazır talimat ister; her adım ayrı kutuda.

