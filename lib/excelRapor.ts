/**
 * İBB Çevre Laboratuvarı "Toprak Analiz Raporu" Excel dosyasını okur.
 * Bir sayfada birden fazla rapor (T26-286, T26-287 ...) olabilir; hepsini döndürür.
 * Tarayıcıda çalışır, dosya sunucuya gönderilmez (KVKK açısından avantaj).
 */
import * as XLSX from 'xlsx';
import { ilBul } from './bolgeler';
import { ISTANBUL_ILCELERI, parseNumber, unitCompatible, type ParamKey, type SoilReport } from './toprak';

type Row = (string | number)[];

/** Satırdaki boş olmayan hücreleri sırayla verir. */
function compact(row: unknown[]): Row {
  return row
    .filter((c) => c !== null && c !== undefined && String(c).trim() !== '')
    .map((c) => (typeof c === 'number' ? c : String(c).replace(/\s+/g, ' ').trim()));
}

const norm = (s: unknown) =>
  String(s ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[*:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Excel seri tarihi (46286) -> "21.09.2026" */
function excelDate(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (typeof v === 'number' && v > 30000 && v < 80000) {
    const d = XLSX.SSF.parse_date_code(v);
    return `${String(d.d).padStart(2, '0')}.${String(d.m).padStart(2, '0')}.${d.y}`;
  }
  return String(v);
}

function findIlce(text?: string): string | undefined {
  if (!text) return undefined;
  const t = text.toLocaleLowerCase('tr-TR');
  const ist = ISTANBUL_ILCELERI.find((i) => t.includes(i.toLocaleLowerCase('tr-TR')));
  return ist ? `${ist}, İstanbul` : ilBul(text);
}

/** Rapordaki parametre satır etiketi -> bizim anahtar (sıra önemli) */
const PARAM_MATCHERS: [RegExp, ParamKey][] = [
  [/^su ile doygunluk|^saturasyon/, 'doygunluk'],
  [/^ph\b/, 'ph'],
  [/^ec\b|elektriksel iletkenlik/, 'ec'],
  [/^(toplam )?tuz\b/, 'tuz'],
  [/kireç|caco3/, 'kirec'],
  [/organik madde/, 'organikMadde'],
  [/fosfor|p2o5/, 'fosfor'],
  [/potasyum|k2o/, 'potasyum'],
  [/azot/, 'azot'],
  [/demir|\(fe\)/, 'demir'],
  [/çinko|\(zn\)/, 'cinko'],
  [/mangan|\(mn\)/, 'mangan'],
  [/bakır|\(cu\)/, 'bakir'],
  [/^bor\b|\(b\)/, 'bor'],
];

const META_MATCHERS: [RegExp, keyof SoilReport][] = [
  [/^adres/, 'adres'],
  [/^numunenin alındığı tarih/, 'numuneTarihi'],
  [/^ekimi planlanan bitki/, 'bitki'],
  [/^numune bilgisi/, 'numuneAdi'],
];

/** Hücre tek başına bir sayı mı? ("P2O5 kg/da" gibi birimleri sayı sanmamak için) */
const isNumberCell = (c: string | number) =>
  typeof c === 'number' || /^[<>~≈]?\s*-?\d+([.,]\d+)?\s*$/.test(String(c).trim());

/** Analiz metodu hücresi mi? (TS 8333:1990, İşletme İçi Metot, Bouyoucos ...) */
const isMethodCell = (c: string) =>
  /^(ts|tse|işletme|bouyoucos|iso|en |epa|din|metot|yöntem|lab)/i.test(c.trim()) || /\d{3,}:\d{4}/.test(c);

/** [etiket, birim?, sonuç, değerlendirme?, metot?] satırını parçalar. */
function splitRow(row: (string | number)[]) {
  const idx = row.findIndex((c, i) => i > 0 && isNumberCell(c));
  if (idx < 0) return null;
  const value = parseNumber(row[idx]);
  if (value === undefined) return null;
  const unit = row
    .slice(1, idx)
    .map(String)
    .map((u) => u.trim())
    .filter((u) => u && u !== '-')
    .join(' ') || undefined;
  const after = row[idx + 1];
  const evaluation = typeof after === 'string' && !isMethodCell(after) && after.length <= 40 ? after.trim() : undefined;
  return { value, unit, evaluation };
}

export function parseLabRows(rows: unknown[][]): SoilReport[] {
  const reports: SoilReport[] = [];
  let current: SoilReport | null = null;
  let pendingNo: string | undefined;
  let inTable = false;

  for (const raw of rows) {
    const row = compact(raw);
    if (row.length === 0) continue;

    // Rapor numarası (T26-286) başlıktan hemen önce gelir
    const noCell = row.find((c) => typeof c === 'string' && /^[A-ZÇĞİÖŞÜ]{1,3}\d{0,2}-\d{2}-?\d+$|^T\d{2}-\d+$/.test(c));
    if (noCell) pendingNo = String(noCell);

    if (row.some((c) => norm(c) === 'toprak analiz raporu')) {
      current = { raporNo: pendingNo, values: {}, labDegerlendirme: {}, ekDegerler: [] };
      reports.push(current);
      pendingNo = undefined;
      inTable = false;
      continue;
    }
    if (!current) continue;

    const first = norm(row[0]);

    if (first.startsWith('rapor tarihi')) {
      current.raporTarihi = excelDate(row[row.length - 1]);
      continue;
    }

    const meta = META_MATCHERS.find(([re]) => re.test(first));
    if (meta && row.length > 1) {
      const v = row[1];
      const val = meta[1] === 'numuneTarihi' ? excelDate(v) : String(v).trim();
      if (val && val !== '-') (current as Record<string, unknown>)[meta[1]] = val;
      if (meta[1] === 'adres') current.ilce = findIlce(String(v));
      continue;
    }

    // Sonuç tablosunun başı ve sonu
    if (first === 'parametre') {
      inTable = true;
      continue;
    }
    if (first.startsWith('tüm analizler') || first.startsWith('açıklama')) {
      inTable = false;
      continue;
    }

    // Bünye bloğu: "Bünye | Kum Oranı | % | 44.56 | L (Tın Bünyeli) | metod"
    if (first === 'bünye') {
      current.values.kum = parseNumber(row[3] as string | number);
      if (row[4] !== undefined) current.bunyeSinifi = String(row[4]);
      if (row[4] !== undefined) current.labDegerlendirme.bunye = String(row[4]);
      continue;
    }
    if (first.startsWith('kum oranı')) {
      current.values.kum = splitRow(row)?.value;
      continue;
    }
    if (first.startsWith('silt oranı')) {
      current.values.silt = splitRow(row)?.value;
      continue;
    }
    if (first.startsWith('kil oranı')) {
      current.values.kil = splitRow(row)?.value;
      continue;
    }

    const param = PARAM_MATCHERS.find(([re]) => re.test(first));
    const parts = param || inTable ? splitRow(row) : null;
    if (!parts) continue;

    if (param && current.values[param[1]] === undefined && unitCompatible(param[1], parts.unit)) {
      current.values[param[1]] = parts.value;
      if (parts.evaluation) current.labDegerlendirme[param[1]] = parts.evaluation;
    } else if (inTable || param) {
      // Tanımadığımız (ya da birimi farklı) ölçüm: kaybetme, "diğer ölçümler" olarak al
      current.ekDegerler!.push({
        ad: String(row[0]).replace(/[*]/g, '').trim(),
        deger: parts.value,
        birim: parts.unit,
        labDegerlendirme: parts.evaluation,
      });
    }
  }

  return reports.filter((r) => Object.keys(r.values).length > 0 || (r.ekDegerler?.length ?? 0) > 0);
}

export function parseLabWorkbook(data: ArrayBuffer): SoilReport[] {
  const wb = XLSX.read(data, { type: 'array' });
  return wb.SheetNames.flatMap((name) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: true, defval: null });
    return parseLabRows(rows);
  });
}
