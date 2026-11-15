/**
 * Gizlilik metni (dil başına). {ad} → uygulama adı, {iletisim} → iletişim e-postası.
 * Hukuki çerçeve Türkiye'deki 6698 sayılı KVKK'dır; diğer diller Türkçe metnin çevirisidir.
 */
import type { Dil } from './dil';

export type GizlilikBolumu = { baslik?: string; paragraf?: string; maddeler?: [string, string][]; liste?: string[]; son?: string };
export type GizlilikMetni = { baslik: string; guncelleme: string; tarih: string; yedekIletisim: string; bolumler: GizlilikBolumu[] };

export const GIZLILIK: Record<Dil, GizlilikMetni> = {
  tr: {
    baslik: 'Gizlilik ve KVKK Aydınlatma Metni',
    guncelleme: 'Son güncelleme',
    tarih: '31 Ekim 2026',
    yedekIletisim: 'uygulamadaki iletişim adresi',
    bolumler: [
      { paragraf: '{ad} (“uygulama”), toprak ve sulama suyu analiz raporlarını yorumlayan, gübreleme ve sulama önerisi sunan bir web uygulamasıdır. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hangi verileri neden işlediğimizi ve haklarınızı açıklar.' },
      {
        baslik: 'Hangi verileri topluyoruz?',
        maddeler: [
          ['Hesap bilgileri:', 'adınız soyadınız ve e-posta adresiniz. Google ile girişte bu bilgiler ve profil resminiz Google hesabınızdan alınır; şifreniz bize hiçbir zaman ulaşmaz.'],
          ['Tarla bilgileri:', 'tarlaya verdiğiniz ad, il-ilçe, alan, bitki, sulama yöntemi ve notlarınız.'],
          ['Toprak ve su analizleri:', 'yüklediğiniz rapordaki ölçüm değerleri ve bunlara göre oluşturulan öneriler. Rapor dosyasının kendisi saklanmaz; yalnızca okunan değerler kaydedilir.'],
          ['Yaprak fotoğrafları:', 'yaprak teşhisi için yüklediğiniz fotoğraflar yalnızca o anki değerlendirme için kullanılır, saklanmaz.'],
          ['Teknik kayıtlar:', 'oturumun açık kalması için gerekli çerezler ve hizmetin güvenliği için tutulan sınırlı sunucu kayıtları.'],
        ],
      },
      {
        baslik: 'Verileri ne için kullanıyoruz?',
        liste: [
          'Hesabınızı açmak, giriş yapmanızı sağlamak ve tarlalarınızı yalnızca size göstermek,',
          'Analizlerinizi saklamak, öncekilerle karşılaştırmak ve size gübreleme önerisi hazırlamak,',
          'Hizmetin güvenliğini sağlamak ve hataları gidermek.',
        ],
        son: 'Verilerinizi satmayız, reklam için kullanmayız ve izniniz olmadan pazarlama mesajı göndermeyiz.',
      },
      {
        baslik: 'Hizmet sağlayıcılar ve yurt dışına aktarım',
        paragraf: 'Uygulama aşağıdaki hizmet sağlayıcılarla çalışır; bu nedenle verileriniz yurt dışındaki sunucularda işlenir:',
        maddeler: [
          ['Supabase', '(veritabanı ve giriş): veriler Avrupa Birliği’ndeki sunucularda saklanır.'],
          ['Vercel', '(barındırma): site Avrupa Birliği’ndeki sunuculardan çalışır.'],
          ['Anthropic', '(yapay zekâ): yorum için ölçüm değerleri, il-bölge, bitki, alan ve sulama bilgisi; rapor okuma için yüklediğiniz rapor dosyası ya da fotoğrafı; yaprak teşhisi için yaprak fotoğrafları ve cevaplarınız gönderilir. Adınız ve e-posta adresiniz gönderilmez. Rapor üzerinde adınız yazıyorsa, yüklemeden önce kapatabilirsiniz.'],
          ['Google', '(yalnızca “Google ile devam et” seçilirse): kimlik doğrulama.'],
        ],
      },
      { baslik: 'Ne kadar süre saklıyoruz?', paragraf: 'Hesabınız açık kaldığı sürece verilerinizi saklarız. Bir tarlayı veya analizi sildiğinizde ilgili kayıtlar kalıcı olarak silinir. Hesabınızın tamamen silinmesini istediğinizde, talebinizden sonra en geç 30 gün içinde tüm verileriniz silinir.' },
      { baslik: 'Haklarınız', paragraf: 'KVKK’nın 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi isteme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zarara uğramanız hâlinde giderim talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak veya hesabınızı sildirmek için {iletisim} adresine yazabilirsiniz.' },
      { baslik: 'Öneriler hakkında', paragraf: 'Uygulamadaki öneriler laboratuvar değerlerine ve genel tarımsal bilgilere dayanır; tarlanızın tüm koşullarını bilemez. Fotoğraftan yapılan yaprak teşhisi bir ön değerlendirmedir ve yanılabilir; kesin sonuç için yaprak analizi yaptırın. Uygulamadan önce ürün etiketlerini okuyun.' },
    ],
  },
  en: {
    baslik: 'Privacy Notice',
    guncelleme: 'Last updated',
    tarih: '31 October 2026',
    yedekIletisim: 'the contact address in the app',
    bolumler: [
      { paragraf: '{ad} (“the app”) is a web application that interprets soil and irrigation water analysis reports and offers fertilisation and irrigation recommendations. This notice explains which data we process and why, and your rights, under the Turkish Personal Data Protection Law No. 6698 (KVKK).' },
      {
        baslik: 'What data do we collect?',
        maddeler: [
          ['Account details:', 'your full name and email address. If you sign in with Google, these details and your profile picture are taken from your Google account; your password never reaches us.'],
          ['Field details:', 'the name you give the field, province/district, area, crop, irrigation method and your notes.'],
          ['Soil and water analyses:', 'the measured values in the report you upload and the recommendations created from them. The report file itself is not stored; only the values read are saved.'],
          ['Leaf photos:', 'photos you upload for leaf diagnosis are used only for that assessment and are not stored.'],
          ['Technical records:', 'cookies needed to keep you signed in and limited server logs kept for the security of the service.'],
        ],
      },
      {
        baslik: 'What do we use the data for?',
        liste: [
          'To create your account, let you sign in and show your fields only to you,',
          'To store your analyses, compare them with earlier ones and prepare fertilisation recommendations for you,',
          'To keep the service secure and fix errors.',
        ],
        son: 'We do not sell your data, we do not use it for advertising and we do not send marketing messages without your consent.',
      },
      {
        baslik: 'Service providers and transfers abroad',
        paragraf: 'The app works with the following service providers; your data is therefore processed on servers outside Turkey:',
        maddeler: [
          ['Supabase', '(database and sign-in): data is stored on servers in the European Union.'],
          ['Vercel', '(hosting): the site runs from servers in the European Union.'],
          ['Anthropic', '(artificial intelligence): for interpretation, the measured values, province/region, crop, area and irrigation details; for report reading, the report file or photo you upload; for leaf diagnosis, the leaf photos and your answers are sent. Your name and email address are not sent. If your name appears on the report, you can cover it before uploading.'],
          ['Google', '(only if “Continue with Google” is chosen): authentication.'],
        ],
      },
      { baslik: 'How long do we keep data?', paragraf: 'We keep your data for as long as your account is open. When you delete a field or an analysis, the related records are deleted permanently. If you ask for your account to be deleted completely, all your data is deleted within 30 days of your request at the latest.' },
      { baslik: 'Your rights', paragraf: 'Under Article 11 of the KVKK you have the right to learn whether your data is processed, to request information, to ask for it to be corrected or deleted, to object to processing and to claim compensation if you suffer damage. To exercise these rights or to have your account deleted, you can write to {iletisim}.' },
      { baslik: 'About the recommendations', paragraf: 'The recommendations in the app are based on laboratory values and general agricultural knowledge; they cannot know all the conditions of your field. Leaf diagnosis from a photo is a preliminary assessment and can be wrong; for a reliable result, have a leaf analysis done. Read the product labels before applying.' },
    ],
  },
  de: {
    baslik: 'Datenschutzhinweise',
    guncelleme: 'Zuletzt aktualisiert',
    tarih: '31. Oktober 2026',
    yedekIletisim: 'die Kontaktadresse in der App',
    bolumler: [
      { paragraf: '{ad} („die App“) ist eine Webanwendung, die Boden- und Bewässerungswasseranalysen auswertet und Dünge- und Bewässerungsempfehlungen gibt. Diese Hinweise erklären nach dem türkischen Datenschutzgesetz Nr. 6698 (KVKK), welche Daten wir zu welchem Zweck verarbeiten und welche Rechte Sie haben.' },
      {
        baslik: 'Welche Daten erheben wir?',
        maddeler: [
          ['Kontodaten:', 'Ihr Vor- und Nachname und Ihre E-Mail-Adresse. Bei der Anmeldung mit Google werden diese Angaben und Ihr Profilbild aus Ihrem Google-Konto übernommen; Ihr Passwort erreicht uns nie.'],
          ['Felddaten:', 'der Name des Feldes, Bundesland/Region, Fläche, Kultur, Bewässerungsart und Ihre Notizen.'],
          ['Boden- und Wasseranalysen:', 'die Messwerte aus dem hochgeladenen Bericht und die daraus erstellten Empfehlungen. Die Berichtsdatei selbst wird nicht gespeichert, nur die ausgelesenen Werte.'],
          ['Blattfotos:', 'Fotos für die Blattdiagnose werden nur für diese Auswertung verwendet und nicht gespeichert.'],
          ['Technische Daten:', 'Cookies, die für die Anmeldung nötig sind, und begrenzte Serverprotokolle für die Sicherheit des Dienstes.'],
        ],
      },
      {
        baslik: 'Wofür verwenden wir die Daten?',
        liste: [
          'um Ihr Konto anzulegen, die Anmeldung zu ermöglichen und Ihre Felder nur Ihnen zu zeigen,',
          'um Ihre Analysen zu speichern, mit früheren zu vergleichen und Düngeempfehlungen für Sie zu erstellen,',
          'um die Sicherheit des Dienstes zu gewährleisten und Fehler zu beheben.',
        ],
        son: 'Wir verkaufen Ihre Daten nicht, nutzen sie nicht für Werbung und senden ohne Ihre Einwilligung keine Werbenachrichten.',
      },
      {
        baslik: 'Dienstleister und Übermittlung ins Ausland',
        paragraf: 'Die App arbeitet mit den folgenden Dienstleistern; Ihre Daten werden daher auf Servern außerhalb der Türkei verarbeitet:',
        maddeler: [
          ['Supabase', '(Datenbank und Anmeldung): Die Daten werden auf Servern in der Europäischen Union gespeichert.'],
          ['Vercel', '(Hosting): Die Website läuft auf Servern in der Europäischen Union.'],
          ['Anthropic', '(künstliche Intelligenz): Für die Auswertung werden Messwerte, Region, Kultur, Fläche und Bewässerungsart übermittelt; zum Auslesen des Berichts die hochgeladene Datei oder das Foto; für die Blattdiagnose die Blattfotos und Ihre Antworten. Ihr Name und Ihre E-Mail-Adresse werden nicht übermittelt. Steht Ihr Name auf dem Bericht, können Sie ihn vor dem Hochladen abdecken.'],
          ['Google', '(nur bei „Weiter mit Google“): Authentifizierung.'],
        ],
      },
      { baslik: 'Wie lange speichern wir die Daten?', paragraf: 'Wir speichern Ihre Daten, solange Ihr Konto besteht. Wenn Sie ein Feld oder eine Analyse löschen, werden die zugehörigen Daten dauerhaft gelöscht. Wenn Sie die vollständige Löschung Ihres Kontos verlangen, werden alle Ihre Daten spätestens 30 Tage nach Ihrer Anfrage gelöscht.' },
      { baslik: 'Ihre Rechte', paragraf: 'Nach Art. 11 KVKK haben Sie das Recht zu erfahren, ob Ihre Daten verarbeitet werden, Auskunft zu verlangen, die Berichtigung oder Löschung zu verlangen, der Verarbeitung zu widersprechen und bei einem Schaden Ersatz zu fordern. Um diese Rechte auszuüben oder Ihr Konto löschen zu lassen, schreiben Sie an {iletisim}.' },
      { baslik: 'Zu den Empfehlungen', paragraf: 'Die Empfehlungen der App beruhen auf Laborwerten und allgemeinem landwirtschaftlichem Wissen; sie können nicht alle Bedingungen Ihres Feldes kennen. Die Blattdiagnose per Foto ist eine Vorabbewertung und kann sich irren; für ein sicheres Ergebnis lassen Sie eine Blattanalyse machen. Lesen Sie vor der Anwendung die Produktetiketten.' },
    ],
  },
  es: {
    baslik: 'Aviso de privacidad',
    guncelleme: 'Última actualización',
    tarih: '31 de octubre de 2026',
    yedekIletisim: 'la dirección de contacto de la aplicación',
    bolumler: [
      { paragraf: '{ad} («la aplicación») es una aplicación web que interpreta informes de análisis de suelo y de agua de riego y ofrece recomendaciones de abonado y riego. Este aviso explica, conforme a la Ley turca de Protección de Datos Personales n.º 6698 (KVKK), qué datos tratamos, con qué fin y cuáles son sus derechos.' },
      {
        baslik: '¿Qué datos recogemos?',
        maddeler: [
          ['Datos de la cuenta:', 'su nombre y apellidos y su correo electrónico. Si inicia sesión con Google, estos datos y su foto de perfil se toman de su cuenta de Google; su contraseña nunca nos llega.'],
          ['Datos de la parcela:', 'el nombre que le da, provincia/municipio, superficie, cultivo, sistema de riego y sus notas.'],
          ['Análisis de suelo y agua:', 'los valores medidos del informe que sube y las recomendaciones creadas a partir de ellos. El archivo del informe no se guarda; solo se registran los valores leídos.'],
          ['Fotos de hojas:', 'las fotos que sube para el diagnóstico se usan solo para esa valoración y no se guardan.'],
          ['Registros técnicos:', 'las cookies necesarias para mantener la sesión y registros limitados del servidor para la seguridad del servicio.'],
        ],
      },
      {
        baslik: '¿Para qué usamos los datos?',
        liste: [
          'Para crear su cuenta, permitirle iniciar sesión y mostrar sus parcelas solo a usted,',
          'Para guardar sus análisis, compararlos con los anteriores y preparar recomendaciones de abonado,',
          'Para garantizar la seguridad del servicio y corregir errores.',
        ],
        son: 'No vendemos sus datos, no los usamos para publicidad y no enviamos mensajes comerciales sin su consentimiento.',
      },
      {
        baslik: 'Proveedores de servicios y transferencias internacionales',
        paragraf: 'La aplicación trabaja con los siguientes proveedores; por ello sus datos se tratan en servidores fuera de Turquía:',
        maddeler: [
          ['Supabase', '(base de datos e inicio de sesión): los datos se guardan en servidores de la Unión Europea.'],
          ['Vercel', '(alojamiento): el sitio funciona desde servidores de la Unión Europea.'],
          ['Anthropic', '(inteligencia artificial): para la interpretación se envían los valores medidos, la provincia/región, el cultivo, la superficie y el sistema de riego; para leer el informe, el archivo o la foto que sube; para el diagnóstico de hojas, las fotos y sus respuestas. Su nombre y su correo no se envían. Si su nombre aparece en el informe, puede taparlo antes de subirlo.'],
          ['Google', '(solo si elige «Continuar con Google»): autenticación.'],
        ],
      },
      { baslik: '¿Cuánto tiempo guardamos los datos?', paragraf: 'Guardamos sus datos mientras su cuenta esté abierta. Cuando elimina una parcela o un análisis, los registros correspondientes se borran de forma permanente. Si pide la eliminación completa de su cuenta, todos sus datos se borran como máximo 30 días después de su solicitud.' },
      { baslik: 'Sus derechos', paragraf: 'Según el artículo 11 de la KVKK tiene derecho a saber si se tratan sus datos, a pedir información, a solicitar su rectificación o supresión, a oponerse al tratamiento y a reclamar una indemnización si sufre un perjuicio. Para ejercer estos derechos o eliminar su cuenta, escriba a {iletisim}.' },
      { baslik: 'Sobre las recomendaciones', paragraf: 'Las recomendaciones se basan en valores de laboratorio y en conocimientos agronómicos generales; no pueden conocer todas las condiciones de su parcela. El diagnóstico de hojas a partir de una foto es una valoración previa y puede equivocarse; para un resultado seguro haga un análisis foliar. Lea las etiquetas de los productos antes de aplicarlos.' },
    ],
  },
  ar: {
    baslik: 'إشعار الخصوصية',
    guncelleme: 'آخر تحديث',
    tarih: '31 أكتوبر 2026',
    yedekIletisim: 'عنوان التواصل في التطبيق',
    bolumler: [
      { paragraf: '{ad} («التطبيق») تطبيق ويب يفسّر تقارير تحليل التربة ومياه الري ويقدّم توصيات للتسميد والري. يوضّح هذا الإشعار، وفق قانون حماية البيانات الشخصية التركي رقم 6698 (KVKK)، البيانات التي نعالجها ولماذا، وحقوقك.' },
      {
        baslik: 'ما البيانات التي نجمعها؟',
        maddeler: [
          ['بيانات الحساب:', 'اسمك الكامل وبريدك الإلكتروني. عند الدخول عبر Google تؤخذ هذه البيانات وصورتك الشخصية من حسابك في Google، ولا تصلنا كلمة مرورك أبدًا.'],
          ['بيانات الحقل:', 'اسم الحقل والمنطقة والمساحة والمحصول وطريقة الري وملاحظاتك.'],
          ['تحاليل التربة والماء:', 'القيم المقيسة في التقرير الذي ترفعه والتوصيات المبنية عليها. لا يُحفظ ملف التقرير نفسه، بل القيم المقروءة فقط.'],
          ['صور الأوراق:', 'تُستخدم الصور التي ترفعها لتشخيص الورقة لهذا التقييم فقط ولا تُحفظ.'],
          ['السجلات التقنية:', 'ملفات تعريف الارتباط اللازمة لبقاء الجلسة مفتوحة، وسجلات خادم محدودة لأمن الخدمة.'],
        ],
      },
      {
        baslik: 'لماذا نستخدم البيانات؟',
        liste: ['لإنشاء حسابك وتمكينك من الدخول وعرض حقولك لك وحدك،', 'لحفظ تحاليلك ومقارنتها بالسابقة وإعداد توصيات التسميد لك،', 'لضمان أمن الخدمة وإصلاح الأخطاء.'],
        son: 'لا نبيع بياناتك ولا نستخدمها للإعلانات ولا نرسل رسائل تسويقية دون موافقتك.',
      },
      {
        baslik: 'مزوّدو الخدمة والنقل إلى الخارج',
        paragraf: 'يعمل التطبيق مع مزوّدي الخدمة التالين، لذلك تُعالج بياناتك على خوادم خارج تركيا:',
        maddeler: [
          ['Supabase', '(قاعدة البيانات وتسجيل الدخول): تُحفظ البيانات على خوادم في الاتحاد الأوروبي.'],
          ['Vercel', '(الاستضافة): يعمل الموقع من خوادم في الاتحاد الأوروبي.'],
          ['Anthropic', '(الذكاء الاصطناعي): تُرسل القيم المقيسة والمنطقة والمحصول والمساحة وطريقة الري للتفسير، وملف التقرير أو صورته لقراءته، وصور الأوراق وإجاباتك لتشخيص الورقة. لا يُرسل اسمك ولا بريدك الإلكتروني. إن كان اسمك مكتوبًا على التقرير فيمكنك تغطيته قبل الرفع.'],
          ['Google', '(فقط عند اختيار «المتابعة باستخدام Google»): التحقق من الهوية.'],
        ],
      },
      { baslik: 'كم من الوقت نحتفظ بالبيانات؟', paragraf: 'نحتفظ ببياناتك ما دام حسابك مفتوحًا. عند حذف حقل أو تحليل تُحذف السجلات المتعلقة به نهائيًا. وإذا طلبت حذف حسابك بالكامل تُحذف جميع بياناتك خلال 30 يومًا على الأكثر من طلبك.' },
      { baslik: 'حقوقك', paragraf: 'بموجب المادة 11 من KVKK يحق لك معرفة ما إذا كانت بياناتك تُعالج، وطلب المعلومات، وطلب تصحيحها أو حذفها، والاعتراض على المعالجة، والمطالبة بالتعويض إن لحقك ضرر. لممارسة هذه الحقوق أو حذف حسابك يمكنك الكتابة إلى {iletisim}.' },
      { baslik: 'حول التوصيات', paragraf: 'تعتمد توصيات التطبيق على قيم المختبر والمعرفة الزراعية العامة، ولا يمكنها معرفة جميع ظروف حقلك. تشخيص الورقة من صورة تقييم أولي وقد يخطئ؛ للحصول على نتيجة موثوقة أجرِ تحليلًا للأوراق. اقرأ ملصقات المنتجات قبل الاستخدام.' },
    ],
  },
};
