'use client';







import {



  ArrowLeft,



  ArrowRight,



  BarChart3,



  Camera,



  Check,



  ChevronRight,



  FileText,



  Leaf,



  Recycle,



  Sprout,



  Upload,



  UserRound,



  X,



} from 'lucide-react';



import { useRef, useState, type ReactNode, type RefObject } from 'react';







type Screen = 'home' | 'guide';



type Method = 'pdf' | 'photo' | 'manual';



type ManualPhase = 'intro' | 'questions' | 'summary' | 'analysis';



type ManualQuestionKey =



  | 'district'



  | 'ph'



  | 'nitrogen'



  | 'phosphorus'



  | 'potassium'



  | 'organicMatter'



  | 'texture'



  | 'salinity'



  | 'lime';







type ManualAnswers = Record<ManualQuestionKey, string>;



type ManualMissing = Record<ManualQuestionKey, boolean>;







type FieldDefinition = {



  key: ManualQuestionKey;



  label: string;



  type: 'number' | 'select';



  unit?: string;



  helper: string;



  placeholder?: string;



  options?: string[];



};







const istanbulDistricts = [



  'Adalar',



  'Arnavutköy',



  'Ataşehir',



  'Avcılar',



  'Bağcılar',



  'Bahçelievler',



  'Bakırköy',



  'Başakşehir',



  'Bayrampaşa',



  'Beşiktaş',



  'Beykoz',



  'Beylikdüzü',



  'Beyoğlu',



  'Büyükçekmece',



  'Çatalca',



  'Çekmeköy',



  'Esenler',



  'Esenyurt',



  'Eyüpsultan',



  'Fatih',



  'Gaziosmanpaşa',



  'Güngören',



  'Kadıköy',



  'Kağıthane',



  'Kartal',



  'Küçükçekmece',



  'Maltepe',



  'Pendik',



  'Sancaktepe',



  'Sarıyer',



  'Silivri',



  'Sultanbeyli',



  'Şile',



  'Şişli',



  'Tuzla',



  'Ümraniye',



  'Üsküdar',



  'Zeytinburnu',



];







const manualQuestionMeta: Record<ManualQuestionKey, FieldDefinition> = {



  district: {



    key: 'district',



    label: 'İlçe',



    type: 'select',



    helper: 'Toprağın bulunduğu ilçeyi seçin.',



    options: [...istanbulDistricts, 'Bilmiyorum'],



  },



  ph: {



    key: 'ph',



    label: 'pH',



    type: 'number',



    helper: 'Değeri laboratuvar raporunuzda yazıldığı şekilde girin.',



    placeholder: '6.8',



  },



  nitrogen: {



    key: 'nitrogen',



    label: 'Azot (N)',



    type: 'number',



    unit: 'mg/kg',



    helper: 'Birim konusunda raporunuzdaki birimi takip edin.',



    placeholder: '42',



  },



  phosphorus: {



    key: 'phosphorus',



    label: 'Fosfor (P)',



    type: 'number',



    unit: 'mg/kg',



    helper: 'Birim konusunda raporunuzdaki birimi takip edin.',



    placeholder: '18',



  },



  potassium: {



    key: 'potassium',



    label: 'Potasyum (K)',



    type: 'number',



    unit: 'mg/kg',



    helper: 'Birim konusunda raporunuzdaki birimi takip edin.',



    placeholder: '165',



  },



  organicMatter: {



    key: 'organicMatter',



    label: 'Organik madde',



    type: 'number',



    unit: '%',



    helper: 'Değeri laboratuvar raporunuzda yazıldığı şekilde girin.',



    placeholder: '2.4',



  },



  texture: {



    key: 'texture',



    label: 'Toprak tekstürü',



    type: 'select',



    helper: 'Toprak bünyesini raporunuzdaki ana sınıfa göre seçin.',



    options: ['Kumlu', 'Tınlı', 'Killi', 'Kumlu-tınlı', 'Killi-tınlı', 'Bilmiyorum'],



  },



  salinity: {



    key: 'salinity',



    label: 'Tuzluluk / EC',



    type: 'number',



    unit: 'dS/m',



    helper: 'Raporunuzdaki EC veya tuzluluk değerini girin.',



    placeholder: '0.42',



  },



  lime: {



    key: 'lime',



    label: 'Kireç',



    type: 'number',



    unit: '%',



    helper: 'Değeri laboratuvar raporunuzda yazıldığı şekilde girin.',



    placeholder: '8.5',



  },



};







const manualSections = [



  {



    title: 'Temel Bilgiler',



    description: 'İlçe, pH ve toprak tekstürü bilgilerini girin.',



    fields: ['district', 'ph', 'texture'] as ManualQuestionKey[],



  },



  {



    title: 'Besin Değerleri',



    description: 'Laboratuvar raporunda yer alan azot, fosfor ve potasyum değerleri.',



    fields: ['nitrogen', 'phosphorus', 'potassium'] as ManualQuestionKey[],



  },



  {



    title: 'Toprak Özellikleri',



    description: 'Organik madde, tuzluluk ve kireç bilgileri.',



    fields: ['organicMatter', 'salinity', 'lime'] as ManualQuestionKey[],



  },



] as const;







const initialManualAnswers: ManualAnswers = {



  district: '',



  ph: '',



  nitrogen: '',



  phosphorus: '',



  potassium: '',



  organicMatter: '',



  texture: '',



  salinity: '',



  lime: '',



};







const initialManualMissing: ManualMissing = {



  district: false,



  ph: false,



  nitrogen: false,



  phosphorus: false,



  potassium: false,



  organicMatter: false,



  texture: false,



  salinity: false,



  lime: false,



};







export default function Home() {



  const [screen, setScreen] = useState<Screen>('home');



  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);



  const [showFilePicker, setShowFilePicker] = useState(false);



  const [manualPhase, setManualPhase] = useState<ManualPhase>('intro');



  const [manualStep, setManualStep] = useState(0);



  const [manualAnswers, setManualAnswers] = useState<ManualAnswers>(initialManualAnswers);



  const [manualMissing, setManualMissing] = useState<ManualMissing>(initialManualMissing);







  const fileInputRef = useRef<HTMLInputElement>(null);



  const currentSection = manualSections[manualStep];



  const progress = ((manualStep + 1) / manualSections.length) * 100;







  const startGuide = () => {



    setScreen('guide');



    window.scrollTo({ top: 0, behavior: 'smooth' });



  };







  const goHome = () => {



    setScreen('home');



    setSelectedMethod(null);



    setManualPhase('intro');



    setManualStep(0);



    setManualAnswers(initialManualAnswers);



    setManualMissing(initialManualMissing);



    setShowFilePicker(false);



    window.scrollTo({ top: 0, behavior: 'smooth' });



  };







  const chooseMethod = (method: Method) => {



    setSelectedMethod(method);







    if (method === 'manual') {



      setManualPhase('intro');



      setManualStep(0);



      setShowFilePicker(false);



      return;



    }







    setManualPhase('intro');



    setManualStep(0);



    setShowFilePicker(true);



  };







  const handleFile = (file: File | undefined) => {



    if (!file) return;



    setShowFilePicker(false);



    console.log('SeŞilen dosya:', file);



  };







  const beginManualFlow = () => {



    setManualPhase('questions');



    setManualStep(0);



  };







  const updateManualAnswer = (key: ManualQuestionKey, value: string) => {



    setManualAnswers((prev) => ({ ...prev, [key]: value }));



    if (value.trim() !== '') {



      setManualMissing((prev) => ({ ...prev, [key]: false }));



    }



  };







  const toggleManualMissing = (key: ManualQuestionKey) => {



    const nextValue = !manualMissing[key];



    setManualMissing((prev) => ({ ...prev, [key]: nextValue }));







    if (nextValue) {



      setManualAnswers((prev) => ({ ...prev, [key]: '' }));



    }



  };







  const nextManualSection = () => {



    if (manualStep === manualSections.length - 1) {



      setManualPhase('summary');



      return;



    }







    setManualStep((prev) => prev + 1);



  };







  const goToPreviousQuestion = () => {



    if (manualPhase === 'summary') {



      setManualPhase('questions');



      setManualStep(manualSections.length - 1);



      return;



    }







    if (manualPhase === 'analysis') {



      setManualPhase('summary');



      return;



    }







    if (manualPhase === 'questions') {



      if (manualStep === 0) {



        setManualPhase('intro');



        return;



      }







      setManualStep((prev) => prev - 1);



      return;



    }



  };







  const analyzeSoil = () => {



    setManualPhase('analysis');



  };







  return (



    <main className="min-h-screen overflow-x-hidden bg-[#f4f7f1] text-[#17352a]">



      {screen === 'home' ? (



        <HomeScreen onStart={startGuide} />



      ) : (



        <GuideScreen



          onBack={goHome}



          selectedMethod={selectedMethod}



          onSelectMethod={chooseMethod}



          showFilePicker={showFilePicker}



          closeFilePicker={() => setShowFilePicker(false)}



          fileInputRef={fileInputRef}



          handleFile={handleFile}



          manualPhase={manualPhase}



          manualStep={manualStep}



          manualSections={manualSections}



          currentSection={currentSection}



          manualAnswers={manualAnswers}



          manualMissing={manualMissing}



          progress={progress}



          onBeginManualFlow={beginManualFlow}



          onUpdateAnswer={updateManualAnswer}



          onToggleMissing={toggleManualMissing}



          onBackManual={goToPreviousQuestion}



          onNextSection={nextManualSection}



          onAnalyzeSoil={analyzeSoil}



        />



      )}



    </main>



  );



}







function HomeScreen({ onStart }: { onStart: () => void }) {



  return (



    <div className="animate-[fadeIn_.5s_ease-out]">



      <section className="relative min-h-[760px] overflow-hidden">



        <div



          className="absolute inset-0 bg-cover bg-center"



          style={{



            backgroundImage:



              "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=90')",



          }}



        />



        <div className="absolute inset-0 bg-gradient-to-r from-[#07281f]/95 via-[#123d2d]/75 to-[#123d2d]/25" />







        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">



          <div className="flex items-center gap-3">



            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">



              <span className="text-[15px] font-extrabold text-[#18794e]">İBB</span>



            </div>



            <div className="leading-tight text-white">



              <div className="text-sm text-white/70">İstanbul Büyükşehir Belediyesi</div>



              <div className="text-lg font-bold">Toprak Rehberi</div>



            </div>



          </div>







          <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md md:flex">



            <Leaf size={16} />



            Akıllı Tarım



          </div>



        </header>







        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-32 pt-24 lg:px-10">



          <div className="max-w-[820px] text-white">



            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md">



              <span className="h-2 w-2 rounded-full bg-[#8bd35b]" />



              Yapay zeka destekli toprak analizi



            </div>







            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">



              İBB'ye



              <br />



              <span className="text-[#9bdd68]">Hoş Geldiniz.</span>



            </h1>







            <h2 className="mt-7 text-2xl font-semibold leading-tight text-[#d5f1bf] sm:text-3xl">



              Toprağınızı tanıyın,



              <br />



              ona göre iyileştirin.



            </h2>







            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">



              Laboratuvar raporunuzdaki gerçek ölçümleri girerek toprağınızın besin dengesini,



              yapısını ve özelliklerini daha doğru anlayabilirsiniz.



            </p>







            <div className="mt-8 grid max-w-[680px] grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">



              <Feature icon={<Leaf size={25} />} text="Dünya standartlarında değerlendirme" />



              <Feature icon={<Sprout size={25} />} text="Size uygun bitki önerileri" />



              <Feature icon={<BarChart3 size={25} />} text="Kolay ve anlaşılır raporlar" />



              <Feature icon={<Recycle size={25} />} text="Daha verimli ve sürdürülebilir tarım" />



            </div>







            <button



              onClick={onStart}



              className="group mt-10 inline-flex items-center gap-5 rounded-full bg-gradient-to-r from-[#70c93b] to-[#20a875] px-8 py-4 text-lg font-bold text-white shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)]"



            >



              Devam Et



              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">



                <ArrowRight size={20} />



              </span>



            </button>



          </div>



        </div>



      </section>







      <section className="px-5 py-20 sm:px-8 lg:px-10">



        <div className="mx-auto max-w-7xl">



          <div className="max-w-2xl">



            <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#30945f]">



              Nasıl çalışır?



            </div>



            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">



              Toprağınızı 3 adımda keşfedin.



            </h2>



            <p className="mt-4 text-base leading-7 text-[#64766c]">



              Laboratuvar raporunuzu yükleyebilir, fotoğraf gönderebilir ya da gerçek değerleri



              elle girebilirsiniz.



            </p>



          </div>







          <div className="mt-12 grid gap-5 lg:grid-cols-3">



            <StepCard



              number="01"



              icon="📄"



              title="Laboratuvar bilgisi"



              description="Raporunuza göre gerçek ölçümü girin."



              items={['Rapor ölçüm değeri', 'Birim kontrolü', 'Eksik bilgi işareti']}



            />



            <StepCard



              number="02"



              icon="🤖"



              title="Analiz"



              description="Değerler sistem tarafından yorumlanır."



              items={['Besin oranı', 'Toprak yapısı', 'Uygunluk değerlendirmesi']}



              featured



            />



            <StepCard



              number="03"



              icon="🌱"



              title="Sonuç"



              description="Toprağınızdaki güçlü ve zayıf yönler görünür."



              items={['Özet rapor', 'Bitki önerileri', 'Geliştirme adımları']}



            />



          </div>



        </div>



      </section>







      <footer className="bg-[#102f25] px-6 py-8 text-center text-sm text-white/60">



        Toprak Rehberi · İBB için konsept prototip



      </footer>



    </div>



  );



}







function GuideScreen({



  onBack,



  selectedMethod,



  onSelectMethod,



  showFilePicker,



  closeFilePicker,



  fileInputRef,



  handleFile,



  manualPhase,



  manualStep,



  manualSections,



  currentSection,



  manualAnswers,



  manualMissing,



  progress,



  onBeginManualFlow,



  onUpdateAnswer,



  onToggleMissing,



  onBackManual,



  onNextSection,



  onAnalyzeSoil,



}: {



  onBack: () => void;



  selectedMethod: Method | null;



  onSelectMethod: (method: Method) => void;



  showFilePicker: boolean;



  closeFilePicker: () => void;



  fileInputRef: RefObject<HTMLInputElement | null>;



  handleFile: (file: File | undefined) => void;



  manualPhase: ManualPhase;



  manualStep: number;



  manualSections: ReadonlyArray<{



    title: string;



    description: string;



    fields: ManualQuestionKey[];



  }>;



  currentSection: {



    title: string;



    description: string;



    fields: ManualQuestionKey[];



  };



  manualAnswers: ManualAnswers;



  manualMissing: ManualMissing;



  progress: number;



  onBeginManualFlow: () => void;



  onUpdateAnswer: (key: ManualQuestionKey, value: string) => void;



  onToggleMissing: (key: ManualQuestionKey) => void;



  onBackManual: () => void;



  onNextSection: () => void;



  onAnalyzeSoil: () => void;



}) {



  const isManualActive = selectedMethod === 'manual';







  return (



    <div className="min-h-screen bg-gradient-to-b from-[#eef6eb] via-[#f7faf5] to-white animate-[fadeIn_.5s_ease-out]">



      <header className="border-b border-[#dfe9df] bg-white/80 backdrop-blur-xl">



        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">



          <button



            onClick={onBack}



            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#476456] transition hover:bg-[#edf5ea]"



          >



            <ArrowLeft size={18} />



            Ana sayfa



          </button>







          <div className="flex items-center gap-3">



            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5e6]">



              <Leaf size={20} className="text-[#238f61]" />



            </div>



            <div className="hidden text-left sm:block">



              <div className="text-xs text-[#718078]">Toprak Rehberi</div>



              <div className="text-sm font-bold text-[#17352a]">Toprak Analizi</div>



            </div>



          </div>



        </div>



      </header>







      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">



        {isManualActive &&



        (manualPhase === 'intro' || manualPhase === 'questions' || manualPhase === 'summary' || manualPhase === 'analysis') ? (



          <ManualFlowScreen



            manualPhase={manualPhase}



            manualStep={manualStep}



            manualSections={manualSections}



            currentSection={currentSection}



            manualAnswers={manualAnswers}



            manualMissing={manualMissing}



            progress={progress}



            onBeginManualFlow={onBeginManualFlow}



            onUpdateAnswer={onUpdateAnswer}



            onToggleMissing={onToggleMissing}



            onBackManual={onBackManual}



            onNextSection={onNextSection}



            onAnalyzeSoil={onAnalyzeSoil}



          />



        ) : (



          <>



            <div className="mx-auto mb-12 max-w-2xl">



              <div className="flex items-center justify-between text-xs font-semibold text-[#6d7f74]">



                <span className="text-[#238f61]">1. Bilgi girişi</span>



                <span>2. Analiz</span>



                <span>3. Sonuç</span>



              </div>



              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dce8da]">



                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#5fc33c] to-[#249b70]" />



              </div>



            </div>







            <div className="flex flex-col items-center text-center">



              <Robot />



              <div className="mt-7">



                <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#32965e]">



                  Toprak Rehberiniz



                </div>



                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17352a] sm:text-5xl">



                  Toprağınızı birlikte inceleyelim.



                </h1>



                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#687b70] sm:text-lg">



                  Laboratuvar raporunuz varsa yükleyebilir, fotoğraf gönderebilir ya da gerçek



                  değerleri kendiniz girebilirsiniz. Eksik veriler için güvenli şekilde



                  ilerleyebilirsiniz.



                </p>



              </div>



            </div>







            <div className="mt-12">



              <div className="mb-5 text-center text-lg font-bold text-[#17352a]">



                Nasıl devam etmek istersiniz?



              </div>







              <div className="grid gap-5 md:grid-cols-3">



                <MethodCard



                  icon={<FileText size={30} />}



                  title="PDF Yükle"



                  description="Laboratuvar analiz raporunuzu yükleyin."



                  detail="PDF, analiz sonuçlarını otomatik olarak okumamıza yardımcı olur."



                  selected={selectedMethod === 'pdf'}



                  onClick={() => onSelectMethod('pdf')}



                />



                <MethodCard



                  icon={<Camera size={30} />}



                  title="Fotoğraf Yükle"



                  description="Analiz belgenizin fotoğrafını kullanın."



                  detail="Telefonunuzdaki veya bilgisayarınızdaki fotoğrafı seçebilirsiniz."



                  selected={selectedMethod === 'photo'}



                  onClick={() => onSelectMethod('photo')}



                />



                <MethodCard



                  icon={<UserRound size={30} />}



                  title="Kendim Gireceğim"



                  description="Gerçek ölçüm değerlerini elle girin."



                  detail="Eksik verileri 'Bu bilgi raporumda yok' ile işaretleyebilirsiniz."



                  selected={selectedMethod === 'manual'}



                  onClick={() => onSelectMethod('manual')}



                />



              </div>



            </div>







            {selectedMethod === 'manual' && (



              <div className="mt-8 rounded-[28px] border border-[#dce8da] bg-white p-6 shadow-sm sm:p-8 animate-[slideUp_.4s_ease-out]">



                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">



                  <div>



                    <div className="flex items-center gap-2 text-sm font-bold text-[#238f61]">



                      <Sprout size={18} />



                      Manuel giriş



                    </div>



                    <h2 className="mt-2 text-2xl font-bold text-[#17352a]">



                      Raporunuzdaki gerçek değerleri girin.



                    </h2>



                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#718078]">



                      Tüm değerleri bilmenize gerek yok. Eksik alanları işaretleyerek kolayca



                      ilerleyebilirsiniz.



                    </p>



                  </div>







                  <button



                    onClick={onBeginManualFlow}



                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#238f61] px-6 py-3 font-bold text-white transition hover:bg-[#1d7d54]"



                  >



                    Başlayalım



                    <ArrowRight size={18} />



                  </button>



                </div>







                <div className="mt-7 grid gap-3 sm:grid-cols-3">



                  <MiniParameter name="pH" value={manualAnswers.ph || 'Belirtilmedi'} />



                  <MiniParameter name="Azot (N)" value={manualAnswers.nitrogen || 'Belirtilmedi'} />



                  <MiniParameter name="Fosfor (P)" value={manualAnswers.phosphorus || 'Belirtilmedi'} />



                </div>



              </div>



            )}







            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-5 text-center">



              <div className="text-sm font-semibold text-[#476456]">💡 Bilmediğiniz değerler için güvenli ilerleyin</div>



              <p className="mt-1 text-xs leading-5 text-[#718078]">



                Her parametre için uygun alan ve “Bu bilgi raporumda yok” seçeneği vardır.



              </p>



            </div>



          </>



        )}



      </section>







      {showFilePicker && (



        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09271f]/60 p-5 backdrop-blur-sm">



          <div className="relative w-full max-w-lg rounded-[30px] bg-white p-7 shadow-2xl sm:p-9">



            <button



              onClick={closeFilePicker}



              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"



            >



              <X size={20} />



            </button>







            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf6e4] text-[#238f61]">



              <Upload size={27} />



            </div>







            <h2 className="mt-6 text-2xl font-extrabold text-[#17352a]">



              {selectedMethod === 'pdf' ? 'Analiz raporunuzu yükleyin' : 'Analiz fotoğrafınızı yükleyin'}



            </h2>



            <p className="mt-2 text-sm leading-6 text-[#718078]">



              {selectedMethod === 'pdf'



                ? 'PDF formatındaki laboratuvar raporunuzu seçin.'



                : 'Net ve okunabilir bir analiz belgesi fotoğrafı seçin.'}



            </p>







            <button



              onClick={() => fileInputRef.current?.click()}



              className="mt-7 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9d9ae] bg-[#f7fbf5] px-6 py-10 text-center transition hover:border-[#238f61] hover:bg-[#f0f8ed]"



            >



              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">



                {selectedMethod === 'pdf' ? (



                  <FileText className="text-[#238f61]" />



                ) : (



                  <Camera className="text-[#238f61]" />



                )}



              </div>



              <div className="mt-4 font-bold text-[#17352a]">Dosya seçmek için tıklayın</div>



              <div className="mt-1 text-xs text-[#819087]">



                {selectedMethod === 'pdf' ? 'PDF dosyası' : 'JPG, PNG veya WEBP'}



              </div>



            </button>







            <input



              ref={fileInputRef}



              type="file"



              className="hidden"



              accept={selectedMethod === 'pdf' ? '.pdf' : 'image/png,image/jpeg,image/webp'}



              onChange={(e) => handleFile(e.target.files?.[0])}



            />



          </div>



        </div>



      )}



    </div>



  );



}







function ManualFlowScreen({



  manualPhase,



  manualStep,



  manualSections,



  currentSection,



  manualAnswers,



  manualMissing,



  progress,



  onBeginManualFlow,



  onUpdateAnswer,



  onToggleMissing,



  onBackManual,



  onNextSection,



  onAnalyzeSoil,



}: {



  manualPhase: ManualPhase;



  manualStep: number;



  manualSections: ReadonlyArray<{



    title: string;



    description: string;



    fields: ManualQuestionKey[];



  }>;



  currentSection: {



    title: string;



    description: string;



    fields: ManualQuestionKey[];



  };



  manualAnswers: ManualAnswers;



  manualMissing: ManualMissing;



  progress: number;



  onBeginManualFlow: () => void;



  onUpdateAnswer: (key: ManualQuestionKey, value: string) => void;



  onToggleMissing: (key: ManualQuestionKey) => void;



  onBackManual: () => void;



  onNextSection: () => void;



  onAnalyzeSoil: () => void;



}) {



  if (manualPhase === 'intro') {



    return (



      <div className="mt-8 rounded-[28px] border border-[#dce8da] bg-white p-6 shadow-sm sm:p-8 animate-[slideUp_.4s_ease-out]">



        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">



          <div>



            <div className="flex items-center gap-2 text-sm font-bold text-[#238f61]">



              <Sprout size={18} />



              Manuel giriş



            </div>



            <h2 className="mt-2 text-2xl font-bold text-[#17352a]">Raporunuzdaki gerçek ölçümleri girin.</h2>



            <p className="mt-2 max-w-xl text-sm leading-6 text-[#718078]">



              Her parametre için büyük alanlar, uygun birim ve eksik bilgi işareti vardır.



            </p>



          </div>







          <button



            onClick={onBeginManualFlow}



            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#238f61] px-6 py-3 font-bold text-white transition hover:bg-[#1d7d54]"



          >



            Başlayalım



            <ArrowRight size={18} />



          </button>



        </div>







        <div className="mt-7 grid gap-3 sm:grid-cols-3">



          <MiniParameter name="pH" value={manualAnswers.ph || 'Belirtilmedi'} />



          <MiniParameter name="Azot (N)" value={manualAnswers.nitrogen || 'Belirtilmedi'} />



          <MiniParameter name="Fosfor (P)" value={manualAnswers.phosphorus || 'Belirtilmedi'} />



        </div>



      </div>



    );



  }







  if (manualPhase === 'summary') {



    const summaryRows = manualSections.flatMap((section) =>



      section.fields.map((fieldKey) => {



        const meta = manualQuestionMeta[fieldKey];



        const value = manualAnswers[fieldKey];



        const missing = manualMissing[fieldKey] || value.trim() === '';







        if (missing) {



          return { key: fieldKey, label: meta.label, value: 'Belirtilmedi' };



        }







        const suffix = meta.unit ? ` ${meta.unit}` : '';



        return { key: fieldKey, label: meta.label, value: `${value}${suffix}` };



      }),



    );







    return (



      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dfe9df] bg-white p-6 shadow-[0_18px_50px_rgba(19,53,41,.08)] sm:p-8">



        <div className="mb-6 flex items-center justify-between gap-3">



          <button



            onClick={onBackManual}



            className="inline-flex items-center gap-2 rounded-full border border-[#dfe9df] bg-[#f4faf3] px-4 py-2 text-sm font-semibold text-[#476456] transition hover:bg-[#edf6eb]"



          >



            <ArrowLeft size={16} />



            Geri



          </button>



          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#32965e]">



            Özet



          </div>



        </div>







        <div className="mb-8 text-center">



          <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#32965e]">Toprak bilgileri</div>



          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17352a] sm:text-4xl">



            Bilgileriniz hazır 🌱



          </h2>



        </div>







        <div className="rounded-[28px] border border-[#dfe9df] bg-[#f8fbf7] p-5 sm:p-6">



          <div className="space-y-3">



            {summaryRows.map((row) => (



              <div



                key={row.key}



                className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf2ee] bg-white px-4 py-3"



              >



                <span className="text-sm font-semibold text-[#51675d]">{row.label}</span>



                <span className="text-sm font-bold text-[#17352a]">{row.value}</span>



              </div>



            ))}



          </div>



        </div>







        <button



          onClick={onAnalyzeSoil}



          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#74cc3c] to-[#20a875] px-6 py-5 text-lg font-extrabold text-white shadow-[0_18px_45px_rgba(32,168,117,0.28)] transition hover:-translate-y-1"



        >



          <span className="text-2xl">🌱</span>



          Toprağımı Analiz Et



          <ChevronRight size={22} />



        </button>



      </div>



    );



  }







  if (manualPhase === 'analysis') {



    return (



      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dfe9df] bg-white p-6 shadow-[0_18px_50px_rgba(19,53,41,.08)] sm:p-8">



        <div className="mb-7 text-center">



          <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#32965e]">Hazırlık</div>



          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17352a] sm:text-4xl">



            Analiz ekranı hazırlandı



          </h2>



        </div>







        <div className="rounded-[28px] border border-[#dfe9df] bg-[#f8fbf7] p-6 text-center">



          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf6e4] text-4xl">



            🌱



          </div>



          <p className="mt-5 text-base leading-7 text-[#5b6f65]">



            Toprak verileri ileride API/backend tarafına gönderilecek şekilde hazır tutulmuştur.



            Bu ekranda gerçek AI analizi bağlanacaktır.



          </p>



        </div>







        <button



          onClick={onBackManual}



          className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#dfe9df] bg-[#f4faf3] px-5 py-3 text-sm font-semibold text-[#476456] transition hover:bg-[#edf6eb]"



        >



          <ArrowLeft size={16} />



          Başa dönüp verileri gözden geçir



        </button>



      </div>



    );



  }







  const isLastSection = manualStep === manualSections.length - 1;







  return (



    <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dfe9df] bg-white p-5 shadow-[0_18px_50px_rgba(19,53,41,.08)] sm:p-8">



      <div className="mb-6 flex items-center justify-between gap-3">



        <button



          onClick={onBackManual}



          className="inline-flex items-center gap-2 rounded-full border border-[#dfe9df] bg-[#f4faf3] px-4 py-2 text-sm font-semibold text-[#476456] transition hover:bg-[#edf6eb]"



        >



          <ArrowLeft size={16} />



          Geri



        </button>







        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#32965e]">



          Adım {manualStep + 1}/{manualSections.length}



        </div>



      </div>







      <div className="mb-6">



        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#6d7f74]">



          <span>İlerleme</span>



          <span>{Math.round(progress)}%</span>



        </div>



        <div className="h-2.5 overflow-hidden rounded-full bg-[#dfe9df]">



          <div



            className="h-full rounded-full bg-gradient-to-r from-[#5fc33c] to-[#249b70] transition-all duration-300"



            style={{ width: `${Math.max(8, progress)}%` }}



          />



        </div>



      </div>







      <div className="mb-8 text-center">



        <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#32965e]">Manuel giriş</div>



        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17352a] sm:text-4xl">



          {currentSection.title}



        </h2>



        <p className="mt-3 text-base text-[#64766c]">{currentSection.description}</p>



      </div>







      <div className="space-y-5">



        {currentSection.fields.map((fieldKey) => {



          const field = manualQuestionMeta[fieldKey];



          const isMissing = manualMissing[fieldKey];







          if (field.type === 'select') {



            return (



              <div key={field.key} className="rounded-[28px] border border-[#e1ebdf] bg-[#f9fbf9] p-5 sm:p-6">



                <div className="flex items-start justify-between gap-3">



                  <div>



                    <div className="text-lg font-bold text-[#17352a]">{field.label}</div>



                    <div className="mt-1 text-xs leading-5 text-[#75867a]">{field.helper}</div>



                  </div>



                  <label className="flex items-center gap-2 rounded-full border border-[#d8e8d6] bg-white px-3 py-2 text-xs font-semibold text-[#476456]">



                    <input



                      type="checkbox"



                      checked={isMissing}



                      onChange={() => onToggleMissing(fieldKey)}



                      className="h-4 w-4 accent-[#238f61]"



                    />



                    Bu bilgi raporumda yok



                  </label>



                </div>







                <div className="mt-4 grid gap-3 sm:grid-cols-2">



                  {field.options?.map((option) => {



                    const isSelected = manualAnswers[fieldKey] === option;







                    return (



                      <button



                        key={option}



                        type="button"



                        disabled={isMissing}



                        onClick={() => onUpdateAnswer(fieldKey, option)}



                        className={`min-h-[58px] rounded-2xl border px-4 py-3 text-left text-base font-semibold transition ${



                          isSelected



                            ? 'border-[#38a66d] bg-[#eefaf0] text-[#17352a] shadow-[0_10px_25px_rgba(34,138,94,0.12)]'



                            : 'border-[#dfe9df] bg-white text-[#2a3d36] hover:border-[#9aca89] hover:bg-[#f1f9ef]'



                        } ${isMissing ? 'cursor-not-allowed opacity-50' : ''}`}



                      >



                        <span className="flex items-center justify-between gap-3">



                          <span>{option}</span>



                          {isSelected ? (



                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#238f61] text-white">



                              <Check size={14} />



                            </span>



                          ) : null}



                        </span>



                      </button>



                    );



                  })}



                </div>



              </div>



            );



          }







          return (



            <div key={field.key} className="rounded-[28px] border border-[#e1ebdf] bg-[#f9fbf9] p-5 sm:p-6">



              <div className="flex items-start justify-between gap-3">



                <div>



                  <div className="text-lg font-bold text-[#17352a]">{field.label}</div>



                  <div className="mt-1 text-xs leading-5 text-[#75867a]">{field.helper}</div>



                </div>



                <label className="flex items-center gap-2 rounded-full border border-[#d8e8d6] bg-white px-3 py-2 text-xs font-semibold text-[#476456]">



                  <input



                    type="checkbox"



                    checked={isMissing}



                    onChange={() => onToggleMissing(fieldKey)}



                    className="h-4 w-4 accent-[#238f61]"



                  />



                  Bu bilgi raporumda yok



                </label>



              </div>







              <div className="mt-5">



                <label className="block text-sm font-semibold text-[#51675d]">Raporunuzdaki değer</label>



                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 shadow-sm">



                  <input



                    type="number"



                    step="any"



                    value={manualAnswers[fieldKey]}



                    placeholder={field.placeholder}



                    disabled={isMissing}



                    onChange={(event) => onUpdateAnswer(fieldKey, event.target.value)}



                    className="w-full border-none bg-transparent text-lg font-bold text-[#17352a] outline-none placeholder:text-[#9aa7a0] disabled:cursor-not-allowed disabled:opacity-50"



                  />



                  {field.unit ? (



                    <span className="rounded-full bg-[#edf7ed] px-3 py-1 text-sm font-bold text-[#238f61]">



                      {field.unit}



                    </span>



                  ) : null}



                </div>



              </div>



            </div>



          );



        })}



      </div>







      <button



        onClick={onNextSection}



        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#74cc3c] to-[#20a875] px-6 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(32,168,117,0.28)] transition hover:-translate-y-1"



      >



        {isLastSection ? 'Özet Sayfasına Geç' : 'Sonraki'}



        <ArrowRight size={18} />



      </button>



    </div>



  );



}







function Feature({ icon, text }: { icon: ReactNode; text: string }) {



  return (



    <div className="flex flex-col gap-2">



      <div className="text-[#91d965]">{icon}</div>



      <p className="max-w-[145px] text-xs font-medium leading-5 text-white/80">{text}</p>



    </div>



  );



}







function StepCard({



  number,



  icon,



  title,



  description,



  items,



  featured = false,



}: {



  number: string;



  icon: string;



  title: string;



  description: string;



  items: string[];



  featured?: boolean;



}) {



  return (



    <div



      className={`relative overflow-hidden rounded-[28px] border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${



        featured



          ? 'border-[#8fd36c] bg-gradient-to-br from-[#f5fbf1] to-white shadow-md'



          : 'border-[#e2ebe1] bg-white shadow-sm'



      }`}



    >



      <div className="flex items-center justify-between">



        <div



          className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${



            featured ? 'bg-[#238f61] text-white' : 'bg-[#e8f3e7] text-[#238f61]'



          }`}



        >



          {number}



        </div>



        <span className="text-3xl">{icon}</span>



      </div>







      <h3 className="mt-7 text-xl font-bold">{title}</h3>



      <p className="mt-2 text-sm text-[#718078]">{description}</p>







      <div className="mt-6 space-y-3">



        {items.map((item) => (



          <div key={item} className="flex items-center gap-3 text-sm text-[#42564b]">



            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e5f4df] text-[#32965e]">



              <Check size={12} strokeWidth={3} />



            </span>



            {item}



          </div>



        ))}



      </div>



    </div>



  );



}







function MethodCard({



  icon,



  title,



  description,



  detail,



  selected,



  onClick,



}: {



  icon: ReactNode;



  title: string;



  description: string;



  detail: string;



  selected: boolean;



  onClick: () => void;



}) {



  return (



    <button



      onClick={onClick}



      className={`group relative overflow-hidden rounded-[28px] border bg-white p-7 text-left transition-all duration-300 ${



        selected



          ? 'border-[#38a66d] shadow-[0_15px_40px_rgba(36,139,94,.12)] ring-2 ring-[#d9f1d0]'



          : 'border-[#dfe9df] shadow-sm hover:-translate-y-1 hover:border-[#9aca89] hover:shadow-xl'



      }`}



    >



      {selected && (



        <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-[#238f61] text-white">



          <Check size={15} />



        </div>



      )}







      <div



        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${



          selected ? 'bg-[#238f61] text-white' : 'bg-[#eaf6e4] text-[#238f61] group-hover:bg-[#dff1d7]'



        }`}



      >



        {icon}



      </div>







      <h3 className="mt-6 text-xl font-bold text-[#17352a]">{title}</h3>



      <p className="mt-2 text-sm font-medium text-[#53685c]">{description}</p>



      <p className="mt-4 text-xs leading-5 text-[#829087]">{detail}</p>







      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#238f61]">



        Devam et



        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />



      </div>



    </button>



  );



}







function MiniParameter({ name, value }: { name: string; value: string }) {



  return (



    <div className="rounded-2xl border border-[#e2ebe1] bg-[#f9fcf8] p-4">



      <div className="text-xs font-semibold text-[#718078]">{name}</div>



      <div className="mt-2 font-bold text-[#17352a]">{value}</div>



    </div>



  );



}







function Robot() {



  return (



    <div className="relative">



      <div className="absolute inset-0 scale-125 rounded-full bg-[#b8e69b]/30 blur-3xl" />



      <div className="relative flex h-32 w-32 items-center justify-center rounded-[38px] border border-white bg-gradient-to-b from-[#eef9ff] to-[#c9e8f2] shadow-[0_20px_50px_rgba(41,117,91,0.18)]">



        <div className="absolute -top-5 left-1/2 h-7 w-1 -translate-x-1/2 rounded-full bg-[#67b8d1]" />



        <div className="absolute -top-7 left-1/2 flex h-4 w-4 -translate-x-1/2 rounded-full bg-[#6acb70] shadow-[0_0_15px_rgba(106,203,112,.7)]" />







        <div className="flex h-16 w-20 items-center justify-center gap-5 rounded-[22px] bg-[#102d3d] shadow-inner">



          <span className="h-3 w-3 rounded-full bg-[#7ee6ff] shadow-[0_0_10px_#7ee6ff]" />



          <span className="h-3 w-3 rounded-full bg-[#7ee6ff] shadow-[0_0_10px_#7ee6ff]" />



        </div>







        <div className="absolute -bottom-7 flex h-9 w-16 items-center justify-center rounded-b-2xl bg-[#a8d9e6]">



          🌱



        </div>



      </div>



    </div>



  );



}
