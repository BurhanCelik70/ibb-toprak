'use client';
/**
 * Rapor yükleme sihirbazı: yöntem seçimi → dosya / fotoğraf / elle giriş → kontrol.
 * Kontrol ekranında "Kaydet ve yorumla" denince onKaydet(report, kaynak) çağrılır.
 */
import { useTx } from '@/components/DilSaglayici';
import { birimDonusumu, birimGoster, degerGoster, DE_BODENARTEN, etiketGoster, icDeger } from '@/lib/birimler';
import type { Ceviri } from '@/lib/i18n';
import { jsonOku, raporDosyasiHazirla } from '@/lib/dosya';
import { adimGorseli } from '@/lib/bitkiGorsel';
import { ulkeBirimi, ulkeBul, type Ulke } from '@/lib/bolgeler';
import { UlkeSecenekleri, useIlSecenekleri } from '@/components/UlkeSecimi';
import { konumGoster } from '@/lib/dunya';
import { AlertTriangle, ArrowLeft, ArrowRight, Camera, ChevronRight, FileSpreadsheet, Loader2, Upload, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChoiceGrid, MethodCard, Panel, Row, Warning } from '@/components/ui';
import { parseLabWorkbook } from '@/lib/excelRapor';
import { ZKART_BITKILERI } from '@/lib/bitki';
import {
  BUNYE_SINIFLARI,
  MANUAL_STEPS,
  PARAMS,
  formatNumber,
  parseNumber,
  sanityWarning,
  textureSumWarning,
  type EkDeger,
  type ParamKey,
  type SoilReport,
} from '@/lib/toprak';

type Method = 'dosya' | 'foto' | 'manuel';
type Ekran = 'yontem' | 'manuel' | 'kontrol';
type Meta = { ilce: string; bitki: string; numuneAdi: string; bunyeSinifi: string; raporNo: string };
type Draft = Record<ParamKey, string>;
type Missing = Record<ParamKey, boolean>;
const PARAM_KEYS = Object.keys(PARAMS) as ParamKey[];
const emptyDraft = () => Object.fromEntries(PARAM_KEYS.map((k) => [k, ''])) as Draft;
const emptyMissing = () => Object.fromEntries(PARAM_KEYS.map((k) => [k, false])) as Missing;
const emptyMeta = (): Meta => ({ ilce: '', bitki: '', numuneAdi: '', bunyeSinifi: '', raporNo: '' });
// Z-kartı olan bitkiler önce; listede olmayan bitki elle yazılabilir
/** Bünye sınıfı ekranda: Almancada Alman Bodenart adı, Türkçede kendisi */
const bodenartAdi = (kod: string | undefined, tx: Ceviri) =>
  !kod ? '' : tx.dil === 'de' ? DE_BODENARTEN.find((b) => b.kod === kod)?.ad ?? tx(kod) : kod;

export const COMMON_CROPS = [...ZKART_BITKILERI, 'Bilmiyorum'];

export type SihirbazTarla = { ad: string; ilce?: string | null; bitki?: string | null };

export function Sihirbaz({
  tarla,
  onKaydet,
  kaydediliyor,
  hata,
}: {
  tarla?: SihirbazTarla;
  onKaydet: (report: SoilReport, kaynak: 'dosya' | 'manuel') => void;
  kaydediliyor?: boolean;
  hata?: string | null;
}) {
  const tx = useTx();
  // Tarla içinden açıldıysa ilçe/bitki sorulmaz (elle girişte 0. adım atlanır)
  const ilkAdim = tarla ? 1 : 0;
  const [ekran, setEkran] = useState<Ekran>('yontem');
  const [method, setMethod] = useState<Method | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<SoilReport[]>([]);

  const [step, setStep] = useState(ilkAdim);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [missing, setMissing] = useState<Missing>(emptyMissing);
  const [meta, setMeta] = useState<Meta>(() => ({ ...emptyMeta(), ilce: tarla?.ilce ?? '', bitki: tarla?.bitki ?? '', numuneAdi: tarla?.ad ?? '' }));
  const [labEval, setLabEval] = useState<SoilReport['labDegerlendirme']>({});
  const [ekDegerler, setEkDegerler] = useState<EkDeger[]>([]);
  const [source, setSource] = useState<'manuel' | 'dosya'>('manuel');

  const go = (s: Ekran) => {
    setEkran(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildReport = (): SoilReport => {
    const values: SoilReport['values'] = {};
    PARAM_KEYS.forEach((k) => {
      if (missing[k]) return;
      const n = parseNumber(draft[k]);
      // Almancada pH (CaCl₂) ve P/K (mg/100 g, CAL) girilir; içeride Türk birimine çevrilir
      if (n !== undefined) values[k] = +icDeger(k, n, tx.dil).toFixed(4);
    });
    return {
      raporNo: meta.raporNo || undefined,
      // Tarla bilgisi her zaman rapordakinden önce gelir
      ilce: tarla?.ilce || meta.ilce || undefined,
      bitki: tarla?.bitki || (meta.bitki && meta.bitki !== 'Bilmiyorum' ? meta.bitki : undefined),
      numuneAdi: tarla?.ad || meta.numuneAdi || undefined,
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
      const v = parseNumber(r.values?.[k]);
      if (v === undefined) m[k] = true;
      else d[k] = tx(formatNumber(degerGoster(k, v, tx.dil), 4));
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
    go('kontrol');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      let reports: SoilReport[] = [];
      if (/\.(xlsx|xls)$/i.test(file.name)) {
        reports = parseLabWorkbook(await file.arrayBuffer()); // Excel tarayıcıda okunur
      } else {
        const fd = new FormData();
        fd.append('file', await raporDosyasiHazirla(file));
        const res = await fetch('/api/rapor-oku', { method: 'POST', body: fd });
        const json = await jsonOku<{ error?: string; reports: SoilReport[] }>(res);
        if (!res.ok) throw new Error(json.error);
        reports = json.reports;
      }
      if (!reports.length) throw new Error('Dosyada toprak analiz değeri bulunamadı. Değerleri elle girebilirsiniz.');
      if (reports.length === 1) loadReport(reports[0]);
      else setCandidates(reports);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : tx("Dosya okunamadı."));
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
      setStep(ilkAdim);
      go('manuel');
    } else {
      setPickerOpen(true);
    }
  };

  return (
    <>
      {ekran === 'yontem' && <MethodScreen method={method} onSelect={chooseMethod} />}

      {ekran === 'manuel' && (
        <ManualScreen
          step={step}
          ilkAdim={ilkAdim}
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
          onBack={() => (step === ilkAdim ? go('yontem') : setStep((s) => s - 1))}
          onNext={() => (step === MANUAL_STEPS.length ? go('kontrol') : setStep((s) => s + 1))}
        />
      )}

      {ekran === 'kontrol' && (
        <ReviewScreen
          report={buildReport()}
          source={source}
          kaydediliyor={kaydediliyor}
          hata={hata}
          onEdit={() => {
            setStep(ilkAdim);
            go('manuel');
          }}
          onConfirm={() => onKaydet(buildReport(), source)}
        />
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
    </>
  );
}

function MethodScreen({ method, onSelect }: { method: Method | null; onSelect: (m: Method) => void }) {
  const tx = useTx();
  return (
    <div className="animate-[fadeIn_.4s_ease-out]">
      <div className="relative overflow-hidden rounded-[32px] bg-[#121410] px-6 py-12 text-center text-white sm:px-10 sm:py-16">
        <div className="absolute inset-0 bg-[url('/toprak.jpg')] bg-cover bg-center opacity-80" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-[#121410]/80 via-[#121410]/50 to-[#121410]/90" aria-hidden />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e2b65c]">{tx("Yeni analiz")}</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] sm:text-6xl">{tx("Raporunuz elinizde mi?")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            
            {tx("En hızlısı laboratuvarın gönderdiği dosyayı yüklemek. Dosyanız yoksa kâğıt raporun fotoğrafını çekebilir ya da değerleri tek tek girebilirsiniz.")}
          </p>
        </div>
      </div>

      <div className="relative z-10 -mt-8 grid gap-4 px-2 sm:px-6 md:grid-cols-3">
        <MethodCard
          icon={<FileSpreadsheet size={30} />}
          title={tx("Dosya yükle")}
          description={tx("Excel (.xlsx) veya PDF rapor")}
          detail={tx("Excel dosyası cihazınızda okunur, hiçbir yere gönderilmez.")}
          selected={method === 'dosya'}
          onClick={() => onSelect('dosya')}
        />
        <MethodCard
          icon={<Camera size={30} />}
          title={tx("Fotoğraf çek")}
          description={tx("Kâğıt raporun fotoğrafı")}
          detail={tx("Raporu düz bir yüzeye koyup tamamı görünecek şekilde çekin.")}
          selected={method === 'foto'}
          onClick={() => onSelect('foto')}
        />
        <MethodCard
          icon={<UserRound size={30} />}
          title={tx("Elle gireceğim")}
          description={tx("Değerleri raporunuzdan bakarak yazın")}
          detail={tx("Raporunuzda olmayan değerleri atlayabilirsiniz.")}
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
  const tx = useTx();
  const inputRef = useRef<HTMLInputElement>(null);
  const isPhoto = method === 'foto';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09271f]/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[30px] bg-white p-7 shadow-2xl sm:p-9">
        <button onClick={onClose} aria-label={tx("Kapat")} className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X size={20} />
        </button>

        {candidates.length > 0 ? (
          <>
            <h2 className="text-2xl font-extrabold">{tx("Dosyada")}{' '}{candidates.length}{' '}{tx("rapor var")}</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">{tx("Hangi tarlanın raporunu yorumlayalım?")}</p>
            <div className="mt-6 space-y-3">
              {candidates.map((r, i) => (
                <button
                  key={tx(r.raporNo) ?? i}
                  onClick={() => onPick(r)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#dfe9df] bg-[#f9fbf9] px-4 py-4 text-left transition hover:border-[#38a66d] hover:bg-[#eefaf0]"
                >
                  <span>
                    <span className="block font-bold">{tx(r.numuneAdi) ?? `Rapor ${i + 1}`}</span>
                    <span className="mt-0.5 block text-xs text-[#718078]">
                      {tx([r.raporNo, r.bitki, konumGoster(r.ilce, tx.dil)].filter(Boolean).join(" / "))}
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
            <h2 className="mt-6 text-2xl font-extrabold">{isPhoto ? tx("Raporun fotoğrafını seçin") : tx("Rapor dosyanızı seçin")}</h2>
            <p className="mt-2 text-sm leading-6 text-[#718078]">
              {isPhoto
                ? tx("Tüm tablo görünür ve yazılar okunaklı olmalı. Okunan değerleri bir sonraki adımda kontrol edeceksiniz.")
                : tx("Laboratuvarın gönderdiği Excel (.xlsx) veya PDF dosyası.")}
            </p>

            <button
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="mt-7 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b9d9ae] bg-[#f7fbf5] px-6 py-10 text-center transition hover:border-[#238f61] disabled:cursor-wait"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin text-[#238f61]" size={32} />
                  <div className="mt-4 font-bold">{tx("Rapor okunuyor…")}</div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    {isPhoto ? <Camera className="text-[#238f61]" /> : <FileSpreadsheet className="text-[#238f61]" />}
                  </div>
                  <div className="mt-4 font-bold">{tx("Dosya seçmek için dokunun")}</div>
                  <div className="mt-1 text-xs text-[#819087]">{isPhoto ? tx("JPG, PNG veya WEBP") : tx("XLSX veya PDF, en fazla 10 MB")}</div>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex gap-2 rounded-2xl bg-[#fff4e5] p-4 text-sm text-[#7a4b00]">
                <AlertTriangle size={18} className="shrink-0" />
                <span>
                  {tx(error)}{' '}
                  <button onClick={onManual} className="font-bold underline">
                    
                    {tx("Elle gir")}
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

function ManualScreen({
  step,
  ilkAdim,
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
  ilkAdim: number;
  draft: Draft;
  missing: Missing;
  meta: Meta;
  onMeta: (k: keyof Meta, v: string) => void;
  onDraft: (k: ParamKey, v: string) => void;
  onToggleMissing: (k: ParamKey) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const tx = useTx();
  const [ulke, setUlke] = useState<Ulke>(ulkeBul(meta.ilce, tx.dil));
  const ilSec = useIlSecenekleri(ulke, meta.ilce);
  const total = MANUAL_STEPS.length + 1 - ilkAdim;
  const section = step === 0 ? null : MANUAL_STEPS[step - 1];
  const textureWarn =
    section?.fields.includes('kil') &&
    textureSumWarning({ kum: parseNumber(draft.kum), silt: parseNumber(draft.silt), kil: parseNumber(draft.kil) });

  // Yeni adımda sayfanın başına dön (uzun formlarda alt kısımda kalmasın)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Her adımda bitki biraz daha büyür: ilk adım tohum, son adım başak
  const ilerleme = (step + 1 - ilkAdim) / total;
  const gorsel = adimGorseli(meta.bitki, ilerleme);

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_70px_-30px_rgba(18,20,16,.45)]">
      <div className="relative h-56 overflow-hidden bg-[#121410] sm:h-64">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gorsel} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121410] via-[#121410]/40 to-[#121410]/10" />
        <div className="relative flex h-full flex-col justify-between p-5 text-white sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
              <ArrowLeft size={16} />
              
              {tx("Geri")}
            </button>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              
              {tx("Adım")}{' '}{step + 1 - ilkAdim} / {total}
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-[-0.01em] sm:text-4xl">{section ? tx(section.title) : tx("Tarlanız hakkında")}</h2>
            <p className="mt-2 max-w-lg text-sm text-white/75 sm:text-base">
              {section ? tx(section.description) : tx("Bu bilgiler önerileri size özel hale getirir.")}
            </p>
            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step + 1 - ilkAdim ? 'bg-[#e2b65c]' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-8">

      <div className="space-y-5">
        {step === 0 ? (
          <>
            <Panel
              title={tx(ulkeBirimi(ulke))}
              helper={tx("Toprağın alındığı yer.")}
            >
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
                <select
                  aria-label={tx("Ülke")}
                  value={ulke}
                  onChange={(e) => {
                    setUlke(e.target.value as Ulke);
                    onMeta('ilce', '');
                  }}
                  className="w-full rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#38a66d]"
                >
                  <UlkeSecenekleri secili={ulke} />
                </select>
                <select
                  value={meta.ilce}
                  onChange={(e) => onMeta('ilce', e.target.value)}
                  className="w-full rounded-2xl border border-[#dfe9df] bg-white px-4 py-3 text-lg font-semibold outline-none focus:border-[#38a66d]"
                >
                  <option value="">{ilSec.yukleniyor ? tx("Yükleniyor…") : tx("Seçin")}</option>
                  {ilSec.secenekler.map((i) => (
                    <option key={i.deger} value={i.deger}>{i.ad}</option>
                  ))}
                </select>
              </div>
            </Panel>
            <Panel title={tx("Ne ekmeyi planlıyorsunuz?")} helper={tx("Raporda \"Ekimi Planlanan Bitki\" olarak geçer.")}>
              <ChoiceGrid options={COMMON_CROPS} value={meta.bitki} onChange={(v) => onMeta('bitki', v)} />
              <input
                value={COMMON_CROPS.includes(meta.bitki) ? '' : tx(meta.bitki)}
                onChange={(e) => onMeta('bitki', e.target.value)}
                placeholder={tx("Listede yoksa yazın")}
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
              <Panel title={tx("Bünye sınıfı")} helper={tx("Raporda kum oranının yanında yazan sınıf (ör. \"CL (Killi Tın Bünyeli)\").")}>
                <ChoiceGrid
                  options={tx.dil === 'de' ? DE_BODENARTEN.map((b) => b.kod) : BUNYE_SINIFLARI.map((b) => `${b.code} (${b.label})`)}
                  etiket={(o) => bodenartAdi(o, tx)}
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
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d2a22] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#2f7a4f]"
      >
        {step === MANUAL_STEPS.length ? tx("Değerleri kontrol et") : tx("Sonraki")}
        <ArrowRight size={18} />
      </button>
      </div>
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
  const tx = useTx();
  const def = PARAMS[k];
  const donusum = birimDonusumu(k, tx.dil);
  const n = parseNumber(value);
  const invalid = value.trim() !== '' && n === undefined;
  const warn = n !== undefined ? sanityWarning(k, n) : undefined;
  const id = `f-${k}`;

  return (
    <div className="rounded-[28px] border border-[#e1ebdf] bg-[#f9fbf9] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-lg font-bold">
            {tx(etiketGoster(k, tx.dil))}
          </label>
          <div className="mt-1 text-xs leading-5 text-[#75867a]">
            
            {tx("Raporda:")}{' '}<span className="font-semibold">{donusum ? donusum.etiket : tx(def.reportLabel)}</span>. {donusum ? donusum.aciklama : tx(def.helper)}
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#d8e8d6] bg-white px-3 py-2 text-xs font-semibold text-[#476456]">
          <input type="checkbox" checked={missing} onChange={onToggleMissing} className="h-4 w-4 accent-[#238f61]" />
          
          {tx("Raporumda yok")}
        </label>
      </div>

      <div className={`mt-4 flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm ${invalid ? 'border-[#e0a100]' : 'border-[#dfe9df]'} focus-within:border-[#38a66d]`}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={donusum ? donusum.ornek : tx(def.placeholder)}
          disabled={missing}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-none bg-transparent text-lg font-bold outline-none placeholder:text-[#b3bdb7] disabled:opacity-50"
        />
        {birimGoster(k, tx.dil) && <span className="whitespace-nowrap rounded-full bg-[#edf7ed] px-3 py-1 text-sm font-bold text-[#238f61]">{tx(birimGoster(k, tx.dil))}</span>}
      </div>
      {invalid && <Warning text={tx("Lütfen yalnızca sayı girin (ör. 7,12).")} />}
      {warn && <Warning text={warn} />}
    </div>
  );
}

function ReviewScreen({
  report,
  source,
  kaydediliyor,
  hata,
  onEdit,
  onConfirm,
}: {
  report: SoilReport;
  source: 'manuel' | 'dosya';
  kaydediliyor?: boolean;
  hata?: string | null;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const tx = useTx();
  const count = Object.keys(report.values).length + (report.ekDegerler?.length ?? 0);

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-[#dfe9df] bg-white p-6 shadow-[0_18px_50px_rgba(19,53,41,.08)] sm:p-8">
      <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{tx("Değerler raporunuzla aynı mı?")}</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-[#64766c]">
        {source === 'dosya'
          ? tx("Dosyanızdan okuduğumuz değerler aşağıda. Raporunuzla karşılaştırın; farklı olan varsa düzeltin.")
          : tx("Girdiğiniz değerleri son kez kontrol edin.")}
      </p>

      <dl className="mt-8 divide-y divide-[#edf2ee] rounded-[24px] border border-[#dfe9df] bg-[#f8fbf7] px-5">
        <Row label={tx("Rapor / numune")} value={tx([report.raporNo, report.numuneAdi].filter(Boolean).join(' – ')) || tx("Belirtilmedi")} />
        <Row label={tx("Konum")} value={tx(konumGoster(report.ilce, tx.dil)) || tx("Belirtilmedi")} />
        <Row label={tx("Planlanan bitki")} value={tx(report.bitki) || tx("Belirtilmedi")} />
        {(Object.keys(PARAMS) as ParamKey[])
          .filter((k) => !PARAMS[k].ek || report.values[k] !== undefined)
          .map((k) => (
          <Row
            key={k}
            label={tx(etiketGoster(k, tx.dil))}
            value={report.values[k] !== undefined ? `${tx(formatNumber(degerGoster(k, report.values[k]!, tx.dil), 4))} ${tx(birimGoster(k, tx.dil))}`.trim() : tx("Belirtilmedi")}
            muted={report.values[k] === undefined}
          />
        ))}
        <Row label={tx("Bünye sınıfı")} value={bodenartAdi(report.bunyeSinifi, tx) || tx("Belirtilmedi")} muted={!report.bunyeSinifi} />
        {(report.ekDegerler ?? []).map((e, i) => (
          <Row key={`ek-${i}`} label={tx(e.ad)} value={tx(`${formatNumber(e.deger, 4)} ${e.birim ?? ''}`.trim())} />
        ))}
      </dl>
      {(report.ekDegerler?.length ?? 0) > 0 && (
        <p className="mt-3 text-xs leading-5 text-[#75867a]">
          
          {tx("Son")}{' '}{report.ekDegerler!.length}{' '}{tx("satır raporunuzdaki ek ölçümlerdir; tabloda “Diğer ölçümler” başlığında gösterilir.")}
        </p>
      )}

      {count === 0 && <Warning text={tx("Yorum için en az bir değer girmelisiniz.")} />}
      {hata && <Warning text={hata} />}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={onEdit} className="rounded-full border border-[#dfe9df] bg-[#f4faf3] px-6 py-4 font-semibold text-[#476456] hover:bg-[#edf6eb]">
          
          {tx("Değerleri düzelt")}
        </button>
        <button
          disabled={count === 0 || kaydediliyor}
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#74cc3c] to-[#20a875] px-6 py-4 text-lg font-extrabold text-white shadow-[0_18px_45px_rgba(32,168,117,0.28)] transition hover:-translate-y-1 disabled:opacity-50"
        >
          {kaydediliyor ? (
            <>
              <Loader2 className="animate-spin" size={20} />{' '}{tx("Kaydediliyor…")}
            </>
          ) : (
            <>
              
              {tx("Doğru, kaydet ve yorumla")}
              <ChevronRight size={22} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

