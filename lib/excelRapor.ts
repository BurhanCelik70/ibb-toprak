/**
 * İBB Çevre Laboratuvarı "Toprak Analiz Raporu" Excel dosyasını okur.
 * Bir sayfada birden fazla rapor (T26-286, T26-287 ...) olabilir; hepsini döndürür.
 * Tarayıcıda çalışır, dosya sunucuya gönderilmez (KVKK açısından avantaj).
 */
import * as XLSX from 'xlsx';
import { ISTANBUL_ILCELERI, parseNumber, type ParamKey, type SoilReport } from './toprak';

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
  return ISTANBUL_ILCELERI.find((i) => t.includes(i.toLocaleLowerCase('tr-TR')));
}

/** Rapordaki parametre satır etiketi -> bizim anahtar */
const PARAM_MATCHERS: [RegExp, ParamKey][] = [
  [/^su ile doygunluk/, 'doygunluk'],
  [/^ph\b/, 'ph'],
  [/^ec\b/, 'ec'],
  [/^tuz$/, 'tuz'],
  [/^kireç/, 'kirec'],
  [/^organik madde/, 'organikMadde'],
  [/^yarayışlı fosfor/, 'fosfor'],
  [/^yarayışlı potasyum/, 'potasyum'],
];

const META_MATCHERS: [RegExp, keyof SoilReport][] = [
  [/^adres/, 'adres'],
  [/^numunenin alındığı tarih/, 'numuneTarihi'],
  [/^ekimi planlanan bitki/, 'bitki'],
  [/^numune bilgisi/, 'numuneAdi'],
];

export function parseLabRows(rows: unknown[][]): SoilReport[] {
  const reports: SoilReport[] = [];
  let current: SoilReport | null = null;
  let pendingNo: string | undefined;

  for (const raw of rows) {
    const row = compact(raw);
    if (row.length === 0) continue;

    // Rapor numarası (T26-286) başlıktan hemen önce gelir
    const noCell = row.find((c) => typeof c === 'string' && /^T\d{2}-\d+$/.test(c));
    if (noCell) pendingNo = String(noCell);

    if (row.some((c) => norm(c) === 'toprak analiz raporu')) {
      current = { raporNo: pendingNo, values: {}, labDegerlendirme: {} };
      reports.push(current);
      pendingNo = undefined;
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

    // Bünye bloğu: "Bünye | Kum Oranı | % | 44.56 | L (Tın Bünyeli) | metod"
    if (first === 'bünye') {
      current.values.kum = parseNumber(row[3] as string | number);
      if (row[4] !== undefined) current.bunyeSinifi = String(row[4]);
      if (row[4] !== undefined) current.labDegerlendirme.bunye = String(row[4]);
      continue;
    }
    if (first === 'silt oranı') {
      current.values.silt = parseNumber(row[2] as string | number);
      continue;
    }
    if (first === 'kil oranı') {
      current.values.kil = parseNumber(row[2] as string | number);
      continue;
    }

    const param = PARAM_MATCHERS.find(([re]) => re.test(first));
    if (param) {
      // [etiket, birim, sonuç, değerlendirme?, metod]
      const value = parseNumber(row[2] as string | number);
      if (value !== undefined) current.values[param[1]] = value;
      const evalCell = row[3];
      // Değerlendirme yoksa 4. hücre doğrudan metot olur (ör. "TS 8334:1990")
      if (typeof evalCell === 'string' && !/^(ts|işletme|bouyoucos)/i.test(evalCell)) {
        current.labDegerlendirme[param[1]] = evalCell;
      }
    }
  }

  return reports.filter((r) => Object.keys(r.values).length > 0);
}

export function parseLabWorkbook(data: ArrayBuffer): SoilReport[] {
  const wb = XLSX.read(data, { type: 'array' });
  return wb.SheetNames.flatMap((name) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: true, defval: null });
    return parseLabRows(rows);
  });
}
