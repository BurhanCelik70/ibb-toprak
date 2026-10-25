import { AppHeader, SiteFooter } from '@/components/site';
import { MARKA } from '@/lib/marka';

export const metadata = { title: 'Gizlilik ve KVKK Aydınlatma Metni' };

const GUNCELLEME = '25 Ekim 2026';

export default function GizlilikSayfasi() {
  const iletisim = MARKA.eposta || 'uygulamadaki iletişim adresi';
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0e6] text-[#1d2a22]">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87a2a]">Son güncelleme: {GUNCELLEME}</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">Gizlilik ve KVKK Aydınlatma Metni</h1>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-[#3f4a42] [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#1d2a22] [&_li]:ml-5 [&_li]:list-disc">
          <section>
            <p>
              {MARKA.ad} (“uygulama”), toprak analiz raporlarını yorumlayan ve gübreleme önerisi sunan bir web uygulamasıdır. Bu metin, 6698
              sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hangi verileri neden işlediğimizi ve haklarınızı açıklar.
            </p>
          </section>

          <section>
            <h2>Hangi verileri topluyoruz?</h2>
            <ul>
              <li><strong>Hesap bilgileri:</strong> adınız soyadınız ve e-posta adresiniz. Google ile girişte bu bilgiler ve profil resminiz Google hesabınızdan alınır; şifreniz bize hiçbir zaman ulaşmaz.</li>
              <li><strong>Tarla bilgileri:</strong> tarlaya verdiğiniz ad, il-ilçe, alan, bitki, sulama yöntemi ve notlarınız.</li>
              <li><strong>Toprak analizleri:</strong> yüklediğiniz rapordaki ölçüm değerleri ve bunlara göre oluşturulan öneriler.</li>
              <li><strong>Teknik kayıtlar:</strong> oturumun açık kalması için gerekli çerezler ve hizmetin güvenliği için tutulan sınırlı sunucu kayıtları.</li>
            </ul>
          </section>

          <section>
            <h2>Verileri ne için kullanıyoruz?</h2>
            <ul>
              <li>Hesabınızı açmak, giriş yapmanızı sağlamak ve tarlalarınızı yalnızca size göstermek,</li>
              <li>Analizlerinizi saklamak, öncekilerle karşılaştırmak ve size gübreleme önerisi hazırlamak,</li>
              <li>Hizmetin güvenliğini sağlamak ve hataları gidermek.</li>
            </ul>
            <p className="mt-2">Verilerinizi satmayız, reklam için kullanmayız ve izniniz olmadan pazarlama mesajı göndermeyiz.</p>
          </section>

          <section>
            <h2>Hizmet sağlayıcılar ve yurt dışına aktarım</h2>
            <p>Uygulama aşağıdaki hizmet sağlayıcılarla çalışır; bu nedenle verileriniz yurt dışındaki sunucularda işlenir:</p>
            <ul>
              <li><strong>Supabase</strong> (veritabanı ve giriş): veriler Avrupa Birliği’nde (İrlanda) saklanır.</li>
              <li><strong>Vercel</strong> (barındırma): site Avrupa Birliği’ndeki (İrlanda) sunuculardan çalışır.</li>
              <li><strong>Anthropic</strong> (yapay zekâ yorumu): yalnızca toprak ölçüm değerleri, il-bölge, bitki, alan ve sulama bilgisi gönderilir; adınız ve e-posta adresiniz gönderilmez.</li>
              <li><strong>Google</strong> (yalnızca “Google ile devam et” seçilirse): kimlik doğrulama.</li>
            </ul>
          </section>

          <section>
            <h2>Ne kadar süre saklıyoruz?</h2>
            <p>Hesabınız açık kaldığı sürece verilerinizi saklarız. Bir tarlayı veya analizi sildiğinizde ilgili kayıtlar kalıcı olarak silinir. Hesabınızın tamamen silinmesini istediğinizde, talebinizden sonra en geç 30 gün içinde tüm verileriniz silinir.</p>
          </section>

          <section>
            <h2>Haklarınız</h2>
            <p>KVKK’nın 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi isteme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarara uğramanız hâlinde giderim talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak veya hesabınızı sildirmek için <strong>{iletisim}</strong> adresine yazabilirsiniz.</p>
          </section>

          <section>
            <h2>Öneriler hakkında</h2>
            <p>Uygulamadaki öneriler laboratuvar değerlerine ve genel tarımsal bilgilere dayanır; tarlanızın tüm koşullarını bilemez. Uygulamadan önce ürün etiketlerini okuyun.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
