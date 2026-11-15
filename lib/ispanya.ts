/**
 * İspanya (50 il / provincia) için bölge, iklim ve PAR verileri. Türkiye illeri ve Almanya eyaletleriyle aynı biçimdedir
 * (IL_IKLIM, IL_PAR): su ihtiyacı, PAR kartı ve sulama takvimi aynı kodla çalışır. ETo, Türkiye'deki gibi FAO-56 Hargreaves
 * ile hesaplanır (yarı kurak Akdeniz ikliminde uygundur).
 *
 * Kaynak: AEMET 1981–2010 iklim normalleri (valores climatológicos normales), il merkezi ya da en yakın temsilci istasyon;
 * değerler derlemedir ve yaklaşıktır. Birden çok istasyonlu iller ortalamadır:
 *   Lugo: Oviedo + Ourense · Álava: Pamplona + Burgos · Palencia, Zamora: Valladolid ile komşu istasyon · Segovia, Ávila: Soria + Salamanca
 *   Cuenca: Albacete + Teruel · Guadalajara: Madrid + Albacete · Girona: Barcelona · Tarragona: Barcelona + Valencia · Cádiz: Huelva + Málaga
 *  - t: ortalama sıcaklık (°C) · fark: gündüz-gece farkı (°C) · yagis: mm/gün (aylık toplam / ay günü)
 *  - PAR: Ångström (Rs = (0,25 + 0,5·n/N)·Ra), PAR = 0,47·Rs — güneşlenme süresinden (MJ/m²/gün)
 */
import type { IlIklimi } from './iklim';

export type EsRegion = 'España atlántica' | 'Valle del Ebro' | 'Meseta Norte' | 'Meseta Sur' | 'Mediterráneo' | 'Andalucía' | 'Canarias';

export const ES_REGION_PROVINCIAS: Record<EsRegion, string[]> = {
  'España atlántica': ["A Coruña", "Asturias", "Bizkaia", "Cantabria", "Gipuzkoa", "Lugo", "Ourense", "Pontevedra", "Álava"],
  'Meseta Sur': ["Albacete", "Badajoz", "Ciudad Real", "Cuenca", "Cáceres", "Guadalajara", "Madrid", "Toledo"],
  'Mediterráneo': ["Alicante", "Barcelona", "Castellón", "Girona", "Illes Balears", "Murcia", "Tarragona", "Valencia"],
  'Andalucía': ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"],
  'Meseta Norte': ["Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora", "Ávila"],
  'Valle del Ebro': ["Huesca", "La Rioja", "Lleida", "Navarra", "Teruel", "Zaragoza"],
  'Canarias': ["Las Palmas", "Santa Cruz de Tenerife"],
};

/** Alfabetik 50 il (provincia) */
export const PROVINCIAS: string[] = Object.values(ES_REGION_PROVINCIAS)
  .flat()
  .sort((a, b) => a.localeCompare(b, 'es'));

export const ispanyolMu = (il?: string | null) => !!il && PROVINCIAS.includes(il);

/** Bölge eğilimleri (yapay zekâ yorumuna bağlam; İspanyolca, çünkü çoğunlukla İspanyolca arayüzde seçilir) */
export const ES_REGION_INFO: Record<EsRegion, { iklim: string; toprak: string; dikkat: string[] }> = {
  'España atlántica': {
    iklim: 'Clima oceánico: inviernos suaves, veranos templados y lluvia todo el año (900–1.800 mm); en el interior de Galicia (Ourense) los veranos son cálidos y secos.',
    toprak: 'Suelos ácidos (pH 4,5–5,5) sobre granitos y pizarras, lavados por la lluvia, con materia orgánica media-alta pero baja saturación de bases; aluminio cambiable alto en muchos suelos.',
    dikkat: ['Encalado de mantenimiento: el pH baja rápido', 'Carencias de calcio, magnesio, boro y molibdeno en suelos ácidos', 'Lavado de nitratos y potasio con las lluvias de otoño-invierno', 'Encharcamiento y compactación en praderas y maíz forrajero'],
  },
  'Valle del Ebro': {
    iklim: 'Continental mediterráneo semiárido en el centro del valle (300–450 mm), con cierzo seco; más lluvioso hacia el norte (Navarra media, Prepirineo).',
    toprak: 'Suelos calizos (CaCO₃ 20–40 %), pH 8–8,5, a menudo con yeso; en el centro del valle hay suelos salinos y salino-sódicos. Regadíos del Canal de Aragón y Cataluña, Bardenas y Riegos del Alto Aragón.',
    dikkat: ['Clorosis férrica y carencia de zinc en suelos calizos', 'Salinización en regadío con mal drenaje', 'Zonas vulnerables a nitratos: fraccionar el nitrógeno', 'Viento (cierzo) y alta evapotranspiración en verano'],
  },
  'Meseta Norte': {
    iklim: 'Continental: inviernos fríos con heladas hasta mayo, veranos cálidos y secos; 400–600 mm. Campaña de riego corta (mayo–septiembre).',
    toprak: 'Mosaico de suelos: arenosos ácidos en el oeste (Salamanca, Zamora, Ávila), francos y calizos en el centro (Tierra de Campos, páramos). Materia orgánica baja en secano cerealista.',
    dikkat: ['Heladas tardías de primavera', 'Materia orgánica baja y estructura débil en secanos', 'Acidez en suelos arenosos del oeste; caliza en el centro', 'Riego por aspersión y pívot en maíz, remolacha y patata'],
  },
  'Meseta Sur': {
    iklim: 'Mediterráneo continental: veranos muy calurosos y secos, inviernos frescos; 350–500 mm. Extremadura más templada en invierno.',
    toprak: 'La Mancha: suelos calizos y rojos sobre costras calizas, pH 8–8,5, poca profundidad; Vegas del Guadiana (Extremadura): aluviales francos, algunos ácidos en las rañas.',
    dikkat: ['Acuíferos sobreexplotados: el agua de riego es limitante (La Mancha Occidental)', 'Clorosis férrica en viñedo y frutales sobre caliza', 'Golpes de calor en floración y llenado', 'Baja materia orgánica'],
  },
  'Mediterráneo': {
    iklim: 'Mediterráneo: veranos calurosos y húmedos en la costa, otoños con lluvias torrenciales (DANA); 300–600 mm, menos de 300 mm en el sureste (Murcia, Alicante).',
    toprak: 'Suelos calizos de huerta y aluviales, pH 7,8–8,5; en el sureste aguas de riego salinas y suelos con sales. Cítricos, hortalizas, frutales y viñedo de regadío por goteo.',
    dikkat: ['Agua de riego salina (trasvase, pozos): lavado de sales y control de CE', 'Clorosis férrica en cítricos y frutales', 'Zonas vulnerables a nitratos (Mar Menor, Delta del Ebro): limitar y fraccionar el nitrógeno', 'Lluvias torrenciales de otoño: erosión'],
  },
  'Andalucía': {
    iklim: 'Mediterráneo cálido: veranos muy calurosos (valle del Guadalquivir >35 °C), inviernos suaves; 500–700 mm en el valle, menos de 300 mm en Almería.',
    toprak: 'Valle del Guadalquivir: vertisoles (bujeos) arcillosos y fértiles y suelos calizos; olivar en suelos calizos con erosión; Huelva: suelos arenosos ácidos (fresa); Almería: invernaderos sobre enarenado.',
    dikkat: ['Erosión en olivar de pendiente: cubiertas vegetales', 'Arcillas expansivas: grietas y compactación', 'Salinidad en invernaderos de Almería', 'Estrés térmico y déficit hídrico en verano'],
  },
  Canarias: {
    iklim: 'Subtropical oceánico: temperaturas suaves todo el año; costas muy secas (<200 mm), medianías del norte más húmedas por el alisio.',
    toprak: 'Suelos volcánicos (andosoles) jóvenes, a menudo transportados (sorriba); en la costa suelos salinos. Plátano, tomate y subtropicales en regadío.',
    dikkat: ['Agua escasa y a menudo salina o desalada', 'Salinización en plataneras', 'Fijación de fósforo en suelos volcánicos', 'Viento y calima'],
  },
};

/** Bölge bilgisinin ötesinde bilinen il özellikleri (İspanyolca) */
export const ES_PROVINCIA_NOTA: Record<string, string> = {
  Almería: 'Mayor concentración de invernaderos de Europa (Campo de Dalías, Níjar): enarenado, riego por goteo con aguas a menudo salinas; vigilar la CE y el sodio.',
  Huelva: 'Fresa y frutos rojos en suelos arenosos ácidos bajo macrotúnel; acuífero de Doñana protegido, riego muy controlado.',
  Murcia: 'Huerta y Campo de Cartagena: hortalizas y cítricos con aguas del trasvase y desaladas; Mar Menor zona vulnerable a nitratos con límites estrictos.',
  Jaén: 'Primera provincia olivarera del mundo; olivar en suelos calizos con pendiente, riego deficitario por goteo.',
  Córdoba: 'Campiña de vertisoles (cereal, girasol) y olivar; vega del Guadalquivir de regadío.',
  Sevilla: 'Vega y marismas del Guadalquivir: arroz, algodón, maíz y cítricos; vertisoles arcillosos.',
  Valencia: 'Huerta de cítricos y arrozal de la Albufera; suelos calizos, clorosis férrica frecuente.',
  'Ciudad Real': 'La Mancha: viñedo y cereal; acuífero 23 sobreexplotado, derechos de riego limitados.',
  Albacete: 'La Mancha oriental: regadío de cereal, maíz, cebolla y ajo con aguas subterráneas; suelos calizos.',
  Badajoz: 'Vegas del Guadiana: tomate de industria, maíz, frutales y arroz en regadío.',
  Lleida: 'Fruta dulce (manzana, pera, melocotón) y maíz en regadío del Canal d\'Urgell; suelos calizos y algo salinos.',
  Zaragoza: 'Regadío del Ebro: maíz, alfalfa y frutales; suelos calizos y yesosos, salinidad en zonas mal drenadas.',
  'La Rioja': 'Viñedo de calidad y hortalizas; suelos arcillo-calizos.',
  Navarra: 'Ribera del Ebro: hortalizas y maíz de regadío; Navarra media cerealista.',
  Valladolid: 'Tierra de Campos y Duero: cereal de secano, remolacha y maíz de regadío; viñedo de Ribera del Duero y Rueda.',
  'A Coruña': 'Praderas y maíz forrajero para vacuno de leche; suelos ácidos, encalado necesario.',
};

/** Serbest metinde geçen ili bulur */
export function provinciaBul(metin?: string | null): string | undefined {
  if (!metin) return undefined;
  const t = metin.toLocaleLowerCase('es-ES');
  return [...PROVINCIAS].sort((a, b) => b.length - a.length).find((x) => t.includes(x.toLocaleLowerCase('es-ES')));
}

export const ES_IKLIM: Record<string, IlIklimi> = {
  'A Coruña': { enlem: 43.37, t: [10.65, 10.85, 12.1, 13.0, 15.0, 17.25, 19.05, 19.6, 18.6, 16.2, 13.2, 11.3], fark: [5.5, 6.3, 7.0, 6.8, 6.8, 6.7, 6.7, 7.0, 7.2, 6.8, 6.0, 5.6], yagis: [3.65, 3.32, 2.74, 2.93, 2.39, 1.47, 1.1, 1.16, 2.3, 4.16, 4.5, 4.65] },
  'Albacete': { enlem: 38.99, t: [3.9, 5.45, 8.35, 10.7, 14.85, 20.15, 23.85, 23.5, 19.35, 13.55, 8.05, 4.75], fark: [11.4, 12.7, 14.1, 13.8, 14.3, 15.7, 16.7, 16.2, 14.9, 12.7, 10.9, 10.1], yagis: [0.84, 0.93, 0.9, 1.33, 1.45, 0.93, 0.26, 0.39, 1.2, 1.45, 1.27, 1.16] },
  'Alicante': { enlem: 38.35, t: [11.5, 12.3, 14.1, 16.0, 19.1, 22.85, 25.65, 26.05, 23.5, 19.5, 15.25, 12.2], fark: [10.6, 10.8, 11.0, 10.8, 10.4, 10.3, 10.3, 10.3, 10.8, 10.8, 10.5, 10.4], yagis: [0.71, 0.93, 0.84, 1.0, 1.06, 0.57, 0.19, 0.26, 1.57, 1.68, 1.47, 0.81] },
  'Almería': { enlem: 36.84, t: [12.65, 13.05, 14.8, 16.4, 19.1, 22.75, 25.6, 26.2, 24.1, 20.35, 16.55, 13.7], fark: [8.5, 8.3, 8.4, 8.4, 8.0, 7.7, 8.0, 7.8, 8.0, 8.1, 8.1, 8.2], yagis: [0.77, 0.75, 0.58, 0.7, 0.39, 0.13, 0.0, 0.13, 0.43, 0.74, 1.03, 0.84] },
  'Asturias': { enlem: 43.36, t: [7.85, 8.35, 9.95, 11.05, 13.8, 16.65, 18.4, 18.7, 17.15, 14.15, 10.35, 8.5], fark: [8.1, 9.1, 10.1, 9.5, 9.6, 9.7, 9.4, 9.8, 10.5, 9.7, 8.7, 8.0], yagis: [2.61, 2.75, 2.39, 3.17, 2.48, 1.67, 1.42, 1.68, 2.07, 2.97, 3.6, 3.16] },
  'Badajoz': { enlem: 38.88, t: [8.45, 10.2, 13.1, 14.85, 18.55, 23.45, 25.9, 25.75, 22.9, 17.7, 12.4, 9.35], fark: [9.9, 11.2, 13.0, 12.9, 14.1, 15.7, 17.0, 16.7, 14.6, 12.2, 10.6, 9.3], yagis: [1.48, 1.32, 0.94, 1.43, 1.23, 0.5, 0.13, 0.13, 0.8, 1.65, 2.0, 2.06] },
  'Barcelona': { enlem: 41.39, t: [8.9, 9.75, 11.55, 13.5, 17.0, 20.8, 23.75, 24.35, 21.4, 17.35, 12.65, 9.6], fark: [9.0, 9.1, 9.1, 9.0, 8.6, 8.4, 8.3, 8.5, 9.0, 9.3, 9.1, 9.0], yagis: [1.32, 1.04, 1.35, 1.63, 1.9, 1.4, 0.65, 1.97, 2.83, 2.94, 1.93, 1.29] },
  'Bizkaia': { enlem: 43.26, t: [9.2, 9.65, 11.5, 12.85, 15.8, 18.65, 20.8, 21.15, 19.25, 16.25, 11.95, 9.65], fark: [8.4, 9.7, 10.6, 10.3, 10.4, 10.5, 10.2, 10.3, 10.9, 10.3, 8.9, 8.3], yagis: [4.06, 3.46, 3.03, 4.13, 2.87, 2.13, 2.0, 2.65, 2.47, 3.9, 4.7, 3.74] },
  'Burgos': { enlem: 42.34, t: [2.6, 3.7, 6.3, 8.2, 11.85, 16.35, 19.6, 19.55, 16.1, 11.15, 6.05, 3.35], fark: [8.4, 10.0, 11.8, 11.6, 12.3, 14.1, 15.6, 15.3, 13.6, 10.5, 8.7, 7.7], yagis: [1.52, 1.29, 1.03, 1.83, 2.03, 1.4, 0.74, 0.77, 1.1, 1.77, 2.07, 1.94] },
  'Cantabria': { enlem: 43.46, t: [10.25, 10.25, 11.7, 12.8, 15.4, 18.05, 20.1, 20.45, 18.9, 16.4, 12.8, 10.95], fark: [6.7, 7.3, 7.8, 7.4, 7.4, 7.3, 7.2, 7.3, 8.0, 7.8, 7.2, 6.7], yagis: [3.42, 3.29, 3.06, 3.27, 2.45, 1.87, 1.68, 2.32, 2.83, 3.87, 4.67, 3.77] },
  'Castellón': { enlem: 39.99, t: [11.75, 12.45, 14.45, 16.1, 19.1, 22.95, 25.65, 26.1, 23.5, 19.6, 15.15, 12.35], fark: [9.3, 9.3, 9.7, 9.4, 8.6, 8.3, 8.1, 8.2, 9.0, 9.4, 9.3, 8.9], yagis: [1.19, 1.29, 1.06, 1.27, 1.26, 0.73, 0.26, 0.65, 2.33, 2.48, 1.57, 1.55] },
  'Ciudad Real': { enlem: 38.99, t: [5.45, 7.15, 10.1, 12.2, 16.3, 21.85, 25.6, 25.25, 20.85, 14.9, 9.3, 6.1], fark: [9.7, 11.1, 12.8, 12.8, 13.4, 14.9, 16.0, 15.7, 13.9, 11.4, 10.0, 9.0], yagis: [1.29, 1.29, 0.97, 1.43, 1.45, 0.8, 0.29, 0.29, 0.8, 1.58, 1.67, 1.77] },
  'Cuenca': { enlem: 40.07, t: [3.2, 4.58, 7.38, 9.75, 13.82, 18.98, 22.48, 22.1, 18.12, 12.47, 7.03, 3.97], fark: [11.6, 12.65, 14.05, 13.9, 14.35, 15.85, 16.85, 16.2, 14.75, 12.55, 11.25, 10.45], yagis: [0.71, 0.75, 0.79, 1.33, 1.53, 1.13, 0.52, 0.68, 1.1, 1.31, 1.03, 0.94] },
  'Cáceres': { enlem: 39.47, t: [8.0, 9.55, 12.25, 13.65, 17.6, 23.05, 26.6, 26.25, 22.6, 16.8, 11.6, 8.7], fark: [7.8, 8.9, 10.7, 10.9, 12.0, 13.5, 14.6, 14.3, 12.0, 9.6, 8.2, 7.4], yagis: [1.52, 1.43, 1.0, 1.73, 1.45, 0.6, 0.16, 0.23, 0.87, 2.03, 2.03, 2.26] },
  'Cádiz': { enlem: 36.53, t: [11.68, 12.65, 14.55, 16.1, 19.0, 22.65, 25.45, 25.77, 23.4, 19.42, 15.38, 12.65], fark: [9.65, 9.8, 10.5, 10.4, 10.5, 10.8, 11.2, 10.95, 10.4, 9.75, 9.35, 9.1], yagis: [2.02, 1.86, 1.39, 1.37, 0.68, 0.23, 0.03, 0.11, 0.65, 1.68, 2.77, 2.9] },
  'Córdoba': { enlem: 37.89, t: [9.35, 11.1, 14.0, 16.05, 19.9, 24.9, 28.35, 28.25, 24.5, 19.25, 13.75, 10.5], fark: [11.3, 12.2, 13.6, 13.5, 14.2, 15.6, 17.1, 16.7, 14.6, 12.7, 11.3, 10.2], yagis: [2.1, 2.07, 1.32, 1.9, 1.26, 0.37, 0.06, 0.16, 0.83, 2.16, 2.53, 3.06] },
  'Gipuzkoa': { enlem: 43.31, t: [9.2, 9.65, 11.5, 12.85, 15.8, 18.65, 20.8, 21.15, 19.25, 16.25, 11.95, 9.65], fark: [8.4, 9.7, 10.6, 10.3, 10.4, 10.5, 10.2, 10.3, 10.9, 10.3, 8.9, 8.3], yagis: [4.06, 3.46, 3.03, 4.13, 2.87, 2.13, 2.0, 2.65, 2.47, 3.9, 4.7, 3.74] },
  'Girona': { enlem: 41.98, t: [8.9, 9.75, 11.55, 13.5, 17.0, 20.8, 23.75, 24.35, 21.4, 17.35, 12.65, 9.6], fark: [9.0, 9.1, 9.1, 9.0, 8.6, 8.4, 8.3, 8.5, 9.0, 9.3, 9.1, 9.0], yagis: [1.32, 1.04, 1.35, 1.63, 1.9, 1.4, 0.65, 1.97, 2.83, 2.94, 1.93, 1.29] },
  'Granada': { enlem: 37.18, t: [6.6, 8.2, 11.0, 12.9, 16.8, 22.15, 25.4, 25.15, 21.25, 15.8, 10.6, 7.6], fark: [12.2, 13.0, 14.4, 14.0, 14.8, 16.5, 17.6, 17.1, 15.3, 13.4, 12.0, 11.0], yagis: [1.29, 1.29, 1.06, 1.4, 1.06, 0.4, 0.1, 0.13, 0.67, 1.29, 1.7, 1.84] },
  'Guadalajara': { enlem: 40.63, t: [5.07, 6.65, 9.8, 11.82, 15.8, 21.15, 24.7, 24.28, 20.12, 14.3, 8.97, 5.78], fark: [9.25, 10.5, 12.1, 12.15, 12.6, 13.9, 14.9, 14.35, 12.95, 10.7, 9.05, 8.25], yagis: [0.95, 1.09, 0.85, 1.42, 1.55, 0.82, 0.32, 0.35, 0.97, 1.69, 1.6, 1.34] },
  'Huelva': { enlem: 37.26, t: [11.2, 12.4, 14.5, 16.0, 18.8, 22.5, 25.3, 25.4, 23.2, 19.3, 15.0, 12.2], fark: [10.0, 10.4, 11.4, 11.2, 11.2, 11.8, 12.6, 12.4, 11.2, 10.2, 9.6, 9.2], yagis: [1.81, 1.68, 1.29, 1.4, 0.71, 0.23, 0.03, 0.06, 0.57, 1.48, 2.43, 2.74] },
  'Huesca': { enlem: 42.14, t: [4.2, 6.15, 9.1, 11.35, 15.45, 19.9, 23.2, 22.9, 19.1, 14.0, 8.15, 4.8], fark: [9.4, 11.5, 13.0, 12.7, 13.3, 14.2, 15.2, 14.6, 13.0, 10.8, 9.1, 8.4], yagis: [1.19, 1.07, 1.1, 1.7, 1.84, 1.4, 0.77, 1.03, 1.6, 1.65, 1.57, 1.39] },
  'Illes Balears': { enlem: 39.57, t: [10.1, 10.2, 12.0, 14.0, 17.7, 21.8, 24.8, 25.4, 22.6, 18.9, 14.4, 11.5], fark: [10.6, 10.8, 11.2, 11.2, 11.4, 11.6, 12.0, 11.6, 10.8, 10.6, 10.4, 10.2], yagis: [1.29, 1.21, 0.97, 1.33, 1.16, 0.4, 0.19, 0.65, 1.6, 2.06, 1.87, 1.42] },
  'Jaén': { enlem: 37.77, t: [8.8, 10.3, 13.05, 14.75, 18.75, 24.2, 28.0, 27.8, 23.6, 17.8, 12.55, 9.4], fark: [7.6, 8.2, 9.5, 9.7, 10.5, 11.6, 12.4, 12.0, 10.4, 8.8, 7.7, 7.2], yagis: [1.94, 2.07, 1.48, 1.83, 1.23, 0.43, 0.1, 0.23, 0.87, 1.84, 2.5, 2.81] },
  'La Rioja': { enlem: 42.47, t: [5.65, 6.9, 9.75, 11.65, 15.25, 19.55, 22.45, 22.35, 18.7, 14.0, 8.9, 6.0], fark: [8.5, 10.2, 11.9, 11.9, 12.5, 13.7, 14.5, 14.1, 12.6, 10.2, 8.6, 7.8], yagis: [0.87, 0.82, 0.77, 1.53, 1.55, 1.33, 0.9, 0.61, 0.8, 1.19, 1.27, 1.06] },
  'Las Palmas': { enlem: 28.1, t: [17.9, 18.05, 18.9, 19.4, 20.4, 21.9, 23.15, 23.85, 23.65, 22.55, 20.75, 18.9], fark: [5.8, 6.1, 6.4, 6.2, 6.0, 6.0, 5.9, 5.7, 5.7, 5.9, 5.7, 5.8], yagis: [0.42, 0.54, 0.42, 0.2, 0.06, 0.0, 0.0, 0.0, 0.2, 0.42, 0.5, 0.87] },
  'León': { enlem: 42.6, t: [2.25, 3.8, 6.55, 8.45, 12.0, 16.7, 19.6, 19.2, 15.85, 11.0, 6.05, 3.2], fark: [9.9, 11.2, 12.7, 12.3, 12.8, 14.6, 16.0, 15.6, 13.9, 11.2, 9.9, 8.8], yagis: [1.65, 1.43, 1.06, 1.67, 1.9, 1.13, 0.65, 0.71, 1.1, 1.9, 2.1, 2.13] },
  'Lleida': { enlem: 41.62, t: [4.5, 6.9, 10.5, 13.35, 17.6, 21.9, 24.95, 24.45, 20.3, 15.0, 8.85, 4.75], fark: [10.6, 13.4, 15.0, 14.9, 15.2, 15.8, 16.3, 15.7, 14.6, 12.8, 10.9, 9.1], yagis: [0.65, 0.54, 0.68, 1.27, 1.55, 1.0, 0.42, 0.68, 1.33, 1.29, 0.93, 0.71] },
  'Lugo': { enlem: 43.01, t: [7.62, 8.6, 10.68, 12.05, 15.03, 18.43, 20.68, 20.75, 18.6, 14.68, 10.5, 8.22], fark: [9.05, 10.5, 12.15, 11.7, 12.15, 12.75, 13.15, 13.4, 13.1, 11.05, 9.5, 8.35], yagis: [2.97, 2.75, 2.19, 2.85, 2.26, 1.37, 1.03, 1.23, 1.85, 3.15, 3.67, 3.53] },
  'Madrid': { enlem: 40.42, t: [6.25, 7.85, 11.25, 12.95, 16.75, 22.15, 25.55, 25.05, 20.9, 15.05, 9.9, 6.8], fark: [7.1, 8.3, 10.1, 10.5, 10.9, 12.1, 13.1, 12.5, 11.0, 8.7, 7.2, 6.4], yagis: [1.06, 1.25, 0.81, 1.5, 1.65, 0.7, 0.39, 0.32, 0.73, 1.94, 1.93, 1.52] },
  'Murcia': { enlem: 37.99, t: [10.65, 11.85, 14.55, 16.8, 20.4, 24.75, 27.65, 27.8, 24.5, 19.65, 14.75, 11.4], fark: [11.9, 12.5, 13.3, 13.6, 13.6, 13.7, 14.1, 13.6, 13.0, 12.1, 11.7, 11.2], yagis: [0.68, 0.89, 0.77, 0.9, 1.03, 0.4, 0.06, 0.26, 1.07, 1.29, 1.07, 0.71] },
  'Málaga': { enlem: 36.72, t: [12.15, 12.9, 14.6, 16.2, 19.2, 22.8, 25.6, 26.15, 23.6, 19.55, 15.75, 13.1], fark: [9.3, 9.2, 9.6, 9.6, 9.8, 9.8, 9.8, 9.5, 9.6, 9.3, 9.1, 9.0], yagis: [2.23, 2.04, 1.48, 1.33, 0.65, 0.23, 0.03, 0.16, 0.73, 1.87, 3.1, 3.06] },
  'Navarra': { enlem: 42.81, t: [5.2, 6.35, 9.0, 10.8, 14.35, 18.6, 21.4, 21.55, 18.25, 13.75, 8.55, 5.7], fark: [7.6, 9.5, 11.2, 11.2, 11.9, 13.4, 14.0, 13.9, 12.7, 10.3, 8.1, 7.2], yagis: [1.94, 1.82, 1.65, 2.23, 1.97, 1.43, 1.13, 1.16, 1.27, 2.13, 2.47, 2.32] },
  'Ourense': { enlem: 42.34, t: [7.4, 8.85, 11.4, 13.05, 16.25, 20.2, 22.95, 22.8, 20.05, 15.2, 10.65, 7.95], fark: [10.0, 11.9, 14.2, 13.9, 14.7, 15.8, 16.9, 17.0, 15.7, 12.4, 10.3, 8.7], yagis: [3.32, 2.75, 2.0, 2.53, 2.03, 1.07, 0.65, 0.77, 1.63, 3.32, 3.73, 3.9] },
  'Palencia': { enlem: 42.01, t: [3.23, 4.55, 7.38, 9.25, 12.9, 17.55, 20.68, 20.52, 16.98, 11.97, 6.77, 3.98], fark: [8.35, 10.4, 12.35, 12.2, 12.8, 14.7, 16.15, 15.75, 13.95, 10.85, 8.85, 7.65], yagis: [1.4, 1.16, 0.89, 1.58, 1.81, 1.13, 0.56, 0.66, 1.08, 1.73, 1.88, 1.81] },
  'Pontevedra': { enlem: 42.43, t: [10.65, 10.85, 12.1, 13.0, 15.0, 17.25, 19.05, 19.6, 18.6, 16.2, 13.2, 11.3], fark: [5.5, 6.3, 7.0, 6.8, 6.8, 6.7, 6.7, 7.0, 7.2, 6.8, 6.0, 5.6], yagis: [3.65, 3.32, 2.74, 2.93, 2.39, 1.47, 1.1, 1.16, 2.3, 4.16, 4.5, 4.65] },
  'Salamanca': { enlem: 40.97, t: [3.7, 5.45, 8.2, 10.2, 13.9, 18.75, 21.7, 21.2, 17.75, 12.65, 7.35, 4.55], fark: [10.0, 12.1, 14.0, 13.6, 14.2, 16.1, 17.4, 17.2, 15.3, 12.1, 10.3, 8.9], yagis: [0.97, 0.86, 0.61, 1.23, 1.48, 0.93, 0.42, 0.39, 1.0, 1.48, 1.4, 1.35] },
  'Santa Cruz de Tenerife': { enlem: 28.47, t: [18.2, 18.25, 19.0, 19.6, 20.9, 22.8, 24.85, 25.45, 24.65, 23.05, 21.05, 19.25], fark: [5.6, 5.9, 6.2, 6.2, 6.4, 6.8, 7.7, 7.1, 6.9, 6.5, 6.1, 5.7], yagis: [1.03, 1.25, 1.23, 0.4, 0.1, 0.03, 0.0, 0.06, 0.23, 0.61, 1.13, 1.39] },
  'Segovia': { enlem: 40.95, t: [3.2, 4.58, 7.2, 9.2, 12.93, 17.85, 20.98, 20.62, 17.05, 11.93, 6.7, 3.95], fark: [9.7, 11.45, 13.2, 13.0, 13.55, 15.5, 16.85, 16.55, 14.7, 11.65, 9.9, 8.7], yagis: [1.13, 1.07, 0.92, 1.48, 1.81, 1.23, 0.63, 0.65, 1.13, 1.58, 1.57, 1.52] },
  'Sevilla': { enlem: 37.39, t: [10.85, 12.5, 15.55, 17.25, 20.8, 25.25, 27.95, 28.05, 25.0, 20.4, 15.4, 11.9], fark: [10.3, 11.0, 12.3, 12.3, 12.8, 13.9, 14.7, 14.5, 12.8, 11.2, 10.2, 9.4], yagis: [2.13, 1.86, 1.35, 1.7, 0.97, 0.3, 0.06, 0.19, 0.87, 2.0, 2.83, 3.13] },
  'Soria': { enlem: 41.76, t: [2.7, 3.7, 6.2, 8.2, 11.95, 16.95, 20.25, 20.05, 16.35, 11.2, 6.05, 3.35], fark: [9.4, 10.8, 12.4, 12.4, 12.9, 14.9, 16.3, 15.9, 14.1, 11.2, 9.5, 8.5], yagis: [1.29, 1.29, 1.23, 1.73, 2.13, 1.53, 0.84, 0.9, 1.27, 1.68, 1.73, 1.68] },
  'Tarragona': { enlem: 41.12, t: [10.32, 11.1, 13.0, 14.8, 18.05, 21.88, 24.7, 25.23, 22.45, 18.48, 13.9, 10.97], fark: [9.15, 9.2, 9.4, 9.2, 8.6, 8.35, 8.2, 8.35, 9.0, 9.35, 9.2, 8.95], yagis: [1.26, 1.16, 1.21, 1.45, 1.58, 1.07, 0.45, 1.31, 2.58, 2.71, 1.75, 1.42] },
  'Teruel': { enlem: 40.34, t: [2.5, 3.7, 6.4, 8.8, 12.8, 17.8, 21.1, 20.7, 16.9, 11.4, 6.0, 3.2], fark: [11.8, 12.6, 14.0, 14.0, 14.4, 16.0, 17.0, 16.2, 14.6, 12.4, 11.6, 10.8], yagis: [0.58, 0.57, 0.68, 1.33, 1.61, 1.33, 0.77, 0.97, 1.0, 1.16, 0.8, 0.71] },
  'Toledo': { enlem: 39.86, t: [6.55, 8.3, 11.55, 13.5, 17.65, 22.9, 26.45, 26.05, 21.75, 15.8, 10.3, 7.1], fark: [9.9, 11.4, 12.9, 13.0, 13.9, 15.2, 16.3, 15.9, 13.7, 11.2, 9.8, 9.0], yagis: [0.87, 0.93, 0.71, 1.33, 1.39, 0.7, 0.26, 0.26, 0.6, 1.42, 1.27, 1.35] },
  'Valencia': { enlem: 39.47, t: [11.75, 12.45, 14.45, 16.1, 19.1, 22.95, 25.65, 26.1, 23.5, 19.6, 15.15, 12.35], fark: [9.3, 9.3, 9.7, 9.4, 8.6, 8.3, 8.1, 8.2, 9.0, 9.4, 9.3, 8.9], yagis: [1.19, 1.29, 1.06, 1.27, 1.26, 0.73, 0.26, 0.65, 2.33, 2.48, 1.57, 1.55] },
  'Valladolid': { enlem: 41.65, t: [3.85, 5.4, 8.45, 10.3, 13.95, 18.75, 21.75, 21.5, 17.85, 12.8, 7.5, 4.6], fark: [8.3, 10.8, 12.9, 12.8, 13.3, 15.3, 16.7, 16.2, 14.3, 11.2, 9.0, 7.6], yagis: [1.29, 1.04, 0.74, 1.33, 1.58, 0.87, 0.39, 0.55, 1.07, 1.68, 1.7, 1.68] },
  'Zamora': { enlem: 41.5, t: [3.77, 5.42, 8.33, 10.25, 13.93, 18.75, 21.73, 21.35, 17.8, 12.72, 7.42, 4.57], fark: [9.15, 11.45, 13.45, 13.2, 13.75, 15.7, 17.05, 16.7, 14.8, 11.65, 9.65, 8.25], yagis: [1.13, 0.95, 0.68, 1.28, 1.53, 0.9, 0.4, 0.47, 1.03, 1.58, 1.55, 1.52] },
  'Zaragoza': { enlem: 41.65, t: [6.4, 8.2, 11.5, 13.9, 18.15, 22.75, 25.75, 25.5, 21.35, 16.1, 10.25, 6.85], fark: [8.4, 10.4, 11.8, 11.8, 12.5, 13.3, 14.1, 13.2, 11.5, 9.8, 8.3, 7.5], yagis: [0.68, 0.75, 0.61, 1.3, 1.42, 1.03, 0.58, 0.55, 1.0, 0.97, 1.0, 0.71] },
  'Álava': { enlem: 42.85, t: [3.9, 5.02, 7.65, 9.5, 13.1, 17.48, 20.5, 20.55, 17.18, 12.45, 7.3, 4.53], fark: [8.0, 9.75, 11.5, 11.4, 12.1, 13.75, 14.8, 14.6, 13.15, 10.4, 8.4, 7.45], yagis: [1.73, 1.55, 1.34, 2.03, 2.0, 1.42, 0.94, 0.97, 1.18, 1.95, 2.27, 2.13] },
  'Ávila': { enlem: 40.66, t: [3.2, 4.58, 7.2, 9.2, 12.93, 17.85, 20.98, 20.62, 17.05, 11.93, 6.7, 3.95], fark: [9.7, 11.45, 13.2, 13.0, 13.55, 15.5, 16.85, 16.55, 14.7, 11.65, 9.9, 8.7], yagis: [1.13, 1.07, 0.92, 1.48, 1.81, 1.23, 0.63, 0.65, 1.13, 1.58, 1.57, 1.52] },
};

/** Ocak → Aralık, MJ/m²/gün PAR (Ångström: güneşlenme süresinden) */
export const ES_PAR: Record<string, number[]> = {
  'A Coruña': [2.58, 3.85, 5.65, 7.62, 9.16, 10.1, 10.23, 9.38, 6.86, 4.54, 2.91, 2.27],
  'Albacete': [3.68, 5.26, 6.98, 9.08, 10.83, 12.12, 12.61, 11.24, 8.57, 5.96, 4.04, 3.25],
  'Alicante': [4.23, 5.68, 7.33, 9.32, 10.79, 11.74, 12.12, 10.91, 8.52, 6.19, 4.49, 3.7],
  'Almería': [4.53, 5.93, 7.73, 9.57, 11.27, 12.06, 12.38, 11.15, 8.8, 6.54, 4.78, 3.98],
  'Asturias': [2.59, 3.76, 5.29, 6.84, 8.2, 8.61, 8.63, 7.91, 6.26, 4.41, 2.87, 2.24],
  'Badajoz': [3.77, 5.28, 7.16, 9.4, 11.03, 12.26, 12.75, 11.64, 8.82, 6.08, 4.18, 3.34],
  'Barcelona': [3.37, 4.77, 6.6, 8.45, 9.72, 10.7, 10.98, 9.66, 7.51, 5.47, 3.69, 2.99],
  'Bizkaia': [2.46, 3.69, 5.4, 6.97, 8.46, 9.13, 9.15, 8.28, 6.49, 4.46, 2.74, 2.16],
  'Burgos': [2.73, 4.31, 6.28, 8.25, 9.99, 11.38, 12.09, 10.7, 7.85, 5.03, 3.13, 2.35],
  'Cantabria': [2.44, 3.67, 5.28, 6.83, 8.2, 8.74, 8.95, 8.03, 6.3, 4.35, 2.72, 2.11],
  'Castellón': [3.78, 5.23, 6.82, 8.81, 10.18, 11.02, 11.38, 10.02, 7.65, 5.74, 4.07, 3.27],
  'Ciudad Real': [3.68, 5.17, 7.15, 9.02, 10.76, 12.25, 12.75, 11.44, 8.69, 5.96, 4.0, 3.18],
  'Cuenca': [3.58, 5.12, 6.94, 8.96, 10.6, 11.88, 12.29, 10.9, 8.33, 5.83, 3.92, 3.15],
  'Cáceres': [3.7, 5.2, 7.09, 9.35, 11.0, 12.23, 12.72, 11.59, 8.75, 6.0, 4.1, 3.26],
  'Cádiz': [4.41, 5.82, 7.48, 9.46, 11.25, 12.21, 12.53, 11.37, 8.89, 6.53, 4.76, 3.95],
  'Córdoba': [4.14, 5.64, 7.39, 9.23, 11.08, 12.43, 12.8, 11.59, 8.81, 6.3, 4.47, 3.58],
  'Gipuzkoa': [2.46, 3.68, 5.4, 6.96, 8.46, 9.13, 9.14, 8.28, 6.48, 4.46, 2.74, 2.16],
  'Girona': [3.3, 4.7, 6.54, 8.4, 9.68, 10.68, 10.95, 9.62, 7.45, 5.39, 3.62, 2.91],
  'Granada': [4.24, 5.69, 7.52, 9.41, 10.98, 12.39, 12.77, 11.58, 8.94, 6.39, 4.57, 3.71],
  'Guadalajara': [3.47, 4.96, 6.82, 8.88, 10.54, 11.95, 12.43, 11.07, 8.39, 5.71, 3.77, 2.98],
  'Huelva': [4.39, 5.87, 7.57, 9.54, 11.38, 12.32, 12.7, 11.51, 9.0, 6.49, 4.72, 3.85],
  'Huesca': [3.07, 4.63, 6.57, 8.51, 10.19, 11.32, 11.78, 10.47, 7.87, 5.37, 3.38, 2.6],
  'Illes Balears': [3.76, 5.19, 6.86, 8.84, 10.73, 11.7, 12.06, 10.81, 7.93, 5.79, 4.01, 3.25],
  'Jaén': [4.16, 5.66, 7.4, 9.24, 11.09, 12.44, 12.81, 11.6, 8.82, 6.32, 4.49, 3.59],
  'La Rioja': [2.82, 4.38, 6.43, 8.24, 9.98, 11.18, 11.51, 10.2, 7.73, 5.19, 3.19, 2.43],
  'Las Palmas': [5.62, 6.97, 8.44, 9.73, 10.72, 11.09, 10.95, 10.48, 8.89, 7.23, 5.83, 5.14],
  'León': [2.91, 4.53, 6.41, 8.47, 10.04, 11.56, 12.08, 10.68, 7.82, 5.13, 3.25, 2.48],
  'Lleida': [3.06, 4.92, 6.95, 9.04, 10.61, 11.61, 12.01, 10.52, 7.99, 5.63, 3.59, 2.66],
  'Lugo': [2.56, 3.84, 5.64, 7.29, 8.8, 9.63, 9.86, 8.98, 6.84, 4.58, 2.93, 2.23],
  'Madrid': [3.5, 4.9, 6.88, 8.84, 10.35, 11.86, 12.34, 11.06, 8.41, 5.69, 3.74, 2.94],
  'Murcia': [4.17, 5.58, 7.26, 9.22, 10.88, 11.76, 12.13, 10.94, 8.38, 6.09, 4.42, 3.64],
  'Málaga': [4.3, 5.65, 7.29, 9.32, 11.07, 12.07, 12.32, 11.16, 8.69, 6.45, 4.67, 3.92],
  'Navarra': [2.58, 3.99, 5.86, 7.6, 9.38, 10.38, 10.84, 9.67, 7.25, 4.74, 2.97, 2.21],
  'Ourense': [2.56, 3.96, 6.02, 7.76, 9.41, 10.66, 11.12, 10.08, 7.46, 4.8, 3.02, 2.26],
  'Palencia': [2.81, 4.46, 6.45, 8.46, 10.2, 11.62, 12.21, 10.86, 8.03, 5.2, 3.26, 2.4],
  'Pontevedra': [2.69, 3.95, 5.75, 7.69, 9.21, 10.14, 10.28, 9.46, 6.95, 4.65, 3.01, 2.38],
  'Salamanca': [3.1, 4.83, 6.87, 8.85, 10.45, 11.9, 12.57, 11.26, 8.35, 5.57, 3.59, 2.67],
  'Santa Cruz de Tenerife': [5.47, 6.76, 8.22, 9.57, 11.0, 11.65, 12.13, 11.5, 9.19, 7.3, 5.68, 5.0],
  'Segovia': [3.05, 4.7, 6.68, 8.61, 10.26, 11.67, 12.34, 11.05, 8.18, 5.43, 3.48, 2.64],
  'Sevilla': [4.41, 5.85, 7.67, 9.59, 11.37, 12.45, 12.69, 11.5, 8.86, 6.47, 4.71, 3.75],
  'Soria': [2.9, 4.46, 6.4, 8.29, 10.02, 11.41, 12.07, 10.76, 7.92, 5.19, 3.27, 2.51],
  'Tarragona': [3.52, 4.94, 6.66, 8.59, 9.93, 10.84, 11.16, 9.81, 7.54, 5.55, 3.82, 3.07],
  'Teruel': [3.58, 5.09, 6.99, 8.91, 10.42, 11.67, 12.02, 10.62, 8.19, 5.79, 3.91, 3.15],
  'Toledo': [3.57, 5.06, 7.05, 8.95, 10.71, 12.22, 12.7, 11.36, 8.59, 5.85, 3.89, 3.07],
  'Valencia': [3.85, 5.29, 6.87, 8.85, 10.21, 11.04, 11.4, 10.06, 7.71, 5.81, 4.14, 3.33],
  'Valladolid': [2.88, 4.61, 6.63, 8.67, 10.41, 11.87, 12.33, 11.02, 8.21, 5.39, 3.4, 2.46],
  'Zamora': [2.97, 4.69, 6.72, 8.75, 10.42, 11.88, 12.44, 11.12, 8.26, 5.45, 3.47, 2.54],
  'Zaragoza': [3.2, 4.79, 6.79, 8.79, 10.48, 11.48, 11.94, 10.64, 8.1, 5.62, 3.59, 2.76],
  'Álava': [2.63, 4.12, 6.04, 7.9, 9.67, 10.87, 11.45, 10.16, 7.52, 4.85, 3.02, 2.25],
  'Ávila': [3.08, 4.73, 6.71, 8.63, 10.28, 11.69, 12.36, 11.07, 8.21, 5.46, 3.52, 2.67],
};
