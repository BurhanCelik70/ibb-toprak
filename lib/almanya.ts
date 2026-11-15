/**
 * Almanya (16 eyalet / Bundesland) için bölge, iklim, PAR ve ETo verileri.
 * Arayüz Almanca seçildiğinde il listesinin yerine bu eyaletler gelir; değerler Türkiye illeriyle aynı biçimdedir
 * (IL_IKLIM, IL_PAR) böylece su ihtiyacı, PAR kartı ve sulama takvimi aynı kodla çalışır.
 *
 * Kaynak: DWD iklim normalleri 1991–2020, istasyon tabloları climatestotravel.com derlemesinden (aylık en düşük/en yüksek
 * sıcaklık, yağış mm/ay, güneşlenme saat/gün). Her eyalet 1–4 temsilci istasyonun ortalamasıdır:
 *   BW: Stuttgart + Freiburg · BY: München, Nürnberg, Würzburg, Passau · BE/BB: Berlin · HB: Bremen · HH: Hamburg
 *   HE: Frankfurt · MV: Rostock · NI: Hannover + Bremen · NW: Köln, Düsseldorf, Dortmund, Bielefeld
 *   RP: Frankfurt + Saarbrücken · SL: Saarbrücken · SN: Dresden + Leipzig · ST: Leipzig · SH: Kiel + Lübeck
 *   TH: Leipzig + Nürnberg (Erfurt istasyonu tabloda yok; yaklaşık)
 *  - t: ortalama sıcaklık (°C) · fark: gündüz-gece farkı (°C) · yagis: mm/gün (aylık toplam / ay günü)
 *  - PAR: Ångström (Rs = (0,25 + 0,5·n/N)·Ra), PAR = 0,47·Rs — güneşlenme süresinden tahmin (MJ/m²/gün)
 *  - ETo: Makkink (0,65·Δ/(Δ+γ)·Rs/λ), DWD ve KNMI'nin çim referans buharlaşması için kullandığı eşitlik.
 *    Hargreaves nemli Orta Avrupa ikliminde ETo'yu %15–25 fazla verdiği için burada kullanılmadı.
 */
import type { IlIklimi } from './iklim';

export type DeRegion = 'Norddeutschland' | 'Ostdeutschland' | 'Westdeutschland' | 'Süddeutschland';

export const DE_REGION_LAENDER: Record<DeRegion, string[]> = {
  Norddeutschland: ['Bremen', 'Hamburg', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Schleswig-Holstein'],
  Ostdeutschland: ['Berlin', 'Brandenburg', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen'],
  Westdeutschland: ['Hessen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland'],
  Süddeutschland: ['Baden-Württemberg', 'Bayern'],
};

/** Alfabetik 16 Bundesland */
export const BUNDESLAENDER: string[] = Object.values(DE_REGION_LAENDER)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'de'));

export const almanMi = (il?: string | null) => !!il && BUNDESLAENDER.includes(il);

/** Bölge eğilimleri (yapay zekâ yorumuna bağlam; Almanca, çünkü yalnız Almanca arayüzde seçilir) */
export const DE_REGION_INFO: Record<DeRegion, { iklim: string; toprak: string; dikkat: string[] }> = {
  Norddeutschland: {
    iklim: 'Ozeanisch geprägt: milde Winter, kühle Sommer, Niederschlag ganzjährig (ca. 600–800 mm). Frühjahrs- und Vorsommertrockenheit auf Sandböden häufig.',
    toprak: 'Geest: sandige, saure, humus- und nährstoffarme Böden (Podsole, Braunerden). Marsch an der Küste: tonige, fruchtbare Schlickböden. Östliches Hügelland (SH, MV): lehmige Jungmoränenböden (Parabraunerde). Südliches Niedersachsen: Lössbörden (Hildesheim, Calenberg) mit hohen Ackerzahlen.',
    dikkat: [
      'Auf Sand geringe Wasserhaltefähigkeit; Beregnung in Nordost-Niedersachsen (Uelzen, Lüneburger Heide) verbreitet',
      'Nitratauswaschung auf leichten Böden; Düngeverordnung und „rote Gebiete“ beachten',
      'pH sinkt auf Sand rasch: regelmäßige Erhaltungskalkung',
      'Marsch- und Tonböden: Staunässe und Verdichtung bei nasser Bearbeitung',
    ],
  },
  Ostdeutschland: {
    iklim: 'Kontinentaler und trockenster Teil Deutschlands (ca. 500–600 mm; im Regenschatten des Harzes unter 500 mm). Warme Sommer, kalte Winter, ausgeprägte Vorsommertrockenheit.',
    toprak: 'Brandenburg: überwiegend sandige, nährstoffarme Böden mit niedrigen Ackerzahlen. Magdeburger Börde: Schwarzerde (Tschernosem) auf Löss, die besten Ackerböden Deutschlands. Leipziger Tieflandsbucht und Thüringer Becken: Löss- und Lehmböden.',
    dikkat: [
      'Wasser ist der begrenzende Faktor: Frühjahrs- und Vorsommertrockenheit',
      'Sandböden: Winderosion und geringe Nährstoffspeicherung',
      'Spätfröste im Frühjahr',
      'Schwarzerden: hohe Fruchtbarkeit, aber Trockenstress in heißen Sommern',
    ],
  },
  Westdeutschland: {
    iklim: 'Atlantisch geprägt und mild; Rheinebene, Rheinhessen und Pfalz warm und relativ trocken, Mittelgebirge (Eifel, Sauerland, Hunsrück, Westerwald) kühler und niederschlagsreich.',
    toprak: 'Lössbörden mit Parabraunerden (Kölner Bucht, Jülich-Zülpicher Börde, Soester Börde, Wetterau) – sehr fruchtbar. Mittelgebirge: flachgründige, steinige, oft saure Böden. Oberrheingraben und Rheinhessen: kalkhaltige Löss- und Sandböden, Weinbau.',
    dikkat: [
      'Wassererosion auf Lössäckern an Hängen (Mais, Zuckerrübe)',
      'Bodenverdichtung bei nasser Ernte (Zuckerrübe, Mais)',
      'Saure Mittelgebirgsböden: Kalkung und Magnesium beachten',
      'Rheinhessen/Pfalz: Sommertrockenheit, Bewässerung im Gemüse- und Weinbau',
    ],
  },
  Süddeutschland: {
    iklim: 'Übergangsklima mit kontinentalem Einfluss; Alpenvorland mit hohen Sommerniederschlägen (bis über 1000 mm), Oberrheingraben sehr warm, Unterfranken trocken (ca. 550 mm). Hagel und Starkregen im Sommer.',
    toprak: 'Gäulandschaften (Kraichgau, Gäuboden bei Straubing) mit Lössböden; Fränkische Platte: kalkhaltige, oft flachgründige Muschelkalkböden; Alpenvorland: Moränen- und Grünlandböden; Keuper-Bergland mit tonigen Böden.',
    dikkat: [
      'Bodenerosion auf Lössäckern bei Starkregen (Mais, Hackfrüchte)',
      'Unterfranken: Sommertrockenheit, flachgründige Kalkböden',
      'Hagel- und Spätfrostrisiko (Obst- und Weinbau)',
      'Kalkhaltige Böden: Mangan-, Bor- und Phosphorverfügbarkeit beachten',
    ],
  },
};

export const DE_LAND_NOTIZ: Record<string, string> = {
  'Sachsen-Anhalt': 'Magdeburger Börde: Schwarzerde mit Ackerzahlen bis 100, aber nur rund 500 mm Niederschlag im Regenschatten des Harzes – Wasser begrenzt den Ertrag.',
  Brandenburg: 'Überwiegend leichte, sandige Böden mit geringer Wasserhaltefähigkeit; trockenstes Bundesland. Humusaufbau und Zwischenfrüchte sind wichtig.',
  Bayern: 'Sehr unterschiedlich: Gäuboden (Löss, sehr fruchtbar), Unterfranken (trocken, Muschelkalk), Alpenvorland (feucht, Grünland), Hallertau (Hopfen).',
  'Baden-Württemberg': 'Oberrheingraben: wärmste Region Deutschlands (Mais, Sonderkulturen, Wein); Kraichgau: Löss mit Erosionsgefahr; Schwäbische Alb: flachgründige Kalkböden.',
  Niedersachsen: 'Nord: Geest-Sandböden mit Beregnung (Kartoffel); Süd: Hildesheimer Börde mit Löss (Zuckerrübe, Weizen); Küste: Marsch.',
  'Nordrhein-Westfalen': 'Kölner Bucht und Börden: Löss, Zuckerrübe und Weizen; Münsterland: sandige Böden, intensive Tierhaltung (Nährstoffüberschuss).',
  'Mecklenburg-Vorpommern': 'Jungmoränenland mit lehmigen bis sandigen Böden, großflächiger Ackerbau (Raps, Weizen); Spätfröste und Frühjahrstrockenheit.',
  Thüringen: 'Thüringer Becken: Löss und Schwarzerde-ähnliche Böden im Regenschatten (trocken); Randgebirge kühl und feucht.',
  Sachsen: 'Lössgürtel (Lommatzscher Pflege) sehr fruchtbar; Erzgebirgsvorland kühler, saure Böden im Bergland.',
  Hessen: 'Wetterau: fruchtbare Lössböden; Mittelgebirge (Vogelsberg, Rhön) kühler mit Grünland.',
  'Rheinland-Pfalz': 'Rheinhessen und Pfalz: warm, trocken, Wein- und Gemüsebau mit Bewässerung; Eifel und Hunsrück: saure, steinige Böden.',
  'Schleswig-Holstein': 'Östliches Hügelland: Lehmböden (Weizen, Raps); Geest: Sand; Westküste: Marsch.',
  Saarland: 'Hügelland mit lehmigen bis tonigen Böden, viel Grünland; mildes, feuchtes Klima.',
};

/** Serbest metin (laboratuvar adresi) → eyalet: büyük şehirler */
export const DE_STADT_LAND: Record<string, string> = {
  münchen: 'Bayern', nürnberg: 'Bayern', augsburg: 'Bayern', würzburg: 'Bayern', regensburg: 'Bayern', passau: 'Bayern', straubing: 'Bayern', ingolstadt: 'Bayern', freising: 'Bayern',
  stuttgart: 'Baden-Württemberg', karlsruhe: 'Baden-Württemberg', freiburg: 'Baden-Württemberg', mannheim: 'Baden-Württemberg', heidelberg: 'Baden-Württemberg', hohenheim: 'Baden-Württemberg',
  frankfurt: 'Hessen', kassel: 'Hessen', darmstadt: 'Hessen', wiesbaden: 'Hessen', gießen: 'Hessen',
  köln: 'Nordrhein-Westfalen', düsseldorf: 'Nordrhein-Westfalen', dortmund: 'Nordrhein-Westfalen', münster: 'Nordrhein-Westfalen', bonn: 'Nordrhein-Westfalen', bielefeld: 'Nordrhein-Westfalen',
  hannover: 'Niedersachsen', oldenburg: 'Niedersachsen', braunschweig: 'Niedersachsen', göttingen: 'Niedersachsen', osnabrück: 'Niedersachsen', hameln: 'Niedersachsen',
  kiel: 'Schleswig-Holstein', lübeck: 'Schleswig-Holstein', rostock: 'Mecklenburg-Vorpommern', schwerin: 'Mecklenburg-Vorpommern', greifswald: 'Mecklenburg-Vorpommern',
  potsdam: 'Brandenburg', cottbus: 'Brandenburg', magdeburg: 'Sachsen-Anhalt', bernburg: 'Sachsen-Anhalt',
  leipzig: 'Sachsen', dresden: 'Sachsen', chemnitz: 'Sachsen', erfurt: 'Thüringen', jena: 'Thüringen', mainz: 'Rheinland-Pfalz', speyer: 'Rheinland-Pfalz', trier: 'Rheinland-Pfalz', saarbrücken: 'Saarland',
};

export function landBul(metin?: string | null): string | undefined {
  if (!metin) return undefined;
  const t = metin.toLocaleLowerCase('de-DE');
  const l = [...BUNDESLAENDER].sort((a, b) => b.length - a.length).find((x) => t.includes(x.toLocaleLowerCase('de-DE')));
  if (l) return l;
  return Object.entries(DE_STADT_LAND).find(([s]) => t.includes(s))?.[1];
}

export const DE_IKLIM: Record<string, IlIklimi> = {
  'Baden-Württemberg': { enlem: 48.7, t: [2.0, 3.02, 6.65, 10.47, 14.5, 18.1, 20.02, 19.8, 15.45, 10.9, 5.88, 2.85], fark: [6.2, 7.65, 9.4, 10.95, 10.7, 10.8, 11.05, 11.2, 10.4, 8.7, 6.75, 6.1], yagis: [1.45, 1.52, 1.61, 1.83, 2.98, 3.0, 2.98, 2.5, 2.17, 2.18, 2.0, 1.77] },
  'Bayern': { enlem: 49.0, t: [0.05, 1.31, 5.15, 9.61, 13.89, 17.36, 19.14, 18.85, 14.38, 9.6, 4.4, 1.05], fark: [5.6, 7.12, 8.95, 10.92, 10.88, 10.88, 11.12, 11.3, 10.2, 8.3, 5.85, 5.15], yagis: [1.61, 1.52, 1.69, 1.42, 2.62, 2.62, 3.06, 2.58, 2.08, 1.9, 1.75, 1.77] },
  'Berlin': { enlem: 52.5, t: [0.5, 1.55, 4.7, 9.55, 13.9, 17.3, 19.5, 19.15, 14.8, 9.75, 4.8, 1.6], fark: [5.4, 6.7, 8.6, 11.1, 11.4, 11.2, 11.0, 11.3, 10.0, 8.3, 5.8, 5.0], yagis: [1.29, 1.07, 1.13, 1.0, 1.77, 2.0, 2.26, 1.61, 1.5, 1.29, 1.33, 1.29] },
  'Brandenburg': { enlem: 52.4, t: [0.5, 1.55, 4.7, 9.55, 13.9, 17.3, 19.5, 19.15, 14.8, 9.75, 4.8, 1.6], fark: [5.4, 6.7, 8.6, 11.1, 11.4, 11.2, 11.0, 11.3, 10.0, 8.3, 5.8, 5.0], yagis: [1.29, 1.07, 1.13, 1.0, 1.77, 2.0, 2.26, 1.61, 1.5, 1.29, 1.33, 1.29] },
  'Bremen': { enlem: 53.1, t: [2.1, 2.65, 5.3, 9.2, 13.05, 16.0, 18.35, 18.05, 14.55, 10.1, 5.8, 2.9], fark: [5.0, 5.9, 8.0, 10.2, 10.5, 10.4, 10.5, 10.5, 9.5, 7.8, 5.6, 4.8], yagis: [1.94, 1.43, 1.45, 1.33, 1.61, 2.17, 2.42, 2.26, 2.0, 1.77, 1.67, 1.94] },
  'Hamburg': { enlem: 53.6, t: [1.95, 2.45, 5.0, 8.95, 12.95, 16.0, 18.35, 18.2, 14.55, 10.05, 5.65, 2.75], fark: [4.7, 5.5, 7.4, 9.7, 10.1, 9.8, 9.7, 9.6, 8.5, 7.1, 5.1, 4.5], yagis: [2.1, 1.79, 1.77, 1.33, 1.94, 2.5, 2.58, 2.58, 2.17, 2.1, 2.17, 2.42] },
  'Hessen': { enlem: 50.1, t: [2.25, 3.15, 6.85, 10.9, 14.95, 18.45, 20.55, 20.15, 15.8, 10.9, 6.15, 3.05], fark: [5.3, 6.9, 8.9, 10.8, 10.9, 10.9, 11.1, 11.1, 10.0, 7.8, 5.5, 4.9], yagis: [1.45, 1.43, 1.29, 1.17, 1.94, 1.83, 2.1, 1.94, 1.67, 1.61, 1.67, 1.77] },
  'Mecklenburg-Vorpommern': { enlem: 53.9, t: [1.85, 2.3, 4.6, 8.75, 12.7, 16.15, 18.55, 18.65, 15.3, 10.65, 6.05, 2.95], fark: [3.9, 4.2, 5.4, 6.9, 7.2, 6.9, 6.9, 7.1, 6.4, 5.3, 3.9, 3.7], yagis: [1.45, 1.25, 1.29, 1.17, 1.61, 2.33, 2.26, 2.26, 1.83, 1.61, 1.5, 1.61] },
  'Niedersachsen': { enlem: 52.6, t: [2.05, 2.6, 5.33, 9.32, 13.2, 16.27, 18.52, 18.3, 14.65, 10.22, 5.88, 2.9], fark: [4.9, 5.9, 7.95, 10.25, 10.5, 10.35, 10.45, 10.4, 9.4, 7.55, 5.35, 4.7], yagis: [1.85, 1.43, 1.45, 1.25, 1.69, 2.0, 2.34, 2.18, 1.83, 1.77, 1.75, 1.85] },
  'Nordrhein-Westfalen': { enlem: 51.4, t: [2.91, 3.51, 6.4, 10.08, 13.59, 16.76, 18.9, 18.57, 15.04, 11.01, 6.74, 3.82], fark: [5.08, 6.12, 8.25, 10.55, 10.78, 10.73, 10.9, 10.7, 9.53, 7.53, 5.53, 4.75], yagis: [2.3, 2.05, 1.85, 1.62, 2.1, 2.5, 2.58, 2.62, 2.08, 2.02, 2.33, 2.54] },
  'Rheinland-Pfalz': { enlem: 49.9, t: [2.52, 3.38, 6.9, 10.72, 14.78, 18.23, 20.28, 19.88, 15.57, 11.05, 6.35, 3.27], fark: [5.35, 6.95, 9.2, 11.05, 11.15, 11.25, 11.35, 11.45, 10.35, 8.1, 5.7, 4.95], yagis: [1.85, 1.79, 1.61, 1.33, 2.1, 1.92, 2.18, 2.1, 1.92, 1.94, 2.08, 2.42] },
  'Saarland': { enlem: 49.3, t: [2.8, 3.6, 6.95, 10.55, 14.6, 18.0, 20.0, 19.6, 15.35, 11.2, 6.55, 3.5], fark: [5.4, 7.0, 9.5, 11.3, 11.4, 11.6, 11.6, 11.8, 10.7, 8.4, 5.9, 5.0], yagis: [2.26, 2.14, 1.94, 1.5, 2.26, 2.0, 2.26, 2.26, 2.17, 2.26, 2.5, 3.06] },
  'Sachsen': { enlem: 51.2, t: [0.75, 1.68, 5.03, 9.6, 13.88, 17.3, 19.52, 19.3, 14.95, 10.15, 5.15, 1.88], fark: [5.1, 6.15, 7.55, 9.7, 9.95, 10.0, 10.45, 10.2, 8.9, 7.3, 5.3, 4.85], yagis: [1.21, 0.98, 1.21, 1.17, 1.85, 2.0, 2.66, 2.34, 1.67, 1.37, 1.5, 1.29] },
  'Sachsen-Anhalt': { enlem: 51.8, t: [0.95, 1.8, 5.15, 9.65, 13.85, 17.3, 19.6, 19.35, 15.05, 10.25, 5.2, 2.0], fark: [5.3, 6.4, 7.9, 10.1, 10.3, 10.4, 10.8, 10.5, 9.3, 7.7, 5.6, 5.0], yagis: [1.13, 0.89, 1.13, 1.17, 1.61, 1.83, 2.58, 2.1, 1.67, 1.13, 1.33, 1.13] },
  'Schleswig-Holstein': { enlem: 54.2, t: [1.57, 2.0, 4.47, 8.4, 12.18, 15.37, 17.88, 17.7, 14.32, 9.9, 5.35, 2.68], fark: [4.75, 5.5, 7.55, 9.8, 10.65, 10.35, 10.45, 10.1, 8.85, 7.1, 5.1, 4.45], yagis: [2.1, 1.79, 1.53, 1.33, 1.61, 2.25, 2.5, 2.42, 2.0, 2.02, 2.0, 2.18] },
  'Thüringen': { enlem: 50.9, t: [0.75, 1.75, 5.17, 9.65, 13.92, 17.38, 19.43, 19.15, 14.72, 10.0, 4.95, 1.77], fark: [5.6, 6.9, 8.65, 10.9, 10.95, 10.95, 11.25, 11.2, 10.05, 8.2, 5.9, 5.15], yagis: [1.21, 1.07, 1.21, 1.17, 1.77, 1.92, 2.58, 2.02, 1.67, 1.37, 1.5, 1.37] },
};

/** Ocak → Aralık, MJ/m²/gün PAR (Ångström: güneşlenme süresinden) */
export const DE_PAR: Record<string, number[]> = {
  'Baden-Württemberg': [1.8, 3.05, 4.79, 7.11, 8.48, 9.53, 9.31, 8.4, 6.08, 3.64, 2.01, 1.45], 
  'Bayern': [1.77, 3.02, 4.76, 7.08, 8.76, 9.52, 9.6, 8.37, 5.8, 3.61, 1.98, 1.42], 
  'Berlin': [1.31, 2.31, 4.16, 7.01, 8.8, 9.32, 9.07, 7.77, 5.42, 3.03, 1.5, 1.0], 
  'Brandenburg': [1.32, 2.32, 4.17, 7.02, 8.81, 9.32, 9.08, 7.78, 5.43, 3.04, 1.51, 1.01], 
  'Bremen': [1.15, 2.25, 3.99, 6.69, 8.47, 8.99, 8.74, 7.45, 5.12, 2.97, 1.33, 0.9], 
  'Hamburg': [1.1, 2.2, 4.04, 6.64, 8.43, 8.96, 8.71, 7.4, 5.07, 2.91, 1.29, 0.82], 
  'Hessen': [1.41, 2.72, 4.64, 7.25, 8.68, 9.46, 9.23, 8.27, 5.68, 3.29, 1.6, 1.21], 
  'Mecklenburg-Vorpommern': [1.08, 2.16, 4.21, 7.12, 9.25, 9.52, 9.54, 7.64, 5.26, 2.88, 1.37, 0.79], 
  'Niedersachsen': [1.19, 2.3, 3.93, 6.74, 8.5, 9.02, 8.77, 7.49, 5.17, 3.02, 1.37, 0.99], 
  'Nordrhein-Westfalen': [1.41, 2.58, 4.27, 6.86, 8.3, 8.78, 8.55, 7.6, 5.3, 3.15, 1.61, 1.1], 
  'Rheinland-Pfalz': [1.43, 2.74, 4.66, 7.27, 8.7, 9.47, 9.24, 8.29, 5.7, 3.32, 1.61, 1.23], 
  'Saarland': [1.48, 2.81, 4.72, 7.33, 8.74, 9.5, 9.28, 8.34, 5.77, 3.38, 1.67, 1.28], 
  'Sachsen': [1.43, 2.44, 4.29, 7.14, 8.9, 9.39, 9.16, 7.89, 5.56, 3.17, 1.63, 1.11], 
  'Sachsen-Anhalt': [1.37, 2.38, 4.23, 7.08, 8.85, 9.36, 9.12, 7.84, 5.5, 3.11, 1.57, 1.06], 
  'Schleswig-Holstein': [1.05, 2.13, 4.07, 6.84, 8.8, 9.21, 9.09, 7.48, 5.11, 2.84, 1.29, 0.77], 
  'Thüringen': [1.4, 2.55, 4.44, 7.17, 8.77, 9.41, 9.18, 8.06, 5.59, 3.21, 1.59, 1.14], 
};

/** Ocak → Aralık, ETo mm/gün — Makkink (DWD/KNMI'nin kullandığı eşitlik), güneşlenmeden hesaplanan Rs ile */
export const DE_ETO: Record<string, number[]> = {
  'Baden-Württemberg': [0.44,  0.77,  1.36,  2.25,  2.96,  3.57,  3.61,  3.24,  2.16,  1.17,  0.56,  0.37],
  'Bayern': [0.4,  0.72,  1.29,  2.2,  3.01,  3.52,  3.67,  3.18,  2.02,  1.12,  0.53,  0.34],
  'Berlin': [0.3,  0.56,  1.11,  2.17,  3.03,  3.44,  3.49,  2.97,  1.9,  0.94,  0.4,  0.24],
  'Brandenburg': [0.31,  0.56,  1.12,  2.17,  3.03,  3.44,  3.49,  2.97,  1.91,  0.95,  0.41,  0.24],
  'Bremen': [0.28,  0.56,  1.09,  2.05,  2.86,  3.23,  3.29,  2.79,  1.79,  0.93,  0.37,  0.23],
  'Hamburg': [0.27,  0.55,  1.09,  2.02,  2.84,  3.22,  3.28,  2.78,  1.77,  0.91,  0.36,  0.21],
  'Hessen': [0.35,  0.69,  1.33,  2.32,  3.06,  3.57,  3.61,  3.22,  2.04,  1.06,  0.45,  0.31],
  'Mecklenburg-Vorpommern': [0.26,  0.54,  1.13,  2.16,  3.1,  3.44,  3.61,  2.89,  1.87,  0.92,  0.38,  0.2],
  'Niedersachsen': [0.29,  0.57,  1.08,  2.07,  2.88,  3.26,  3.31,  2.82,  1.81,  0.95,  0.38,  0.25],
  'Nordrhein-Westfalen': [0.36,  0.67,  1.21,  2.15,  2.84,  3.21,  3.25,  2.87,  1.87,  1.01,  0.46,  0.29],
  'Rheinland-Pfalz': [0.36,  0.7,  1.34,  2.32,  3.05,  3.56,  3.6,  3.21,  2.03,  1.07,  0.46,  0.31],
  'Saarland': [0.37,  0.73,  1.36,  2.33,  3.05,  3.55,  3.6,  3.21,  2.05,  1.09,  0.47,  0.33],
  'Sachsen': [0.33,  0.59,  1.16,  2.21,  3.06,  3.47,  3.52,  3.02,  1.96,  1.0,  0.44,  0.27],
  'Sachsen-Anhalt': [0.32,  0.58,  1.15,  2.2,  3.04,  3.46,  3.51,  3.01,  1.94,  0.98,  0.43,  0.26],
  'Schleswig-Holstein': [0.25,  0.52,  1.08,  2.05,  2.91,  3.27,  3.39,  2.78,  1.78,  0.89,  0.35,  0.19],
  'Thüringen': [0.33,  0.62,  1.21,  2.23,  3.02,  3.48,  3.52,  3.08,  1.96,  1.0,  0.43,  0.28],
};

/**
 * Eyaletlere göre Landkreis listesi (294 Landkreis; şehir eyaletlerinde Bezirk). Tarla formunda öneri listesi olarak
 * kullanılır; alan serbest metindir, listede olmayan yer (ör. kreisfreie Stadt) elle yazılabilir.
 * İklim ve toprak verisi eyalet düzeyindedir; Landkreis yalnız kayıt ve yapay zekâ bağlamı içindir.
 */
export const DE_LANDKREISE: Record<string, string[]> = {
  'Baden-Württemberg': ['Alb-Donau-Kreis', 'Biberach', 'Böblingen', 'Bodenseekreis', 'Breisgau-Hochschwarzwald', 'Calw', 'Emmendingen', 'Enzkreis', 'Esslingen', 'Freudenstadt', 'Göppingen', 'Heidenheim', 'Heilbronn', 'Hohenlohekreis', 'Karlsruhe', 'Konstanz', 'Lörrach', 'Ludwigsburg', 'Main-Tauber-Kreis', 'Neckar-Odenwald-Kreis', 'Ortenaukreis', 'Ostalbkreis', 'Rastatt', 'Ravensburg', 'Rems-Murr-Kreis', 'Reutlingen', 'Rhein-Neckar-Kreis', 'Rottweil', 'Schwäbisch Hall', 'Schwarzwald-Baar-Kreis', 'Sigmaringen', 'Tübingen', 'Tuttlingen', 'Waldshut', 'Zollernalbkreis'],
  Bayern: ['Aichach-Friedberg', 'Altötting', 'Amberg-Sulzbach', 'Ansbach', 'Aschaffenburg', 'Augsburg', 'Bad Kissingen', 'Bad Tölz-Wolfratshausen', 'Bamberg', 'Bayreuth', 'Berchtesgadener Land', 'Cham', 'Coburg', 'Dachau', 'Deggendorf', 'Dillingen an der Donau', 'Dingolfing-Landau', 'Donau-Ries', 'Ebersberg', 'Eichstätt', 'Erding', 'Erlangen-Höchstadt', 'Forchheim', 'Freising', 'Freyung-Grafenau', 'Fürstenfeldbruck', 'Fürth', 'Garmisch-Partenkirchen', 'Günzburg', 'Haßberge', 'Hof', 'Kelheim', 'Kitzingen', 'Kronach', 'Kulmbach', 'Landsberg am Lech', 'Landshut', 'Lichtenfels', 'Lindau (Bodensee)', 'Main-Spessart', 'Miesbach', 'Miltenberg', 'Mühldorf am Inn', 'München', 'Neuburg-Schrobenhausen', 'Neumarkt in der Oberpfalz', 'Neustadt an der Aisch-Bad Windsheim', 'Neustadt an der Waldnaab', 'Neu-Ulm', 'Nürnberger Land', 'Oberallgäu', 'Ostallgäu', 'Passau', 'Pfaffenhofen an der Ilm', 'Regen', 'Regensburg', 'Rhön-Grabfeld', 'Rosenheim', 'Roth', 'Rottal-Inn', 'Schwandorf', 'Schweinfurt', 'Starnberg', 'Straubing-Bogen', 'Tirschenreuth', 'Traunstein', 'Unterallgäu', 'Weilheim-Schongau', 'Weißenburg-Gunzenhausen', 'Wunsiedel im Fichtelgebirge', 'Würzburg'],
  Berlin: ['Charlottenburg-Wilmersdorf', 'Friedrichshain-Kreuzberg', 'Lichtenberg', 'Marzahn-Hellersdorf', 'Mitte', 'Neukölln', 'Pankow', 'Reinickendorf', 'Spandau', 'Steglitz-Zehlendorf', 'Tempelhof-Schöneberg', 'Treptow-Köpenick'],
  Brandenburg: ['Barnim', 'Dahme-Spreewald', 'Elbe-Elster', 'Havelland', 'Märkisch-Oderland', 'Oberhavel', 'Oberspreewald-Lausitz', 'Oder-Spree', 'Ostprignitz-Ruppin', 'Potsdam-Mittelmark', 'Prignitz', 'Spree-Neiße', 'Teltow-Fläming', 'Uckermark'],
  Bremen: ['Bremen (Stadt)', 'Bremerhaven'],
  Hamburg: ['Altona', 'Bergedorf', 'Eimsbüttel', 'Hamburg-Mitte', 'Hamburg-Nord', 'Harburg', 'Wandsbek'],
  Hessen: ['Bergstraße', 'Darmstadt-Dieburg', 'Fulda', 'Gießen', 'Groß-Gerau', 'Hersfeld-Rotenburg', 'Hochtaunuskreis', 'Kassel', 'Lahn-Dill-Kreis', 'Limburg-Weilburg', 'Main-Kinzig-Kreis', 'Main-Taunus-Kreis', 'Marburg-Biedenkopf', 'Odenwaldkreis', 'Offenbach', 'Rheingau-Taunus-Kreis', 'Schwalm-Eder-Kreis', 'Vogelsbergkreis', 'Waldeck-Frankenberg', 'Werra-Meißner-Kreis', 'Wetteraukreis'],
  'Mecklenburg-Vorpommern': ['Ludwigslust-Parchim', 'Mecklenburgische Seenplatte', 'Nordwestmecklenburg', 'Rostock', 'Vorpommern-Greifswald', 'Vorpommern-Rügen'],
  Niedersachsen: ['Ammerland', 'Aurich', 'Celle', 'Cloppenburg', 'Cuxhaven', 'Diepholz', 'Emsland', 'Friesland', 'Gifhorn', 'Goslar', 'Göttingen', 'Grafschaft Bentheim', 'Hameln-Pyrmont', 'Harburg', 'Heidekreis', 'Helmstedt', 'Hildesheim', 'Holzminden', 'Leer', 'Lüchow-Dannenberg', 'Lüneburg', 'Nienburg/Weser', 'Northeim', 'Oldenburg', 'Osnabrück', 'Osterholz', 'Peine', 'Region Hannover', 'Rotenburg (Wümme)', 'Schaumburg', 'Stade', 'Uelzen', 'Vechta', 'Verden', 'Wesermarsch', 'Wittmund', 'Wolfenbüttel'],
  'Nordrhein-Westfalen': ['Borken', 'Coesfeld', 'Düren', 'Ennepe-Ruhr-Kreis', 'Euskirchen', 'Gütersloh', 'Heinsberg', 'Herford', 'Hochsauerlandkreis', 'Höxter', 'Kleve', 'Lippe', 'Märkischer Kreis', 'Mettmann', 'Minden-Lübbecke', 'Oberbergischer Kreis', 'Olpe', 'Paderborn', 'Recklinghausen', 'Rhein-Erft-Kreis', 'Rheinisch-Bergischer Kreis', 'Rhein-Kreis Neuss', 'Rhein-Sieg-Kreis', 'Siegen-Wittgenstein', 'Soest', 'Städteregion Aachen', 'Steinfurt', 'Unna', 'Viersen', 'Warendorf', 'Wesel'],
  'Rheinland-Pfalz': ['Ahrweiler', 'Altenkirchen (Westerwald)', 'Alzey-Worms', 'Bad Dürkheim', 'Bad Kreuznach', 'Bernkastel-Wittlich', 'Birkenfeld', 'Cochem-Zell', 'Donnersbergkreis', 'Eifelkreis Bitburg-Prüm', 'Germersheim', 'Kaiserslautern', 'Kusel', 'Mainz-Bingen', 'Mayen-Koblenz', 'Neuwied', 'Rhein-Hunsrück-Kreis', 'Rhein-Lahn-Kreis', 'Rhein-Pfalz-Kreis', 'Südliche Weinstraße', 'Südwestpfalz', 'Trier-Saarburg', 'Vulkaneifel', 'Westerwaldkreis'],
  Saarland: ['Merzig-Wadern', 'Neunkirchen', 'Regionalverband Saarbrücken', 'Saarlouis', 'Saarpfalz-Kreis', 'St. Wendel'],
  Sachsen: ['Bautzen', 'Erzgebirgskreis', 'Görlitz', 'Leipzig', 'Meißen', 'Mittelsachsen', 'Nordsachsen', 'Sächsische Schweiz-Osterzgebirge', 'Vogtlandkreis', 'Zwickau'],
  'Sachsen-Anhalt': ['Altmarkkreis Salzwedel', 'Anhalt-Bitterfeld', 'Börde', 'Burgenlandkreis', 'Harz', 'Jerichower Land', 'Mansfeld-Südharz', 'Saalekreis', 'Salzlandkreis', 'Stendal', 'Wittenberg'],
  'Schleswig-Holstein': ['Dithmarschen', 'Herzogtum Lauenburg', 'Nordfriesland', 'Ostholstein', 'Pinneberg', 'Plön', 'Rendsburg-Eckernförde', 'Schleswig-Flensburg', 'Segeberg', 'Steinburg', 'Stormarn'],
  Thüringen: ['Altenburger Land', 'Eichsfeld', 'Gotha', 'Greiz', 'Hildburghausen', 'Ilm-Kreis', 'Kyffhäuserkreis', 'Nordhausen', 'Saale-Holzland-Kreis', 'Saale-Orla-Kreis', 'Saalfeld-Rudolstadt', 'Schmalkalden-Meiningen', 'Sömmerda', 'Sonneberg', 'Unstrut-Hainich-Kreis', 'Wartburgkreis', 'Weimarer Land'],
};
