'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronRight,
  CalendarDays,
  CirclePlay,
  ClipboardList,
  FlaskConical,
  Gauge,
  ShieldCheck,
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
import { ORGANIK_MADDE_PROTOKOLU, ZKART_BITKILERI, zkartBul } from '@/lib/igsas';
import { kaliteIndeksi, type IndeksSonucu } from '@/lib/indeks';
import { VIDEOLAR, youtubeId } from '@/lib/videolar';
import { type ZKart } from '@/lib/zkartlar';
import {
  BUNYE_SINIFLARI,
  GROUP_LABELS,
  ISTANBUL_ILCELERI,
  MANUAL_STEPS,
  PARAMS,
  classify,
  formatNumber,
  parseNumber,
  sanityWarning,
  textureSumWarning,
  uygunAralikMetni,
  uygunFark,
  type EkDeger,
  type ParamGroup,
  type ParamKey,
  type ParamResult,
  type SoilReport,
  type Tone,
} from '@/lib/toprak';

type Screen = 'home' | 'guide' | 'manual' | 'review' | 'result';
type Method = 'dosya' | 'foto' | 'manuel';

type Meta = { ilce: string; bitki: string; numuneAdi: string; bunyeSinifi: string; raporNo: string };
type Draft = Record<ParamKey, string>;
type Missing = Record<ParamKey, boolean>;

type UrunOnerisi = { urun: string; doz: string; aciklama: string };
type CozumPlani = {
  ozet: string;
  sorunlar: { parametre: string; etki: string; urunler: { urun: string; doz: string }[]; zaman: string }[];
  kokGelisimi: UrunOnerisi[];
  iklimKoruma: UrunOnerisi[];
  gubreleme: UrunOnerisi[];
  bitkiUygunlugu: string | null;
};

const PARAM_KEYS = Object.keys(PARAMS) as ParamKey[];
const emptyDraft = () => Object.fromEntries(PARAM_KEYS.map((k) => [k, ''])) as Draft;
const emptyMissing = () => Object.fromEntries(PARAM_KEYS.map((k) => [k, false])) as Missing;
const emptyMeta = (): Meta => ({ ilce: '', bitki: '', numuneAdi: '', bunyeSinifi: '', raporNo: '' });

// Z-kartı olan bitkiler önce; listede olmayan bitki elle yazılabilir
const COMMON_CROPS = [...ZKART_BITKILERI, 'Bilmiyorum'];

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
  const [ekDegerler, setEkDegerler] = useState<EkDeger[]>([]);
  const [source, setSource] = useState<'manuel' | 'dosya'>('manuel');

  const [ai, setAi] = useState<CozumPlani | null>(null);
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
    setEkDegerler([]);
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
      ekDegerler,
    };
  };

  const loadReport = (r: SoilReport) => {
    const d = emptyDraft();
    const m = emptyMissing();
    PARAM_KEYS.forEach((k) => {
      // Yapay zeka okuyamadığı değeri null ya da "658 µS/cm" gibi metin döndürebilir
      const v = parseNumber(r.values?.[k]);
      if (v === undefined) m[k] = true;
      else d[k] = formatNumber(v, 4);
    });
    setDraft(d);
    setMissing(m);
    setMeta({
      ilce: typeof r.ilce === 'string' ? r.ilce : '',
      bitki: typeof r.bitki === 'string' ? r.bitki : '',
      numuneAdi: typeof r.numuneAdi === 'string' ? r.numuneAdi : '',
      bunyeSinifi: typeof r.bunyeSinifi === 'string' ? r.bunyeSinifi : '',
      raporNo: typeof r.raporNo === 'string' ? r.raporNo : '',
    });
    const lab: SoilReport['labDegerlendirme'] = {};
    Object.entries(r.labDegerlendirme ?? {}).forEach(([k, v]) => {
      if (typeof v === 'string' && v.trim()) lab[k as ParamKey] = v.trim();
    });
    setLabEval(lab);
    setEkDegerler(Array.isArray(r.ekDegerler) ? r.ekDegerler : []);
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
      setEkDegerler([]);
      setStep(0);
      go('manual');
    } else {
      setPickerOpen(true);
    }
  };

  const aiRequest = useRef(0);
  const fetchAi = async (report: SoilReport = buildReport()) => {
    const id = ++aiRequest.current; // bitki hızlıca değiştirilirse eski cevabı yok say
    setAi(null);
    setAiState('loading');
    try {
      const res = await fetch('/api/yorum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (id !== aiRequest.current) return;
      setAi(json);
      setAiState('idle');
    } catch {
      if (id === aiRequest.current) setAiState('error');
    }
  };

  const changeCrop = (bitki: string) => {
    setMeta((p) => ({ ...p, bitki }));
    fetchAi({ ...buildReport(), bitki });
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
                onRetryAi={() => fetchAi()}
                onChangeCrop={changeCrop}
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
  const count = Object.keys(report.values).length + (report.ekDegerler?.length ?? 0);

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
        {(Object.keys(PARAMS) as ParamKey[])
          .filter((k) => !PARAMS[k].ek || report.values[k] !== undefined)
          .map((k) => (
          <Row
            key={k}
            label={PARAMS[k].label}
            value={report.values[k] !== undefined ? `${formatNumber(report.values[k]!, 4)} ${PARAMS[k].unit}` : 'Belirtilmedi'}
            muted={report.values[k] === undefined}
          />
        ))}
        <Row label="Bünye sınıfı" value={report.bunyeSinifi ?? 'Belirtilmedi'} muted={!report.bunyeSinifi} />
        {(report.ekDegerler ?? []).map((e, i) => (
          <Row key={`ek-${i}`} label={e.ad} value={`${formatNumber(e.deger, 4)} ${e.birim ?? ''}`.trim()} />
        ))}
      </dl>
      {(report.ekDegerler?.length ?? 0) > 0 && (
        <p className="mt-3 text-xs leading-5 text-[#75867a]">
          Son {report.ekDegerler!.length} satır raporunuzdaki ek ölçümlerdir; tabloda “Diğer ölçümler” başlığında gösterilir.
        </p>
      )}

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

const TONE_STYLE: Record<Tone, { dot: string; text: string; bar: string; label: string }> = {
  iyi: { dot: 'bg-[#2e9e5b]', text: 'text-[#1f7a45]', bar: 'bg-[#2e9e5b]', label: 'Uygun' },
  dikkat: { dot: 'bg-[#d99a00]', text: 'text-[#8a5a00]', bar: 'bg-[#d99a00]', label: 'Dikkat' },
  sorun: { dot: 'bg-[#cf4a35]', text: 'text-[#a83422]', bar: 'bg-[#cf4a35]', label: 'İyileştirilmeli' },
  bilgi: { dot: 'bg-[#5b8aa3]', text: 'text-[#3d6478]', bar: 'bg-[#5b8aa3]', label: 'Bilgi' },
};

const GROUP_ORDER: ParamGroup[] = ['temel', 'besin', 'mikro', 'yapi'];

/** Değerin uygun aralığa göre konumunu gösteren ince çubuk. */
function RangeBar({ k, value, tone }: { k: ParamKey; value: number; tone: Tone }) {
  const r = PARAMS[k].uygun;
  if (!r) return null;
  const lo = k === 'ph' ? 3 : 0;
  const ref = r.max ?? (r.min ?? 1) * 2;
  const hi = k === 'ph' ? 10 : Math.max(value, ref) * 1.25;
  const pct = (x: number) => Math.min(100, Math.max(0, ((x - lo) / (hi - lo)) * 100));
  const from = pct(r.min ?? lo);
  const to = pct(r.max ?? hi);
  return (
    <div className="relative mt-2 h-1.5 w-full max-w-[140px] rounded-full bg-[#e7ece8]" aria-hidden>
      <div className="absolute inset-y-0 rounded-full bg-[#bfe3c4]" style={{ left: `${from}%`, width: `${to - from}%` }} />
      <div
        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${TONE_STYLE[tone].bar}`}
        style={{ left: `${pct(value)}%` }}
      />
    </div>
  );
}

function StatusCell({ tone, label, fark, lab }: { tone: Tone; label: string; fark?: string; lab?: boolean }) {
  const s = TONE_STYLE[tone];
  return (
    <div>
      <div className={`flex items-center gap-2 font-semibold ${s.text}`}>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
        {label}
      </div>
      {fark && <div className="mt-0.5 text-xs text-[#51675d]">{fark}</div>}
      {lab && <div className="mt-0.5 hidden text-[11px] text-[#8a978f] sm:block">Laboratuvar değerlendirmesi</div>}
    </div>
  );
}

function AnalysisTable({ report, results }: { report: SoilReport; results: ParamResult[] }) {
  const byGroup = GROUP_ORDER.map((g) => ({ g, rows: results.filter((r) => PARAMS[r.key].group === g) })).filter(
    (x) => x.rows.length > 0,
  );
  const ek = report.ekDegerler ?? [];

  const groupHeader = (title: string) => (
    <tr className="bg-[#f3f7f2]">
      <th colSpan={4} scope="colgroup" className="px-3 py-2 sm:px-4 text-left text-xs font-bold text-[#476456]">
        {title}
      </th>
    </tr>
  );

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#dfe9df] bg-white">
      <table className="w-full border-collapse text-[13px] sm:text-sm">
        <thead>
          <tr className="border-b border-[#dfe9df] text-left text-xs text-[#6b7d72]">
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">Parametre</th>
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">Sonuç</th>
            <th scope="col" className="hidden px-3 py-3 sm:px-4 font-semibold sm:table-cell">Uygun aralık</th>
            <th scope="col" className="px-3 py-3 sm:px-4 font-semibold">Durum ve fark</th>
          </tr>
        </thead>
        {byGroup.map(({ g, rows }) => (
          <tbody key={g} className="divide-y divide-[#edf2ee]">
            {groupHeader(GROUP_LABELS[g])}
            {g === 'yapi' && report.bunyeSinifi && (
              <tr>
                <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">Bünye sınıfı</th>
                <td className="px-3 py-3 sm:px-4 font-bold">{report.bunyeSinifi}</td>
                <td className="hidden px-3 py-3 sm:px-4 text-[#8a978f] sm:table-cell">—</td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusCell tone="bilgi" label="Bilgi" lab={!!report.labDegerlendirme.bunye} />
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const def = PARAMS[r.key];
              const c = r.classification!;
              const fark = uygunFark(r.key, r.value);
              const isTexture = r.key === 'kum' || r.key === 'silt' || r.key === 'kil';
              return (
                <tr key={r.key} className="align-top">
                  <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">
                    {def.label}
                    {def.unit && <span className="block text-xs font-normal text-[#8a978f]">{def.unit}</span>}
                  </th>
                  <td className="px-3 py-3 sm:px-4">
                    <span className="text-base font-bold tabular-nums">{formatNumber(r.value, 4)}</span>
                    <RangeBar k={r.key} value={r.value} tone={c.tone} />
                    {def.uygun && (
                      <span className="mt-1 block text-xs text-[#8a978f] sm:hidden">Uygun: {uygunAralikMetni(r.key)}</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 sm:px-4 tabular-nums text-[#51675d] sm:table-cell">{uygunAralikMetni(r.key)}</td>
                  <td className="px-3 py-3 sm:px-4">
                    {isTexture ? (
                      <StatusCell tone="bilgi" label="Bilgi" />
                    ) : (
                      <StatusCell
                        tone={c.tone}
                        label={c.label}
                        fark={fark.durum === 'eksik' || fark.durum === 'fazla' ? fark.metin : undefined}
                        lab={r.source === 'laboratuvar'}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
        {ek.length > 0 && (
          <tbody className="divide-y divide-[#edf2ee]">
            {groupHeader('Diğer ölçümler')}
            {ek.map((e, i) => (
              <tr key={`ek-${i}`} className="align-top">
                <th scope="row" className="px-3 py-3 sm:px-4 text-left font-semibold">
                  {e.ad}
                  {e.birim && <span className="block text-xs font-normal text-[#8a978f]">{e.birim}</span>}
                </th>
                <td className="px-3 py-3 sm:px-4 text-base font-bold tabular-nums">{formatNumber(e.deger, 4)}</td>
                <td className="hidden px-3 py-3 sm:px-4 text-[#8a978f] sm:table-cell">—</td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusCell tone="bilgi" label={e.labDegerlendirme || 'Bilgi'} lab={!!e.labDegerlendirme} />
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

const PUAN_RENK = ['#c9412b', '#c9412b', '#e07b28', '#d4a017', '#5aa832', '#1f8a4c'];

/** 0–5 puanı 5 parçalı çubukla gösterir. */
function PuanCubugu({ puan }: { puan: number }) {
  return (
    <div className="flex gap-1" aria-label={`${puan} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-2 w-5 rounded-full sm:w-6"
          style={{ background: i <= puan ? PUAN_RENK[puan] : '#e4ebe5' }}
        />
      ))}
    </div>
  );
}

/** Yarım daire gösterge (0–100). */
function IndeksGostergesi({ yuzde, renk }: { yuzde: number; renk: string }) {
  const r = 80;
  const c = Math.PI * r;
  return (
    <svg viewBox="0 0 200 116" className="w-full max-w-[240px]" role="img" aria-label={`Kalite indeksi ${yuzde} / 100`}>
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#e4ebe5" strokeWidth="16" strokeLinecap="round" />
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke={renk}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${(c * yuzde) / 100} ${c}`}
      />
      <text x="100" y="88" textAnchor="middle" fontSize="40" fontWeight="800" fill="#17352a">
        {yuzde}
      </text>
      <text x="100" y="108" textAnchor="middle" fontSize="12" fill="#6b7d72">
        / 100
      </text>
    </svg>
  );
}

function KaliteIndeksi({ indeks }: { indeks: IndeksSonucu }) {
  const sirali = [...indeks.satirlar].sort((a, b) => a.puan - b.puan);
  return (
    <section className="mt-8 overflow-hidden rounded-[28px] border border-[#dfe9df] bg-white" aria-labelledby="tki">
      <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[260px_1fr] md:gap-10">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 id="tki" className="flex items-center gap-2 text-lg font-bold">
            <Gauge size={20} className="text-[#238f61]" />
            Toprak Kalite İndeksi
          </h2>
          <div className="mt-3 w-full">
            <IndeksGostergesi yuzde={indeks.yuzde} renk={indeks.renk} />
          </div>
          <div className="mt-1 rounded-full px-4 py-1 text-sm font-bold text-white" style={{ background: indeks.renk }}>
            {indeks.sinif}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#75867a]">
            {indeks.satirlar.length} parametrenin 0–5 puan ortalaması ({formatNumber(indeks.ortalama, 1)} / 5)
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#51675d]">Parametre puanları</h3>
          <ul className="mt-3 divide-y divide-[#edf2ee]">
            {sirali.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 text-sm">
                  <span className="font-semibold">{s.ad}</span>
                  <span className="ml-2 tabular-nums text-xs text-[#8a978f]">
                    {formatNumber(s.deger, 3)} {s.birim}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <PuanCubugu puan={s.puan} />
                  <span className="w-8 text-right text-sm font-bold tabular-nums" style={{ color: PUAN_RENK[s.puan] }}>
                    {s.puan}/5
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function UrunKarti({ u }: { u: UrunOnerisi }) {
  return (
    <li className="rounded-2xl border border-[#e1ebdf] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="font-bold tracking-tight text-[#17352a]">{u.urun}</span>
        <span className="rounded-full bg-[#edf7ed] px-2.5 py-1 text-xs font-bold text-[#1f7a45]">{u.doz}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#4b5f55]">{u.aciklama}</p>
    </li>
  );
}

function UrunBolumu({ icon, title, items }: { icon: ReactNode; title: string; items: UrunOnerisi[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 font-bold">
        <span className="text-[#238f61]">{icon}</span>
        {title}
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((u, i) => (
          <UrunKarti key={i} u={u} />
        ))}
      </ul>
    </div>
  );
}

function SolutionPlan({
  report,
  ai,
  aiState,
  onRetryAi,
  omDusuk,
}: {
  report: SoilReport;
  ai: CozumPlani | null;
  aiState: 'idle' | 'loading' | 'error';
  onRetryAi: () => void;
  omDusuk: boolean;
}) {
  return (
    <section className="mt-10 rounded-[28px] border border-[#dfe9df] bg-[#fbfdfb] p-5 sm:p-8" aria-labelledby="cozum">
      <h2 id="cozum" className="flex items-center gap-2 text-xl font-bold">
        <ClipboardList size={22} className="text-[#238f61]" />
        Çözüm planı
      </h2>

      {aiState === 'loading' && (
        <div className="mt-5 flex items-center gap-3 text-[#64766c]">
          <Loader2 className="animate-spin" size={20} /> Analiz sonuçlarınıza göre ürün programı hazırlanıyor…
        </div>
      )}
      {!ai && omDusuk && <OrganikMaddeProtokolu />}
      {aiState === 'error' && (
        <div className="mt-5 text-sm text-[#7a4b00]">
          Çözüm planı şu anda hazırlanamadı.{' '}
          <button onClick={onRetryAi} className="font-bold underline">
            Tekrar dene
          </button>
        </div>
      )}

      {ai && (
        <div className="mt-5 space-y-9">
          <div className="space-y-3">
            <p className="max-w-[70ch] text-base leading-7 text-[#2a3d36]">{ai.ozet}</p>
            {ai.bitkiUygunlugu && report.bitki && (
              <p className="rounded-2xl bg-[#eef8ea] p-4 text-sm leading-6">
                <span className="font-bold">{report.bitki}: </span>
                {ai.bitkiUygunlugu}
              </p>
            )}
          </div>

          {ai.sorunlar?.length > 0 && (
            <div>
              <h3 className="font-bold">Sorunlar ve önerilen ürünler</h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[#dfe9df] bg-white">
                <div className="hidden grid-cols-[1fr_1.4fr_0.8fr] gap-4 border-b border-[#dfe9df] bg-[#f3f7f2] px-4 py-2 text-xs font-semibold text-[#6b7d72] sm:grid">
                  <span>Sorun</span>
                  <span>Ürün ve doz</span>
                  <span>Ne zaman?</span>
                </div>
                <ol className="divide-y divide-[#edf2ee]">
                  {ai.sorunlar.map((x, i) => (
                    <li key={i} className="grid gap-3 px-4 py-4 text-sm leading-6 sm:grid-cols-[1fr_1.4fr_0.8fr] sm:gap-4">
                      <div>
                        <div className="font-bold text-[#17352a]">{x.parametre}</div>
                        <div className="text-[#5b6f65]">{x.etki}</div>
                      </div>
                      <ul className="space-y-1.5">
                        {x.urunler.map((u, j) => (
                          <li key={j} className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-[#17352a]">{u.urun}</span>
                            <span className="rounded-full bg-[#edf7ed] px-2 py-0.5 text-xs font-bold text-[#1f7a45]">{u.doz}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[#5b6f65]">
                        <span className="font-semibold text-[#2a3d36] sm:hidden">Ne zaman? </span>
                        {x.zaman}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {omDusuk && <OrganikMaddeProtokolu />}
          <UrunBolumu icon={<Sprout size={20} />} title="Kök gelişimi ve toprak canlılığı" items={ai.kokGelisimi} />
          <UrunBolumu icon={<ShieldCheck size={20} />} title="İklim stresine karşı koruma (don, sıcak, kuraklık)" items={ai.iklimKoruma} />
          <UrunBolumu icon={<FlaskConical size={20} />} title="Toprağınıza göre gübreleme" items={ai.gubreleme} />
        </div>
      )}
    </section>
  );
}

/** Organik madde düşükse sabit protokol (yapay zekadan bağımsız, her zaman doğru doz). */
function OrganikMaddeProtokolu() {
  return (
    <div className="mt-5 rounded-[24px] border border-[#e6dcc4] bg-[#fdf9ef] p-5 sm:p-6">
      <h3 className="font-bold text-[#5c4410]">Organik madde düşük: uygulama protokolü</h3>
      <ul className="mt-3 divide-y divide-[#efe5cd] text-sm">
        {ORGANIK_MADDE_PROTOKOLU.map((p) => (
          <li key={p.urun} className="grid gap-1 py-2.5 sm:grid-cols-[1.3fr_0.8fr_1.5fr] sm:items-baseline sm:gap-4">
            <span className="font-bold text-[#3f300b]">{p.urun}</span>
            <span className="font-semibold tabular-nums text-[#1f7a45]">{p.doz}</span>
            <span className="text-[#5b4a22]">{p.uygulama}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZKartProgrami({ zkart, bitki, onChangeCrop }: { zkart?: ZKart; bitki?: string; onChangeCrop: (b: string) => void }) {
  return (
    <section className="mt-10" aria-labelledby="zkart">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="zkart" className="flex items-center gap-2 text-xl font-bold">
            <CalendarDays size={22} className="text-[#238f61]" />
            İGSAŞ Z-kart programı{zkart ? `: ${zkart.bitki}` : ''}
          </h2>
          <p className="mt-1 text-sm text-[#64766c]">
            {zkart
              ? `Dönem dönem ürün ve dozlar (dekar başına) · ${zkart.sulama}`
              : `${bitki ? `"${bitki}" için Z-kart bulunmuyor.` : 'Bitki seçilmedi.'} Programı görmek için bitkinizi seçin.`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#476456] print:hidden">
          Bitki
          <select
            value={zkart?.bitki ?? ''}
            onChange={(e) => e.target.value && onChangeCrop(e.target.value)}
            className="rounded-full border border-[#dfe9df] bg-white px-4 py-2 font-semibold text-[#17352a] outline-none focus:border-[#38a66d]"
          >
            <option value="">Seçin</option>
            {ZKART_BITKILERI.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>

      {zkart && (
        <ol className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zkart.evreler.map((e, i) => (
            <li key={i} className="flex flex-col overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
              <div className="flex items-center gap-3 bg-[#1e4a37] px-4 py-3 text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#1e4a37]">
                  {i + 1}
                </span>
                <span className="text-sm font-bold leading-5">{e.evre}</span>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="text-xs text-[#7b8c82]">
                  {[e.bbch && `BBCH ${e.bbch}`, e.donem].filter(Boolean).join(' · ')}
                </div>
                {e.uygulamalar.length === 0 ? (
                  <p className="mt-3 text-sm text-[#7b8c82]">Bu dönemde uygulama yok.</p>
                ) : (
                  e.uygulamalar.map((g) => (
                    <div key={g.yontem} className="mt-3">
                      <div className="text-xs font-bold text-[#2f7f9a]">{g.yontem}</div>
                      <ul className="mt-1 space-y-1">
                        {g.urunler.map((u, j) => (
                          <li key={j} className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-semibold text-[#17352a]">{u.urun}</span>
                            <span className="text-right text-xs font-bold tabular-nums text-[#1f7a45]">{u.doz}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Videolar({ bitki }: { bitki?: string }) {
  const list = VIDEOLAR.filter((v) => !v.bitki || v.bitki === bitki);
  if (!list.length) return null;
  return (
    <section className="mt-10 print:hidden" aria-labelledby="video">
      <h2 id="video" className="flex items-center gap-2 text-xl font-bold">
        <CirclePlay size={22} className="text-[#238f61]" />
        Uygulama videoları
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {list.map((v) => {
          const id = youtubeId(v.url);
          return (
            <figure key={v.url} className="overflow-hidden rounded-[22px] border border-[#dfe9df] bg-white">
              {id ? (
                <iframe
                  className="aspect-video w-full"
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title={v.baslik}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
              <figcaption className="px-4 py-3 text-sm font-semibold">{v.baslik}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function ResultScreen({
  report,
  ai,
  aiState,
  onRetryAi,
  onChangeCrop,
  onBack,
  onNew,
}: {
  report: SoilReport;
  ai: CozumPlani | null;
  aiState: 'idle' | 'loading' | 'error';
  onRetryAi: () => void;
  onChangeCrop: (bitki: string) => void;
  onBack: () => void;
  onNew: () => void;
}) {
  const results = classify(report);
  const count = (t: Tone) => results.filter((r) => r.classification?.tone === t).length;
  const issues = count('sorun') + count('dikkat');
  const indeks = kaliteIndeksi(report);
  const zkart = zkartBul(report.bitki);
  const omDusuk = report.values.organikMadde !== undefined && uygunFark('organikMadde', report.values.organikMadde).durum === 'eksik';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="text-center">
        <div className="text-sm font-semibold text-[#32965e]">
          {[report.raporNo, report.numuneAdi, report.ilce, report.bitki && `${report.bitki} için`].filter(Boolean).join(' / ')}
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {issues === 0 ? 'Toprağınız genel olarak iyi durumda' : `Toprağınızda ${issues} konu ilgi bekliyor`}
        </h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold">
          {(['iyi', 'dikkat', 'sorun'] as Tone[]).map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full border border-[#dfe9df] bg-white px-3 py-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${TONE_STYLE[t].dot}`} />
              {count(t)} {TONE_STYLE[t].label.toLocaleLowerCase('tr-TR')}
            </span>
          ))}
        </div>
      </div>

      {indeks && <KaliteIndeksi indeks={indeks} />}

      <section className="mt-10" aria-labelledby="tablo">
        <h2 id="tablo" className="mb-3 text-xl font-bold">Analiz sonuçları</h2>
        <AnalysisTable report={report} results={results} />
        <details className="mt-3 rounded-2xl border border-[#e1e9df] bg-[#f8fbf7] p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-[#476456]">Bu değerler ne anlama geliyor?</summary>
          <dl className="mt-3 space-y-2">
            {results.map((r) => (
              <div key={r.key}>
                <dt className="font-semibold">{PARAMS[r.key].label}</dt>
                <dd className="text-[#5b6f65]">{PARAMS[r.key].why}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>

      <SolutionPlan report={report} ai={ai} aiState={aiState} onRetryAi={onRetryAi} omDusuk={omDusuk} />

      <ZKartProgrami zkart={zkart} bitki={report.bitki} onChangeCrop={onChangeCrop} />

      <Videolar bitki={zkart?.bitki} />

      <div className="mt-10 flex flex-col gap-3 sm:flex-row print:hidden">
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