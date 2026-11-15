#!/usr/bin/env python3
"""public/atlas/index.html içindeki atlas verisinden (const D) public/atlas/program.json üretir.
Kullanım: python3 scripts/atlas-program.py   (proje kökünden)
Çıktı: urun, nasil, basliklar, bitki (dönem programı + q/kirec nitelikleri), toprak (5 toprak tipi düzeltmesi)."""
import json, sys, os
kok = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
h = open(os.path.join(kok, 'public/atlas/index.html'), encoding='utf-8').read()
D, _ = json.JSONDecoder().raw_decode(h[h.index('{', h.find('const D =')):])
eski = json.load(open(os.path.join(kok, 'public/atlas/program.json'), encoding='utf-8'))
BITKILER = sorted(eski['bitki'])  # rapordaki bitkiler + Avrupa listesi (35)

kodlar = set()
bitki = {}
for k in BITKILER:
    c = D['crops'][k]
    evreler = []
    for st in c['stages']:
        P = {}
        for mod, p in st['P'].items():
            u = []
            for col in p['apps']:
                s = []
                for it in col:
                    if it['p'] not in D['P']:
                        continue  # atlasın kendisi de çizmez (tanımsız ürün kodu)
                    kodlar.add(it['p'])
                    s.append([it['p'], it.get('d'), it.get('n') or None, 1 if it.get('alt') else 0])
                u.append(s)
            P[mod] = {'u': u, 'not': [p['note'][0], p['note'][1]] if p.get('note') else None}
        evreler.append({'ad': [st['name'][0], st['name'][1]], 'bbch': st.get('bbch'), 'P': P})
    bitki[k] = {'modlar': c['modes'], 'q': c['attr']['q'], 'kirec': c['attr'].get('lime', 0), 'evreler': evreler}

toprak = {}
for s in D['soils']:
    for x in list(s['sub'].keys()) + [v for v in s['sub'].values() if v] + [a['p'] for a in s['add']] + [p['p'] for p in s['pre']]:
        kodlar.add(x)
    toprak[s['id']] = {
        'ad': [s['name'][0], s['name'][1]],
        'on': [{**{k: v for k, v in p.items() if k not in ('t', 'alt')}, 'alt': 1 if p.get('alt') else 0, 't': [p['t'][0], p['t'][1]]} for p in s['pre']],
        'yerine': s['sub'], 'carpan': s['mult'], 'ek': s['add'],
    }

urun = {k: [D['P'][k]['n'][0], D['P'][k]['n'][1], D['P'][k]['s']] for k in sorted(kodlar) if k in D['P']}
nasil = {k: [v[0], v[1]] for k, v in D['N'].items()}
basliklar = {m: [v[0], v[1]] for m, v in D['HEADS'].items()}
cikti = {'urun': urun, 'nasil': nasil, 'basliklar': basliklar, 'toprak': toprak, 'bitki': bitki}
json.dump(cikti, open(os.path.join(kok, 'public/atlas/program.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(bitki), 'bitki ·', len(urun), 'ürün ·', len(toprak), 'toprak tipi')
