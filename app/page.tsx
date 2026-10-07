'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronRight,
  CircleCheck,
  FileSpreadsheet,
  Info,
  Leaf,
  Loader2,
  Printer,
  Recycle,
  Sprout,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { parseLabWorkbook } from '@/lib/excelRapor';
import {
  BUNYE_SINIFLARI,
  ISTANBUL_ILCELERI,
  MANUAL_STEPS,
  PARAMS,
  classify,
  formatNumber,
  parseNumber,
  sanityWarning,
  textureSumWarning,
  type ParamKey,
  type SoilReport,
  type Tone,
} from '@/lib/toprak';

type Screen = 'home' | 'guide' | 'manual' | 'review' | 'result';
type Method = 'dosya' | 'foto' | 'manuel';

type Meta = { ilce: string; bitki: string; numuneAdi: string; bunyeSinifi: string; raporNo: string };
type Draft = Record<ParamKey, string>;
type Missing = Record<ParamKey, boolean>;

type AiYorum = {
  ozet: string;
  gucluYonler: string[];
  dikkatEdilecekler: string[];
  oneriler: { baslik: string; aciklama: string }[];
  bitkiUygunlugu: string | null;
};

const PARAM_KEYS = Object.keys(PARAMS) as ParamKey[];
const emptyDraft = () => Object.fromEntries(PARAM_KEYS.map((k) => [k, ''])) as Draft;
const emptyMissing = () => Object.fromEntries(PARAM_KEYS.map((k) => [k, false])) as Missing;
const emptyMeta = (): Meta => ({ ilce: '', bitki: '', numuneAdi: '', bunyeSinifi: '', raporNo: '' });

const COMMON_CROPS = ['Buğday', 'Arpa', 'Kanola', 'Ayçiçeği', 'Mısır', 'Domates', 'Biber', 'Zeytin', 'Bahçe / sebze', 'Bilmiyorum'];

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [method, setMethod] = useState<Method | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<SoilReport[]>([]);

  const [step, setStep] = useState(0); // 0 = genel bilgiler, 1..n = MANUAL_STEPS
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [missing, setMissing] = useState<Missing>(emptyMissing);
  const [meta, setMeta] = useState<Meta>(emptyMeta);
  const [labEval, setLabEval] = useState<SoilReport['labDegerlendirme']>({});
  const [source, setSource] = useState<'manuel' | 'dosya'>('manuel');

  const [ai, setAi] = useState<AiYorum | null>(null);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'error'>('idle');

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setMethod(null);
    setPickerOpen(false);
    setUploadError(null);
    setCandidates([]);
    setStep(0);
    setDraft(emptyDraft());
    setMissing(emptyMissing());
    setMeta(emptyMeta());
    setLabEval({});
    setAi(null);
    setAiState('idle');
    go('home');
  };

  const buildReport = (): SoilReport => {
    const values: SoilReport['values'] = {};
    PARAM_KEYS.forEach((k) => {
      if (missing[k]) return;
      const n = parseNumber(draft[k]);
      if (n !== undefined) values[k] = n;
    });
    return {
      raporNo: meta.raporNo || undefined,
      ilce: meta.ilce || undefined,
      bitki: meta.bitki && meta.bitki !== 'Bilmiyorum' ? meta.bitki : undefined,
      numuneAdi: meta.numuneAdi || undefined,
      bunyeSinifi: meta.bunyeSinifi || undefined,
      values,
      labDegerlendirme: labEval,
    };
  };

  const loadReport = (r: SoilReport) => {
    const d = emptyDraft();
    const m = emptyMissing();
    PARAM_KEYS.forEach((k) => {
      const v = r.values[k];
      if (v === undefined) m[k] = true;
      else d[k] = formatNumber(v, 4);
    });
    setDraft(d);
    setMissing(m);
    setMeta({
      ilce: r.ilce ?? '',
      bitki: r.bitki ?? '',
      numuneAdi: r.numuneAdi ?? '',
      bunyeSinifi: r.bunyeSinifi ?? '',
      raporNo: r.raporNo ?? '',
    });
    setLabEval(r.labDegerlendirme ?? {});
    setSource('dosya');
    setCandidates([]);
    setPickerOpen(false);
    go('review');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      let reports: SoilReport[] = [];
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        // Excel tarayıcıda okunur, sunucuya gitmez
        reports = parseLabWorkbook(await file.arrayBuffer());
      } else {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/rapor-oku', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        reports = json.reports;
      }
      if (!reports.length) throw new Error('Dosyada toprak analiz değeri bulunamadı. Değerleri elle girebilirsiniz.');
      if (reports.length === 1) loadReport(reports[0]);
      else setCandidates(reports);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Dosya okunamadı.');
    } finally {
      setUploading(false);
    }
  };

  const chooseMethod = (m: Method) => {
    setMethod(m);
    setUploadError(null);
    if (m === 'manuel') {
      setSource('manuel');
      setLabEval({});
      setStep(0);
      go('manual');
    } else {
      setPickerOpen(true);
    }
  };

  const fetchAi = async () => {
    setAiState('loading');
    try {
      const res = await fetch('/api/yorum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildReport()),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAi(json);
      setAiState('idle');
    } catch {
      setAiState('error');
    }
  };

  const showResult = () => {
    setAi(null);
    go('result');
    fetchAi();
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f7f1] text-[#17352a]">
      {screen === 'home' && <HomeScreen onStart={() => go('guide')} />}

      {screen !== 'home' && (
        <div className="min-h-screen bg-gradient-to-b from-[#eef6eb] via-[#f7faf5] to-white">
          <TopBar onHome={resetAll} />
          <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
            {screen === 'guide' && <MethodScreen method={method} onSelect={chooseMethod} />}

            {screen === 'manual' && (
              <ManualScreen
                step={step}
                draft={draft}
                missing={missing}
                meta={meta}
                onMeta={(k, v) => setMeta((p) => ({ ...p, [k]: v }))}
                onDraft={(k, v) => {
                  setDraft((p) => ({ ...p, [k]: v }));
                  if (v.trim()) setMissing((p) => ({ ...p, [k]: false }));
                }}
                onToggleMissing={(k) => {
                  setMissing((p) => ({ ...p, [k]: !p[k] }));
                  setDraft((p) => ({ ...p, [k]: '' }));
                }}
                onBack={() => (step === 0 ? go('guide') : setStep((s) => s - 1))}
                onNext={() => (step === MANUAL_STEPS.length ? go('review') : setStep((s) => s + 1))}
              />
            )}

            {screen === 'review' && (
              <ReviewScreen
                report={buildReport()}
                source={source}
                onEdit={() => {
                  setStep(0);
                  go('manual');
                }}
                onConfirm={showResult}
              />
            )}

            {screen === 'result' && (
              <ResultScreen
                report={buildReport()}
                ai={ai}
                aiState={aiState}
                onRetryAi={fetchAi}
                onBack={() => go('review')}
                onNew={resetAll}
              />
            )}
          </section>
        </div>
      )}

      {pickerOpen && (
        <UploadDialog
          method={method}
          uploading={uploading}
          error={uploadError}
          candidates={candidates}
          onPick={loadReport}
          onFile={handleFile}
          onManual={() => {
            setPickerOpen(false);
            chooseMethod('manuel');
          }}
          onClose={() => {
            setPickerOpen(false);
            setCandidates([]);
          }}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Ana sayfa                                                                   */
/* -------------------------------------------------------------------------- */

function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-[fadeIn_.5s_ease-out]">
      <section className="relative min-h-[720px] overflow-hidden">
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
              <div className="text-sm text-white/70">Çevre Koruma ve Kontrol Dairesi Başkanlığı</div>
              <div className="text-lg font-bold">Toprak Rehberi</div>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-20 lg:px-10">
          <div className="max-w-[820px] text-white">
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-[64px]">
              Toprak analiz raporunuzu
              <br />
              <span className="text-[#9bdd68]">birlikte okuyalım.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              İBB Çevre Laboratuvarı’ndan aldığınız raporu yükleyin. Her değerin ne anlama geldiğini,
              toprağınızın güçlü ve zayıf yanlarını sade bir dille anlatalım.
            </p>

            <div className="mt-8 grid max-w-[680px] grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              <Feature icon={<FileSpreadsheet size={25} />} text="Excel, PDF veya fotoğraf yükleyin" />
              <Feature icon={<Leaf size={25} />} text="Laboratuvar değerlendirmesi esas alınır" />
              <Feature icon={<BarChart3 size={25} />} text="Her değer sade dille açıklanır" />
              <Feature icon={<Recycle size={25} />} text="Ekeceğiniz bitkiye göre öneriler" />
            </div>

            <button
              onClick={onStart}
              className="group mt-10 inline-flex items-center gap-5 rounded-full bg-gradient-to-r from-[#70c93b] to-[#20a875] px-8 py-4 text-lg font-bold text-white shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1"
            >
              Raporumu yorumla
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                <ArrowRight size={20} />
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Nasıl çalışır?</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <StepCard number="1" title="Raporu verin" description="Laboratuvarın gönderdiği dosyayı yükleyin ya da değerleri raporunuzdan bakarak girin." />
            <StepCard number="2" title="Değerleri onaylayın" description="Okunan değerleri raporunuzla karşılaştırın; hatalı olan varsa düzeltin." />
            <StepCard number="3" title="Yorumu okuyun" description="Her değerin durumu, toprağınız için ne anlama geldiği ve atabileceğiniz adımlar." />
          </div>
        </div>
      </section>

      <footer className="bg-[#102f25] px-6 py-8 text-center text-sm text-white/60">
        Bu uygulama bilgilendirme amaçlıdır; gübreleme reçetesi yerine geçmez.
      </footer>
    </div>
  );
}

function TopBar({ onHome }: { onHome: () => void }) {
  return (
    <header className="border-b border-[#dfe9df] bg-white/80 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <button
          onClick={onHome}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#476456] transition hover:bg-[#edf5ea]"
        >
          <ArrowLeft size={18} />
          Ana sayfa
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf5e6]">
            <Leaf size={20} className="text-[#238f61]" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs text-[#718078]">İBB Toprak Rehberi</div>
            <div className="text-sm font-bold">Rapor yorumlama</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Yöntem seçimi                                                               */
/* -------------------------------------------------------------------------- */

function MethodScreen({ method, onSelect }: { method: Method | null; onSelect: (m: Method) => void }) {
  return (
    <div className="animate-[fadeIn_.4s_ease-out]">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Raporunuz elinizde mi?</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#687b70] sm:text-lg">
          En hızlısı laboratuvarın gönderdiği dosyayı yüklemek. Dosyanız yoksa kâğıt raporun fotoğrafını
          çekebilir ya da değerleri tek tek girebilirsiniz.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <MethodCard
          icon={<FileSpreadsheet size={30} />}
          title="Dosya yükle"
          description="Excel (.xlsx) veya PDF rapor"
          detail="Excel dosyası cihazınızda okunur, hiçbir yere gönderilmez."
          selected={method === 'dosya'}
          onClick={() => onSelect('dosya')}
        />
        <MethodCard
          icon={<Camera size={30} />}
          title="Fotoğraf çek"
          description="Kâğıt raporun fotoğrafı"
          detail="Raporu düz bir yüzeye koyup tamamı görünecek şekilde çekin."
          selected={method === 'foto'}
          onClick={() => onSelect('foto')}
        />
        <MethodCard
          icon={<UserRound size={30} />}
          title="Elle gireceğim"
          description="Değerleri raporunuzdan bakarak yazın"
          detail="Raporunuzda olmayan değerleri atlayabilirsiniz."
          selected={method === 'manuel'}
          onClick={() => onSelect('manuel')}
        />
      </div>
    </div>
  );
}

function UploadDialog({
  method,
  uploading,
  error,
  candidates,
  onFile,
  onPick,
  onManual,
  onClose,
}: {
  method: Method | null;
  uploading: boolean;
  error: string | null;
  candidates: SoilReport[];
  onFile: (f: File | undefined) => void;
  onPick: (r: SoilReport) => void;
  onManual: () => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPhoto = method === 'foto';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09271f]/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[30px] bg-white p-7 shadow-2xl sm:p-9">
        <button onClick={onClose} aria-label="Kapat" className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X size={20} />
        </button>

        {candidates.length > 0 ? (
          <>
            <h2 className="text-2xl font-extrabold">Dosyada {candidates.length} rapor var</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">Hangi tarlanın raporunu yorumlayalım?</p>
            <div className="mt-6 space-y-3">
              {candidates.map((r, i) => (
                <button
                  key={r.raporNo ?? i}
                  onClick={() => onPick(r)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#dfe9df] bg-[#f9fbf9] px-4 py-4 text-left transition hover:border-[#38a66d] hover:bg-[#eefaf0]"
                >
                  <span>
                    <span className="block font-bold">{r.numuneAdi ?? `Rapor ${i + 1}`}</span>
                    <span className="mt-0.5 block text-xs text-[#718078]">
                      {[r.raporNo, r.bitki, r.ilce].filter(Boolean).join(' / ')}
                    </span>
                  </span>
                  <ChevronRight size={20} className="text-[#238f61]" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf6e4] text-[#238f61]">
              <Upload size={27} />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold">{isPhoto ? 'Raporun fotoğrafını seçin' : 'Rapor dosyanızı seçin'}</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">
              {isPhoto
                ? 'Tüm tablo görünür ve yazılar okunaklı olmalı. Okunan değerleri bir sonraki adımda kontrol edeceksiniz.'
                : 'Laboratuvarın gönderdiği Excel (.xlsx) veya PDF dosyası.'}
            </p>

            <button
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="mt-7 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9d9ae] bg-[#f7fbf5] px-6 py-10 text-center transition hover:border-[#238f61] disabled:cursor-wait"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin text-[#238f61]" size={32} />
                  <div className="mt-4 font-bold">Rapor okunuyor…</div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    {isPhoto ? <Camera className="text-[#238f61]" /> : <FileSpreadsheet className="text-[#238f61]" />}
                  </div>
                  <div className="mt-4 font-bold">Dosya seçmek için dokunun</div>
                  <div className="mt-1 text-xs text-[#819087]">{isPhoto ? 'JPG, PNG veya WEBP' : 'XLSX veya PDF, en fazla 10 MB'}</div>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex gap-2 rounded-2xl bg-[#fff4e5] p-4 text-sm text-[#7a4b00]">
                <AlertTriangle size={18} className="shrink-0" />
                <span>
                  {error}{' '}
                  <button onClick={onManual} className="font-bold underline">
                    Elle gir
                  </button>
                </span>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={isPhoto ? 'image/png,image/jpeg,image/webp' : '.xlsx,.xls,.pdf'}
              capture={isPhoto ? 'environment' : undefined}
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = ''; // aynı dosya tekrar seçilebilsin
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Manuel giriş                                                                */
/* -------------------------------------------------------------------------- */

function ManualScreen({
  step,
  draft,
  missing,
  meta,
  onMeta,
  onDraft,
  onToggleMissing,
  onBack,
  onNext,
}: {
  step: number;
  draft: Draft;
  missing: Missing;
  meta: Meta;
  onMeta: (k: keyof Meta, v: string) => void;
  onDraft: (k: ParamKey, v: string) => void;
  onToggleMissing: (k: ParamKey) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const total = MANUAL_STEPS.length + 1;
  const section = step === 0 ? null : MANUAL_STEPS[step - 1];
  const textureWarn =
    section?.fields.includes('kil') &&
    textureSumWarning({ kum: parseNumber(draft.kum), silt: parseNumber(draft.silt), kil: parseNumber(draft.kil) });

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dfe9df] bg-white p-5 shadow-[0_18px_50px_rgba(19,53,41,.08)] sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-[#dfe9df] bg-[#f4faf3] px-4 py-2 text-sm font-semibold text-[#476456] hover:bg-[#edf6eb]">
          <ArrowLeft size={16} />
          Geri
        </button>
        <div className="text-sm font-semibold text-[#32965e]">
          Adım {step + 1} / {total}
        </div>
      </div>
      <div className="mb-8 h-2.5 overflow-hidden rounded-full bg-[#dfe9df]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#5fc33c] to-[#249b70] transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{section ? section.title : 'Tarlanız hakkında'}</h2>
        <p className="mt-3 text-base text-[#64766c]">
          {section ? section.description : 'Bu bilgiler önerileri size özel hale getirir.'}
        </p>
      </div>

      <div className="space-y-5">
        {step === 0 ? (
          <>
            <Panel title="İlçe" helper="Toprağın alındığı ilçe.">
              <select
                value={meta.ilce}
                onChange={(e) => onMeta('ilce', e.target.value)}
                className="mt-4 w-full rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#38a66d]"
              >
                <option value="">Seçin</option>
                {ISTANBUL_ILCELERI.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Panel>
            <Panel title="Ne ekmeyi planlıyorsunuz?" helper='Raporda "Ekimi Planlanan Bitki" olarak geçer.'>
              <ChoiceGrid options={COMMON_CROPS} value={meta.bitki} onChange={(v) => onMeta('bitki', v)} />
              <input
                value={COMMON_CROPS.includes(meta.bitki) ? '' : meta.bitki}
                onChange={(e) => onMeta('bitki', e.target.value)}
                placeholder="Listede yoksa yazın"
                className="mt-3 w-full rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 outline-none focus:border-[#38a66d]"
              />
            </Panel>
          </>
        ) : (
          <>
            {section!.fields.map((key) => (
              <NumberField
                key={key}
                k={key}
                value={draft[key]}
                missing={missing[key]}
                onChange={(v) => onDraft(key, v)}
                onToggleMissing={() => onToggleMissing(key)}
              />
            ))}
            {section!.fields.includes('kil') && (
              <Panel title="Bünye sınıfı" helper='Raporda kum oranının yanında yazan sınıf (ör. "CL (Killi Tın Bünyeli)").'>
                <ChoiceGrid
                  options={BUNYE_SINIFLARI.map((b) => `${b.code} (${b.label})`)}
                  value={meta.bunyeSinifi}
                  onChange={(v) => onMeta('bunyeSinifi', v)}
                />
              </Panel>
            )}
            {textureWarn && <Warning text={textureWarn} />}
          </>
        )}
      </div>

      <button
        onClick={onNext}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#74cc3c] to-[#20a875] px-6 py-4 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(32,168,117,0.28)] transition hover:-translate-y-1"
      >
        {step === total - 1 ? 'Değerleri kontrol et' : 'Sonraki'}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function NumberField({
  k,
  value,
  missing,
  onChange,
  onToggleMissing,
}: {
  k: ParamKey;
  value: string;
  missing: boolean;
  onChange: (v: string) => void;
  onToggleMissing: () => void;
}) {
  const def = PARAMS[k];
  const n = parseNumber(value);
  const invalid = value.trim() !== '' && n === undefined;
  const warn = n !== undefined ? sanityWarning(k, n) : undefined;
  const id = `f-${k}`;

  return (
    <div className="rounded-[28px] border border-[#e1ebdf] bg-[#f9fbf9] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-lg font-bold">
            {def.label}
          </label>
          <div className="mt-1 text-xs leading-5 text-[#75867a]">
            Raporda: <span className="font-semibold">{def.reportLabel}</span>. {def.helper}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#d8e8d6] bg-white px-3 py-2 text-xs font-semibold text-[#476456]">
          <input type="checkbox" checked={missing} onChange={onToggleMissing} className="h-4 w-4 accent-[#238f61]" />
          Raporumda yok
        </label>
      </div>

      <div className={`mt-4 flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm ${invalid ? 'border-[#e0a100]' : 'border-[#dfe9df]'} focus-within:border-[#38a66d]`}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={def.placeholder}
          disabled={missing}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-none bg-transparent text-lg font-bold outline-none placeholder:text-[#b3bdb7] disabled:opacity-50"
        />
        {def.unit && <span className="whitespace-nowrap rounded-full bg-[#edf7ed] px-3 py-1 text-sm font-bold text-[#238f61]">{def.unit}</span>}
      </div>
      {invalid && <Warning text="Lütfen yalnızca sayı girin (ör. 7,12)." />}
      {warn && <Warning text={warn} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Kontrol ekranı                                                              */
/* -------------------------------------------------------------------------- */

function ReviewScreen({
  report,
  source,
  onEdit,
  onConfirm,
}: {
  report: SoilReport;
  source: 'manuel' | 'dosya';
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const count = Object.keys(report.values).length;

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dfe9df] bg-white p-6 shadow-[0_18px_50px_rgba(19,53,41,.08)] sm:p-8">
      <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Değerler raporunuzla aynı mı?</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-[#64766c]">
        {source === 'dosya'
          ? 'Dosyanızdan okuduğumuz değerler aşağıda. Raporunuzla karşılaştırın; farklı olan varsa düzeltin.'
          : 'Girdiğiniz değerleri son kez kontrol edin.'}
      </p>

      <dl className="mt-8 divide-y divide-[#edf2ee] rounded-[24px] border border-[#dfe9df] bg-[#f8fbf7] px-5">
        <Row label="Rapor / numune" value={[report.raporNo, report.numuneAdi].filter(Boolean).join(' – ') || 'Belirtilmedi'} />
        <Row label="İlçe" value={report.ilce ?? 'Belirtilmedi'} />
        <Row label="Planlanan bitki" value={report.bitki ?? 'Belirtilmedi'} />
        {(Object.keys(PARAMS) as ParamKey[]).map((k) => (
          <Row
            key={k}
            label={PARAMS[k].label}
            value={report.values[k] !== undefined ? `${formatNumber(report.values[k]!, 4)} ${PARAMS[k].unit}` : 'Belirtilmedi'}
            muted={report.values[k] === undefined}
          />
        ))}
        <Row label="Bünye sınıfı" value={report.bunyeSinifi ?? 'Belirtilmedi'} muted={!report.bunyeSinifi} />
      </dl>

      {count === 0 && <Warning text="Yorum için en az bir değer girmelisiniz." />}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={onEdit} className="rounded-full border border-[#dfe9df] bg-[#f4faf3] px-6 py-4 font-semibold text-[#476456] hover:bg-[#edf6eb]">
          Değerleri düzelt
        </button>
        <button
          disabled={count === 0}
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#74cc3c] to-[#20a875] px-6 py-4 text-lg font-extrabold text-white shadow-[0_18px_45px_rgba(32,168,117,0.28)] transition hover:-translate-y-1 disabled:opacity-50"
        >
          Doğru, yorumla
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sonuç ekranı                                                                */
/* -------------------------------------------------------------------------- */

const TONE_STYLE: Record<Tone, { box: string; dot: string; text: string }> = {
  iyi: { box: 'border-[#cfe9c9] bg-[#f2fbef]', dot: 'bg-[#2e9e5b]', text: 'İyi durumda' },
  dikkat: { box: 'border-[#f2dca6] bg-[#fffaf0]', dot: 'bg-[#d99a00]', text: 'Dikkat' },
  sorun: { box: 'border-[#f1c4bd] bg-[#fff5f3]', dot: 'bg-[#cf4a35]', text: 'İyileştirilmeli' },
  bilgi: { box: 'border-[#d6e3ea] bg-[#f5f9fb]', dot: 'bg-[#5b8aa3]', text: 'Bilgi' },
};

function ResultScreen({
  report,
  ai,
  aiState,
  onRetryAi,
  onBack,
  onNew,
}: {
  report: SoilReport;
  ai: AiYorum | null;
  aiState: 'idle' | 'loading' | 'error';
  onRetryAi: () => void;
  onBack: () => void;
  onNew: () => void;
}) {
  const results = classify(report);
  const order: Tone[] = ['sorun', 'dikkat', 'iyi', 'bilgi'];
  const sorted = [...results].sort((a, b) => order.indexOf(a.classification!.tone) - order.indexOf(b.classification!.tone));
  const issues = results.filter((r) => r.classification?.tone === 'sorun' || r.classification?.tone === 'dikkat').length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <div className="text-sm font-semibold text-[#32965e]">
          {[report.numuneAdi, report.ilce, report.bitki && `${report.bitki} için`].filter(Boolean).join(' / ')}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {issues === 0 ? 'Toprağınız genel olarak iyi durumda' : `Toprağınızda ${issues} konu ilgi bekliyor`}
        </h1>
      </div>

      {/* Yapay zeka yorumu */}
      <div className="mt-8 rounded-[28px] border border-[#dfe9df] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-sm font-bold text-[#238f61]">
          <Sprout size={18} />
          Sade dille özet
        </div>
        {aiState === 'loading' && (
          <div className="mt-4 flex items-center gap-3 text-[#64766c]">
            <Loader2 className="animate-spin" size={20} /> Yorum hazırlanıyor…
          </div>
        )}
        {aiState === 'error' && (
          <div className="mt-4 text-sm text-[#7a4b00]">
            Özet şu anda hazırlanamadı. Aşağıdaki tablo laboratuvar sonuçlarına dayanır ve geçerlidir.{' '}
            <button onClick={onRetryAi} className="font-bold underline">
              Tekrar dene
            </button>
          </div>
        )}
        {ai && (
          <div className="mt-4 space-y-6">
            <p className="text-lg leading-8">{ai.ozet}</p>
            {ai.bitkiUygunlugu && (
              <div className="rounded-2xl bg-[#f2fbef] p-4 text-sm leading-6">
                <span className="font-bold">{report.bitki} için: </span>
                {ai.bitkiUygunlugu}
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <BulletList title="Güçlü yanlar" items={ai.gucluYonler} icon={<CircleCheck size={16} className="text-[#2e9e5b]" />} />
              <BulletList title="Dikkat edilecekler" items={ai.dikkatEdilecekler} icon={<AlertTriangle size={16} className="text-[#d99a00]" />} />
            </div>
            {ai.oneriler?.length > 0 && (
              <div>
                <h3 className="font-bold">Neler yapabilirsiniz?</h3>
                <ol className="mt-3 space-y-3">
                  {ai.oneriler.map((o, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#238f61] text-sm font-bold text-white">{i + 1}</span>
                      <span>
                        <span className="font-semibold">{o.baslik}. </span>
                        <span className="text-[#51675d]">{o.aciklama}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Parametre kartları – yapay zekadan bağımsız, kural tabanlı */}
      <h2 className="mt-10 text-xl font-bold">Değer değer sonuçlarınız</h2>
      <div className="mt-4 space-y-3">
        {sorted.map((r) => {
          const c = r.classification!;
          const s = TONE_STYLE[c.tone];
          const def = PARAMS[r.key];
          return (
            <div key={r.key} className={`rounded-2xl border p-5 ${s.box}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-bold">{def.label}</div>
                <div className="text-sm">
                  <span className="font-bold">{formatNumber(r.value, 4)}</span> {def.unit}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                {c.label}
                {r.source === 'laboratuvar' && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#476456]">Laboratuvar değerlendirmesi</span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#42564b]">{c.meaning}</p>
              <p className="mt-1 text-xs leading-5 text-[#75867a]">{def.why}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3 rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-5 text-xs leading-5 text-[#5b6f65]">
        <Info size={18} className="shrink-0 text-[#238f61]" />
        <p>
          Bu yorum bilgilendirme amaçlıdır ve bağlayıcı bir gübreleme reçetesi değildir. Gübre çeşidi ve miktarı için
          İlçe Tarım ve Orman Müdürlüğü’ne veya bir ziraat mühendisine danışın. Sarı/kırmızı işaretli değerler için
          laboratuvar değerlendirmesi esas alınmıştır.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
        <button onClick={onBack} className="rounded-full border border-[#dfe9df] bg-[#f4faf3] px-6 py-3 font-semibold text-[#476456] hover:bg-[#edf6eb]">
          Değerleri değiştir
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#dfe9df] bg-white px-6 py-3 font-semibold text-[#476456] hover:bg-[#f4faf3]">
          <Printer size={18} /> Yazdır / PDF kaydet
        </button>
        <button onClick={onNew} className="flex-1 rounded-full bg-[#238f61] px-6 py-3 font-bold text-white hover:bg-[#1d7d54]">
          Başka bir rapor yorumla
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Küçük bileşenler                                                            */
/* -------------------------------------------------------------------------- */

function Panel({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#e1ebdf] bg-[#f9fbf9] p-5 sm:p-6">
      <div className="text-lg font-bold">{title}</div>
      <div className="mt-1 text-xs leading-5 text-[#75867a]">{helper}</div>
      {children}
    </div>
  );
}

function ChoiceGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const sel = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={sel}
            onClick={() => onChange(sel ? '' : o)}
            className={`flex min-h-[52px] items-center justify-between rounded-2xl border px-4 py-2 text-left font-semibold transition ${
              sel ? 'border-[#38a66d] bg-[#eefaf0]' : 'border-[#dfe9df] bg-white hover:border-[#9aca89]'
            }`}
          >
            {o}
            {sel && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#238f61] text-white">
                <Check size={14} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <div className="mt-3 flex gap-2 rounded-xl bg-[#fff4e5] px-3 py-2 text-xs leading-5 text-[#7a4b00]">
      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
      {text}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm font-semibold text-[#51675d]">{label}</dt>
      <dd className={`text-right text-sm font-bold ${muted ? 'text-[#9aa7a0]' : ''}`}>{value}</dd>
    </div>
  );
}

function BulletList({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm leading-6">
            <span className="mt-1">{icon}</span>
            {t}
          </li>
        ))}
      </ul>
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

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e2ebe1] bg-white p-7 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f3e7] text-sm font-bold text-[#238f61]">{number}</div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#718078]">{description}</p>
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
      className={`group relative rounded-[28px] border bg-white p-7 text-left transition-all ${
        selected ? 'border-[#38a66d] ring-2 ring-[#d9f1d0]' : 'border-[#dfe9df] shadow-sm hover:-translate-y-1 hover:border-[#9aca89] hover:shadow-xl'
      }`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${selected ? 'bg-[#238f61] text-white' : 'bg-[#eaf6e4] text-[#238f61]'}`}>{icon}</div>
      <h3 className="mt-6 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm font-medium text-[#53685c]">{description}</p>
      <p className="mt-4 text-xs leading-5 text-[#829087]">{detail}</p>
    </button>
  );
}
