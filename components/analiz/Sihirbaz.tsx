'use client';
/**
 * Rapor yükleme sihirbazı: yöntem seçimi → dosya / fotoğraf / elle giriş → kontrol.
 * Kontrol ekranında "Kaydet ve yorumla" denince onKaydet(report, kaynak) çağrılır.
 */
import { AlertTriangle, ArrowLeft, ArrowRight, Camera, ChevronRight, FileSpreadsheet, Loader2, Upload, UserRound, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ChoiceGrid, MethodCard, Panel, Row, Warning } from '@/components/ui';
import { parseLabWorkbook } from '@/lib/excelRapor';
import { ZKART_BITKILERI } from '@/lib/igsas';
import {
  BUNYE_SINIFLARI,
  ISTANBUL_ILCELERI,
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
      if (n !== undefined) values[k] = n;
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
  const total = MANUAL_STEPS.length + 1 - ilkAdim;
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
          Adım {step + 1 - ilkAdim} / {total}
        </div>
      </div>
      <div className="mb-8 h-2.5 overflow-hidden rounded-full bg-[#dfe9df]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#5fc33c] to-[#249b70] transition-all" style={{ width: `${((step + 1 - ilkAdim) / total) * 100}%` }} />
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
        {step === MANUAL_STEPS.length ? 'Değerleri kontrol et' : 'Sonraki'}
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
      {hata && <Warning text={hata} />}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={onEdit} className="rounded-full border border-[#dfe9df] bg-[#f4faf3] px-6 py-4 font-semibold text-[#476456] hover:bg-[#edf6eb]">
          Değerleri düzelt
        </button>
        <button
          disabled={count === 0 || kaydediliyor}
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#74cc3c] to-[#20a875] px-6 py-4 text-lg font-extrabold text-white shadow-[0_18px_45px_rgba(32,168,117,0.28)] transition hover:-translate-y-1 disabled:opacity-50"
        >
          {kaydediliyor ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Kaydediliyor…
            </>
          ) : (
            <>
              Doğru, kaydet ve yorumla
              <ChevronRight size={22} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

