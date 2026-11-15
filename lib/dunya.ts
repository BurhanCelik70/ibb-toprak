/**
 * Dünya ülkeleri (Türkiye, Almanya, İspanya dışındakiler).
 * Ülke veritabanında ayrı tutulmaz: dünya tarlasının ili "Bölge (ISO)" biçiminde saklanır, ör. "Ganja (AZ)".
 * Bölge koordinatları sunucuda (lib/dunyaVeri.ts), iklim NASA POWER'dan (lib/dunyaIklim.ts) gelir.
 */
import { DILLER, type Dil } from './dil';
import { IL_IKLIM, type IlIklimi } from './iklim';
import { IL_PAR } from './par';

/** ISO kodu → atlasın bölgesi (TR, EU, MED, ME, IQ, RU, UA, AFR, IN, CN, APAC, AUS, MX, BR, LATAM, TH) */
export const DUNYA_ATLAS: Record<string, string> = {"AD":"EU","AE":"ME","AF":"ME","AG":"LATAM","AL":"MED","AM":"ME","AO":"AFR","AR":"LATAM","AT":"EU","AU":"AUS","AZ":"ME","BA":"EU","BB":"LATAM","BD":"IN","BE":"EU","BF":"AFR","BG":"EU","BH":"ME","BI":"AFR","BJ":"AFR","BM":"EU","BN":"APAC","BO":"LATAM","BR":"BR","BS":"LATAM","BT":"IN","BW":"AFR","BY":"RU","BZ":"LATAM","CA":"EU","CD":"AFR","CF":"AFR","CG":"AFR","CH":"EU","CI":"AFR","CL":"LATAM","CM":"AFR","CN":"CN","CO":"LATAM","CR":"LATAM","CU":"LATAM","CV":"AFR","CY":"MED","CZ":"EU","DJ":"AFR","DK":"EU","DM":"LATAM","DO":"LATAM","DZ":"MED","EC":"LATAM","EE":"EU","EG":"MED","ER":"AFR","ET":"AFR","FI":"EU","FJ":"APAC","FM":"APAC","FR":"EU","GA":"AFR","GB":"EU","GD":"LATAM","GE":"ME","GH":"AFR","GM":"AFR","GN":"AFR","GQ":"AFR","GR":"MED","GT":"LATAM","GW":"AFR","GY":"LATAM","HK":"CN","HN":"LATAM","HR":"MED","HT":"LATAM","HU":"EU","ID":"APAC","IE":"EU","IL":"ME","IN":"IN","IQ":"IQ","IR":"ME","IS":"EU","IT":"MED","JM":"LATAM","JO":"ME","JP":"APAC","KE":"AFR","KG":"ME","KH":"APAC","KI":"APAC","KM":"AFR","KN":"LATAM","KP":"CN","KR":"APAC","KW":"ME","KZ":"RU","LA":"APAC","LB":"ME","LC":"LATAM","LI":"EU","LK":"IN","LR":"AFR","LS":"AFR","LT":"EU","LU":"EU","LV":"EU","LY":"MED","MA":"MED","MC":"EU","MD":"UA","ME":"MED","MG":"AFR","MH":"APAC","MK":"EU","ML":"AFR","MM":"APAC","MN":"CN","MR":"AFR","MT":"MED","MU":"AFR","MV":"IN","MW":"AFR","MX":"MX","MY":"APAC","MZ":"AFR","NA":"AFR","NE":"AFR","NG":"AFR","NI":"LATAM","NL":"EU","NO":"EU","NP":"IN","NR":"APAC","NZ":"AUS","OM":"ME","PA":"LATAM","PE":"LATAM","PG":"APAC","PH":"APAC","PK":"IN","PL":"EU","PS":"ME","PT":"MED","PW":"APAC","PY":"LATAM","QA":"ME","RO":"EU","RS":"EU","RU":"RU","RW":"AFR","SA":"ME","SB":"APAC","SC":"AFR","SD":"AFR","SE":"EU","SG":"APAC","SI":"EU","SK":"EU","SL":"AFR","SM":"EU","SN":"AFR","SO":"AFR","SR":"LATAM","SS":"AFR","ST":"AFR","SV":"LATAM","SY":"ME","SZ":"AFR","TD":"AFR","TG":"AFR","TH":"TH","TJ":"ME","TL":"APAC","TM":"ME","TN":"MED","TO":"APAC","TT":"LATAM","TV":"APAC","TW":"APAC","TZ":"AFR","UA":"UA","UG":"AFR","US":"EU","UY":"LATAM","UZ":"ME","VC":"LATAM","VE":"LATAM","VN":"APAC","VU":"APAC","WS":"APAC","XK":"EU","YE":"ME","ZA":"AFR","ZM":"AFR","ZW":"AFR"};

export const DUNYA_ULKELERI = Object.keys(DUNYA_ATLAS);

const DUNYA_IL = /^([^,()]+) \(([A-Z]{2})\)$/;

/** "Ganja (AZ)" → { bolge: 'Ganja', ulke: 'AZ' } */
export function dunyaIli(il?: string | null): { bolge: string; ulke: string } | undefined {
  const m = il ? DUNYA_IL.exec(il) : null;
  return m && DUNYA_ATLAS[m[2]] ? { bolge: m[1], ulke: m[2] } : undefined;
}

/** Serbest metnin sonunda dünya ili: "Merkez, Ganja (AZ)" → "Ganja (AZ)" */
export function dunyaIlBul(metin?: string | null): string | undefined {
  const m = metin ? /(?:^|,)\s*([^,()]+? \([A-Z]{2}\))\s*$/.exec(metin) : null;
  return m && dunyaIli(m[1]) ? m[1] : undefined;
}

export const dunyaIlYap = (bolge: string, ulke: string) => `${bolge} (${ulke})`;

/** Ülkenin adı arayüz dilinde (tarayıcının ülke adları; ör. AZ → Azerbaycan / Azerbaijan / أذربيجان) */
export function ulkeAdi(iso: string, dil: Dil = 'tr'): string {
  try {
    return new Intl.DisplayNames([DILLER[dil].locale.split('-u-')[0]], { type: 'region' }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

/** Ekranda konum: "Ganja, Azerbaycan"; Türkiye/Almanya/İspanya ili olduğu gibi */
export function ilGoster(il: string | null | undefined, dil: Dil = 'tr'): string {
  if (!il) return '';
  const d = dunyaIli(il);
  return d ? `${d.bolge}, ${ulkeAdi(d.ulke, dil)}` : il;
}

/** Serbest konum metnindeki dünya ilini okunur yazar: "Merkez, Ganja (AZ)" → "Merkez, Ganja, Azerbaycan" */
export function konumGoster(metin: string | null | undefined, dil: Dil = 'tr'): string {
  if (!metin) return '';
  const d = dunyaIlBul(metin);
  return d ? metin.slice(0, metin.lastIndexOf(d)) + ilGoster(d, dil) : metin;
}

/** NASA POWER'dan gelen aylık iklim (Ocak → Aralık) */
export type DunyaIklimi = IlIklimi & { par?: number[]; boylam: number; yaklasik: boolean };

/** Güney yarımküredeki ülkeler (ülke merkezinin enlemi < 0): mevsimler Z-kartlardaki aylara göre yaklaşık 6 ay kaymıştır */
const GUNEY = new Set(["AO", "AR", "AU", "BI", "BO", "BR", "BW", "CG", "CL", "EC", "FJ", "GA", "ID", "KM", "LS", "MG", "MU", "MW", "MZ", "NA", "NR", "NZ", "PE", "PG", "PY", "RW", "SB", "SC", "SZ", "TL", "TO", "TV", "TZ", "UY", "VU", "WS", "ZA", "ZM", "ZW"]);
export const guneyYarimkureMi = (il?: string | null) => {
  const d = dunyaIli(il);
  return !!d && GUNEY.has(d.ulke);
};
/** Z-kart takvimine göre "bu ay": güney yarımkürede 6 ay kaydırılır (Ocak orada Temmuz gibidir) */
export const takvimAyi = (il?: string | null, tarih = new Date()) => (tarih.getMonth() + (guneyYarimkureMi(il) ? 6 : 0)) % 12;

/**
 * Takvim tabanlı hesaplar (su ihtiyacı, sulama takvimi, PAR kartı) Z-kartların dönemleriyle çalışır; bunlar Kuzey yarımkürenin
 * ılıman-subtropik kuşağına göre yazılmıştır. Güney yarımküre ve tropik kuşakta mevsimler farklıdır, o yüzden iklim kaydedilmez
 * ve bu bölümler gösterilmez (gübre önerileri ve atlas yine çalışır).
 */
export const takvimUygun = (enlem: number) => enlem >= 23 && enlem <= 60;

/** Dünya ilinin iklimini, Türkiye illeriyle aynı tablolara kaydeder; böylece aynı hesaplar çalışır */
export function iklimKaydet(il: string, v: DunyaIklimi | null | undefined) {
  if (!v || IL_IKLIM[il] || !takvimUygun(v.enlem)) return;
  IL_IKLIM[il] = { enlem: v.enlem, t: v.t, fark: v.fark, yagis: v.yagis };
  if (v.par) IL_PAR[il] = v.par;
}
