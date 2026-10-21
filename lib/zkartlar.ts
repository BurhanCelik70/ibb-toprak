/**
 * İGSAŞ Z-kartları (23 bitki) – "İGSAŞ Azərbaycan · dönem dönem infografik seti"
 * (Prof. Dr. Metin Turan, Yeditepe Üniversitesi · İGSAŞ & KIANA) PDF'inden çıkarıldı.
 * Dozlar dekar (da) başınadır. Bu dosya otomatik üretildi; elle düzeltme yapılabilir.
 * "hedef" alanları OCR metnidir (Türkçe harfler sadeleşmiş) ve yalnızca yapay zekaya bağlam olarak gider.
 */

export type ZUygulama = { yontem: string; urunler: { urun: string; doz: string }[] };
export type ZEvre = { evre: string; bbch: string; donem: string; hedef: string; uygulamalar: ZUygulama[] };
export type ZKart = { bitki: string; sulama: string; evreler: ZEvre[] };

export const ZKARTLAR: ZKart[] = [
  {
    "bitki": "Buğday",
    "sulama": "Kuru tarım",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-13",
        "donem": "Ekim-Kasım",
        "hedef": "K6k primordiyumu ve kardes taci taslagi; P ile ATP, Zn ile oksin.",
        "uygulamalar": [
          {
            "yontem": "Taban gübresi",
            "urunler": [
              {
                "urun": "DAP",
                "doz": "15-20 kg/da (mibzerle banda)"
              },
              {
                "urun": "NPK 20.20.0+Zn",
                "doz": "20-25 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "KIANA EARTH PLUS (tohum)",
                "doz": "100 g/100 kg tohum"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da (çıkış sonrası)"
              }
            ]
          }
        ]
      },
      {
        "evre": "KARDEŞLENME",
        "bbch": "21-25",
        "donem": "Şubat-Mart",
        "hedef": "m?'de basak sayisi — sitokinin sinyali kardes tomurcugunu uyandirir.",
        "uygulamalar": [
          {
            "yontem": "Baş gübre",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "12-16 L/da"
              },
              {
                "urun": "AS 21",
                "doz": "15-20 kg/da (kirecli toprak)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200-250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SAPA KALKMA",
        "bbch": "30-32",
        "donem": "Mart-Nisan",
        "hedef": "Basakcik taslaklari sayilir — BASAKTAKi TANE SAYISI BURADA KILITLENIR.",
        "uygulamalar": [
          {
            "yontem": "Baş gübre",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "BAYRAK YAPRAĞI - BAŞAKLANMA",
        "bbch": "37-59",
        "donem": "Nisan-Mayıs",
        "hedef": "Bayrak yaprag! tane agirliginin %40'ini dretir; déllenme gitivenligi kurulur.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "KNO₃",
                "doz": "400 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SÜT - HAMUR OLUM",
        "bbch": "71-85",
        "donem": "Mayıs-Haziran",
        "hedef": "Stkroz taneye tasinir; ge¢ azot ve kikurt gluteni kurar.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              },
              {
                "urun": "K-S",
                "doz": "400-500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Arpa",
    "sulama": "Kuru tarım",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-13",
        "donem": "Ekim-Kasım",
        "hedef": "K6k ve kardes taci; arpa bugdaydan daha sig kékludir.",
        "uygulamalar": [
          {
            "yontem": "Taban gübresi",
            "urunler": [
              {
                "urun": "DAP",
                "doz": "12-15 kg/da (mibzerle banda)"
              },
              {
                "urun": "NPK 20.20.0+Zn",
                "doz": "18-22 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "KIANA EARTH PLUS (tohum)",
                "doz": "100 g/100 kg tohum"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KARDEŞLENME",
        "bbch": "21-25",
        "donem": "Şubat-Mart",
        "hedef": "m?'de basak sayisi — arpada pencere bugdaydan kisadir.",
        "uygulamalar": [
          {
            "yontem": "Baş gübre",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SAPA KALKMA",
        "bbch": "30-32",
        "donem": "Mart-Nisan",
        "hedef": "Basakcik taslagi ve sap dayanimi; arpa yatmaya yatkindir.",
        "uygulamalar": [
          {
            "yontem": "Baş gübre",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-12 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "300-400 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "BAYRAK YAPRAĞI - BAŞAKLANMA",
        "bbch": "37-59",
        "donem": "Nisan",
        "hedef": "Ddllenme giivenligi ve yaprak omru.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              },
              {
                "urun": "KNO₃",
                "doz": "400 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TANE DOLUMU",
        "bbch": "71-85",
        "donem": "Mayıs",
        "hedef": "Homojen ve dolgun tane; maltlikta elek UstU (>2,5 mm) orani.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Susam",
    "sulama": "Kuru tarım",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-13",
        "donem": "Mayıs",
        "hedef": "Derin kazik kok ve erken vigor; susam yavas cikar, ilk 3 hafta kritiktir.",
        "uygulamalar": [
          {
            "yontem": "Taban gübresi",
            "urunler": [
              {
                "urun": "DAP",
                "doz": "10-12 kg/da (mibzerle banda)"
              },
              {
                "urun": "NPK 20.20.0+Zn",
                "doz": "15-18 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "KIANA EARTH PLUS (tohum)",
                "doz": "100 g/100 kg tohum"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "VEJETATİF - DALLANMA",
        "bbch": "21-39",
        "donem": "Haziran",
        "hedef": "Dal sayisi ve bogum sayisi — kapsUl tasiyacak iskelet.",
        "uygulamalar": [
          {
            "yontem": "Baş gübre",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME",
        "bbch": "60-69",
        "donem": "Haziran-Temmuz",
        "hedef": "Kapsutl tutumu — ciceklenme 3-4 hafta strer, uygulama tekrarlanir.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da - 12-15 gün ara"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KAPSÜL DOLUMU - YAĞ",
        "bbch": "71-85",
        "donem": "Temmuz-Ağustos",
        "hedef": "Yag asidi sentezi ve tane dolumu; yag orani burada kazanilir.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400-500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA - HASAT",
        "bbch": "87-89",
        "donem": "Ağustos-Eylül",
        "hedef": "Kapsullerin eszamanli olgunlasmasi ve dékUlmeden hasat. » hac atihre vadmic nencerecinde : Noziar deka",
        "uygulamalar": []
      }
    ]
  },
  {
    "bitki": "Ayçiçeği",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-12",
        "donem": "Nisan",
        "hedef": "Kazik kéktin derine inmesi ve homojen cikis; erken fosfor k6ék hacmini belirler.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1-1,5 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "V4 - V8 (TABLA TASLAĞI)",
        "bbch": "14-35",
        "donem": "Mayıs",
        "hedef": "TANE SAYISI BURADA BELIRLENIR — tabla taslagindaki cicek sayisi bu dénemde sabitlenir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "12-16 L/da (her sulamaya béliinmiis)"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "12-16 L/da (2-3 sulamada)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da (birinci bor)"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TABLA GÖRÜNÜMÜ - ÇİÇEKLENME",
        "bbch": "51-65",
        "donem": "Haziran",
        "hedef": "Ddllenme ve tabla merkezinin dolmasi; polen canliligi ve stigma aliciligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-6 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-6 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da (ikinci bor — PAZARLIKSIZ)"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TANE DOLUMU",
        "bbch": "71-85",
        "donem": "Temmuz",
        "hedef": "Bin tane agirligi ve yag orani; kiikiirt yag asidi sentezinde zorunludur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "K-S",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "K-S",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA - HASAT",
        "bbch": "87-99",
        "donem": "Ağustos",
        "hedef": "Tabla arkasinin kahverengilesmesi ve nem distisi.",
        "uygulamalar": []
      }
    ]
  },
  {
    "bitki": "Mısır (dane)",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "V0-V3",
        "donem": "Nisan",
        "hedef": "Sacak k6k ve ilk yapraklar; soguk toprakta P alimi zayiftir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1-1,5 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "V6-V8 (DİZ BOYU)",
        "bbch": "V6-V8",
        "donem": "Mayıs",
        "hedef": "KOCAN SIRA SAYIS| BURADA BELIRLENIR — stres kalici kayip yazar.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "14-18 L/da (her sulamaya béliinmis)"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "14-18 L/da (2-3 sulamada)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "PÜSKÜL - KOÇAN PÜSKÜLÜ",
        "bbch": "VT-R1",
        "donem": "Haziran-Temmuz",
        "hedef": "Déllenme ve tane sayisi; ipek (silk) kurumasi dogrudan bos kogan demektir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-12 L/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-6 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-6 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SÜT - HAMUR OLUM",
        "bbch": "R3-R5",
        "donem": "Temmuz-Ağustos",
        "hedef": "Tane agirligi; yaprak Omru dogrudan bin tane agirligina yazilir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA",
        "bbch": "R6",
        "donem": "Ağustos-Eylül",
        "hedef": "Kuruma ve hasat nemi.",
        "uygulamalar": []
      }
    ]
  },
  {
    "bitki": "Çeltik (pirinç)",
    "sulama": "Salma sulama",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-09",
        "donem": "Nisan-Mayıs",
        "hedef": "K6k ve ilk kardes taslag; cinko su altinda hizla kilitlenir. SULAMA SUYU iLE « NPK 12-40-12 3-4 kg/da (su ile) * KIANA EARTH PLUS 200 g/da",
        "uygulamalar": [
          {
            "yontem": "Serpme baş gübre",
            "urunler": [
              {
                "urun": "DAP",
                "doz": "12-15 kg/da (su verilmeden serpme)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KARDEŞLENME",
        "bbch": "21-29",
        "donem": "Mayıs-Haziran",
        "hedef": "m?'de salkim sayisl. SULAMA SUYU iLE + UAN-32 12-16 L/da (b6linmis)",
        "uygulamalar": [
          {
            "yontem": "Serpme baş gübre",
            "urunler": [
              {
                "urun": "AS 21",
                "doz": "20-25 kg/da (su disirtlup serpme)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SALKIM TASLAĞI",
        "bbch": "30-39",
        "donem": "Haziran-Temmuz",
        "hedef": "Salkimdaki tane sayisi (panicle initiation) — yilin kilit penceresi. SULAMA SUYU iLE « UAN-32 8-10 L/da * KNO3 4-5 kg/da",
        "uygulamalar": [
          {
            "yontem": "Serpme baş gübre",
            "urunler": [
              {
                "urun": "AS 21",
                "doz": "12-15 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SALKIM ÇIKIŞI - ÇİÇEKLENME",
        "bbch": "51-69",
        "donem": "Temmuz-Ağustos",
        "hedef": "Déllenme ve bos tane oraninin dustrulmesi. SULAMA SUYU iLE * KNOs 3-4 kg/da",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TANE DOLUMU",
        "bbch": "71-89",
        "donem": "Ağustos-Eylül",
        "hedef": "Randiman ve kiriksiz tane; yaprak 6mrunt uzatmak. SULAMA SUYU iLE * K2SO4 3-4 kg/da",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Pamuk",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-09",
        "donem": "Nisan",
        "hedef": "Derin kazik k6k ve erken vigor; tuzlu zeminde cikis guvenlidi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 15-30-15+Zn",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "NİTRİK ASİT",
                "doz": "hat pH 5,5-6,5"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "4-6 YAPRAK",
        "bbch": "14-16",
        "donem": "Mayıs",
        "hedef": "Yaprak alan! ve k6k derinligi; ilk bogumlarin kurulmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (b6linmis)"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (2 sulamada)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TARAKLANMA",
        "bbch": "51-59",
        "donem": "Haziran",
        "hedef": "Tarak (cicek taslag!) sayisi — koza potansiyeli burada kurulur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "12-16 L/da"
              },
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "12-16 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME - KOZA BAĞLAMA",
        "bbch": "60-69",
        "donem": "Haziran-Temmuz",
        "hedef": "Déllenme ve koza tutumu; dékumin sinirlandig! tek pencere.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              },
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KOZA DOLUMU",
        "bbch": "71-79",
        "donem": "Temmuz-Ağustos",
        "hedef": "Lif uzamasi ve kalinlasmasi; circir randimani ve lif mukavemeti.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "ENLARGE POTASH",
                "doz": "1 L/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KOZA AÇIMI - HASAT",
        "bbch": "81-89",
        "donem": "Ağustos-Eylül",
        "hedef": "Diizgiin ve es zamanli koza acim.",
        "uygulamalar": [
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400 g/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Şeker pancarı",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-09",
        "donem": "Mart-Nisan",
        "hedef": "Kazik k6k taslagi; duzgtin ve gevsek profil.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "4-6 YAPRAK",
        "bbch": "14-16",
        "donem": "Mayıs",
        "hedef": "Yaprak rozeti ve buyime noktasi; BOR PENCERESI.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SIRA KAPAMA",
        "bbch": "31-39",
        "donem": "Haziran",
        "hedef": "Yaprak alani maksimuma cikar — seker fabrikasinin kapasitesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-12 L/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-12 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KÖK ŞİŞME",
        "bbch": "41-47",
        "donem": "Temmuz-Ağustos",
        "hedef": "Depo parankimasi genisler; k6k agirligi kazanilir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ŞEKER BİRİKİMİ",
        "bbch": "49",
        "donem": "Eylül-Ekim",
        "hedef": "Sikroz yogunlasir; polar seker yukselir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400-500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Tütün",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "FİDE - DİKİM",
        "bbch": "00-19",
        "donem": "Nisan-Mayıs",
        "hedef": "K6k tutmasi ve diizgtin fide cikisi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "VEJETATİF GELİŞİM",
        "bbch": "21-39",
        "donem": "Mayıs-Haziran",
        "hedef": "Yaprak sayisi ve alani — urintn kendisi yapraktir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "6-9 L/da (bolunmis)"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "6-9 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "UÇ ALMA (TEPE KIRMA)",
        "bbch": "51-59",
        "donem": "Haziran-Temmuz",
        "hedef": "Ci¢ek sapi alinir, asimilat yapraga yonlenir; yaprak kalinlasir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "YAPRAK OLGUNLAŞMASI",
        "bbch": "71-87",
        "donem": "Temmuz-Ağustos",
        "hedef": "Nisastanin sekere dénlsmesi; acik renk ve yanma 6zelligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KIRIM - KURUTMA",
        "bbch": "89-92",
        "donem": "Ağustos-Eylül",
        "hedef": "Alt yapraktan Uste kirim; duizgtin sararma ve kuruma. me 4. , a pee ee een ee pee ee ee ee oe",
        "uygulamalar": []
      }
    ]
  },
  {
    "bitki": "Nar",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - SÜRGÜN",
        "bbch": "09-19",
        "donem": "Mart",
        "hedef": "K6k aktivasyonu ve yeni srgiin; cicek yeni stirgiinde olusur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da (bolinmis)"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da (ağaçta 10 g/ağaç)"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da (mini-sprink)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME",
        "bbch": "60-69",
        "donem": "Mayıs",
        "hedef": "Hermafrodit (verimli) cicek orani ve meyve tutumu",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              },
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE TUTUMU - KABUK",
        "bbch": "71-75",
        "donem": "Haziran",
        "hedef": "Kabuk dokusunun elastikiyeti; catlamaya karsi asil yatirim burada.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "6-8 L/da"
              },
              {
                "urun": "NPK 7-7-40+ME",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da - 12-15 gün ara"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE İRİLEŞME",
        "bbch": "76-79",
        "donem": "Temmuz-Ağustos",
        "hedef": "Tane (arillus) dolumu ve meyve iriligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "RENKLENME - HASAT",
        "bbch": "81-87",
        "donem": "Eylül-Ekim",
        "hedef": "Antosiyanin sentezi, seker/asit dengesi ve kabuk parlakligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI",
        "bbch": "91-97",
        "donem": "Ekim-Kasım",
        "hedef": "Rezerv birikimi ve kis dayanimi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Üzüm (bağ)",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - SÜRGÜN",
        "bbch": "05-15",
        "donem": "Mart-Nisan",
        "hedef": "G6vde rezervinden cikis; surgtn ve ilk yapraklar.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME ÖNCESİ",
        "bbch": "53-57",
        "donem": "Mayıs",
        "hedef": "Polen canliligi ve tane tutumu — silkmenin 6nlendigi pencere.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 ce/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TANE TUTUMU - KORUK",
        "bbch": "71-75",
        "donem": "Haziran",
        "hedef": "Hiicre béllinmesi: tane iriliginin potansiyeli burada kurulur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "NPK 7-7-40+ME",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "BEN DÜŞME",
        "bbch": "81-83",
        "donem": "Temmuz-Ağustos",
        "hedef": "Seker birikiminin baslangici ve antosiyanin sentezi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-6 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-6 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA - BRİKS",
        "bbch": "85-89",
        "donem": "Ağustos-Eylül",
        "hedef": "Briks, aroma, tane sertligi ve tasima dayanimi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI - REZERV",
        "bbch": "91-97",
        "donem": "Eylül-Ekim",
        "hedef": "K6k ve gévdede rezerv — ertesi yilin salkim sayisi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Elma",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - PEMBE TOMURCUK",
        "bbch": "51-57",
        "donem": "Mart-Nisan",
        "hedef": "K6k aktivasyonu, polen kalitesi ve DON DAYANIMI.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TAM ÇİÇEK - TUTUM",
        "bbch": "65-71",
        "donem": "Nisan-Mayıs",
        "hedef": "Déllenme ve hiicre BOLUNMESi — iriligin potansiyeli burada kurulur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "6-8 L/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE BÜYÜME - KALSİYUM",
        "bbch": "72-77",
        "donem": "Mayıs-Temmuz",
        "hedef": "Hiicre genislemesi; aci benegin Onlendigi tek pencere.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-6 kg/da"
              },
              {
                "urun": "NPK 7-7-40+ME",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da - 10-14 gün ara"
              },
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "RENKLENME - HASAT",
        "bbch": "81-87",
        "donem": "Ağustos-Ekim",
        "hedef": "Antosiyanin, briks, meyve eti sertligi ve depo 6mri.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI - REZERV",
        "bbch": "91-97",
        "donem": "Ekim-Kasım",
        "hedef": "Arginin formunda rezerv azot; ertesi yilin cicek kalitesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "yaprak"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Şeftali / nektarin",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - PEMBE TOMURCUK",
        "bbch": "51-57",
        "donem": "Şubat-Mart",
        "hedef": "K6k aktivasyonu, polen kalitesi ve DON DAYANIMI.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "7-9 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              },
              {
                "urun": "K-S",
                "doz": "400 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEK - MEYVE TUTUMU",
        "bbch": "65-71",
        "donem": "Mart-Nisan",
        "hedef": "Déllenme ve geng meyvede hiicre bdluinmesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇEKİRDEK SERTLEŞMESİ",
        "bbch": "73-75",
        "donem": "Nisan-Mayıs",
        "hedef": "Endokarp sertlesir, meyve biyumesi duraklar.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "İKİNCİ BÜYÜME (SON ŞİŞME)",
        "bbch": "76-79",
        "donem": "Mayıs-Haziran",
        "hedef": "Hiicre genislemesi: hasat iriliginin %60'1 son 3-4 haftada kazanilir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "RENKLENME - HASAT",
        "bbch": "81-87",
        "donem": "Haziran-Ağustos",
        "hedef": "Antosiyanin, briks ve meyve eti sertligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K2SOs",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI - REZERV",
        "bbch": "91-97",
        "donem": "Ağustos-Ekim",
        "hedef": "Cicgek g6zu farklilagmasi ve ertesi yilin rezervi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Kayısı",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - TOMURCUK KABARMASI",
        "bbch": "51-55",
        "donem": "Şubat-Mart",
        "hedef": "DON DAYANIMI: hicre 6zsuyunun yogunlastirilmasi ve tomurcuk direnci.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME",
        "bbch": "60-69",
        "donem": "Mart",
        "hedef": "Polen tupt cimlenmesi ve meyve tutumu; kayisida ci¢ek dénemi cok kisadir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE TUTUMU - HÜCRE BÖLÜNMESİ",
        "bbch": "71-73",
        "donem": "Nisan",
        "hedef": "Geng meyvenin tutunmasi ve hicre sayisinin sabitlenmesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "6-8 L/da"
              },
              {
                "urun": "NPK 20-20-20+ME",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "5-6 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇEKİRDEK SERTLEŞMESİ",
        "bbch": "74-76",
        "donem": "Nisan-Mayıs",
        "hedef": "Endokarp sertlesir; azot ve su élculd tutulur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SON ŞİŞME - RENKLENME",
        "bbch": "77-85",
        "donem": "Mayıs-Haziran",
        "hedef": "irilik, turuncu renk ve kuru madde (kuruluk kalitesi).",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI - REZERV",
        "bbch": "91-97",
        "donem": "Temmuz-Eylül",
        "hedef": "Cicek g6ézti farklilasmasi; ertesi yilin don direncinin temeli.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Fındık",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "ÇİÇEK - DÖLLENME",
        "bbch": "60-69",
        "donem": "Şubat-Mart",
        "hedef": "Erkek ve disi cigek uyumu; findikta cigeklenme kisin olur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "UYANMA - SÜRGÜN",
        "bbch": "09-19",
        "donem": "Mart-Nisan",
        "hedef": "K6k ve siirgiin aktivasyonu; ocak ici dengeli gelisim.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (b6linmis)"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (mini-sprink)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE TUTUMU - ZURUF",
        "bbch": "71-75",
        "donem": "Nisan-Mayıs",
        "hedef": "Zuruf ve sert kabuk olusumu; kérelmeye karsi pencere.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "6-8 L/da"
              },
              {
                "urun": "NPK 20-20-20+ME",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "5-6 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "DOLUM - YAĞ",
        "bbch": "77-85",
        "donem": "Haziran-Temmuz",
        "hedef": "ig dolumu, yag ve protein birikimi — randimanin belirlendigi d6nem.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI - REZERV",
        "bbch": "91-97",
        "donem": "Ağustos-Eylül",
        "hedef": "Ertesi yilin cicek ve surgiin gic icin rezerv.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Narenciye (mandalina)",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - SÜRGÜN",
        "bbch": "09-19",
        "donem": "Şubat-Mart",
        "hedef": "K6k aktivasyonu ve ilk surgiin; cicek bu yilin surgdninde olusur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              },
              {
                "urun": "NİTRİK ASİT",
                "doz": "pH 5,5-6,5"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (mini-sprink)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "DEMİR ŞELAT",
                "doz": "250 g/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME",
        "bbch": "60-69",
        "donem": "Nisan",
        "hedef": "Polen canliligi ve meyve tutumu; cicek dokumunun azaltilmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE TUTUMU - HAZİRAN DÖKÜMÜ",
        "bbch": "71-73",
        "donem": "Mayıs-Haziran",
        "hedef": "Fizyolojik d6kimiun atlatilmasi ve hucre sayisinin sabitlenmesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "6-8 L/da"
              },
              {
                "urun": "NPK 20-20-20+ME",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "5-6 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da : 12-15 gün ara"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE İRİLEŞME",
        "bbch": "74-79",
        "donem": "Temmuz-Ağustos",
        "hedef": "Hiicre genislemesi ve ince ama saglam kabuk.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "RENKLENME - ERKENCİLİK",
        "bbch": "81-87",
        "donem": "Eylül-Kasım",
        "hedef": "Seker/asit dengesi, kabuk rengi ve erken hasat avantajl.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI - REZERV",
        "bbch": "91-97",
        "donem": "Kasım-Aralık",
        "hedef": "Tomurcuk farklilasmasi ve ertesi yilin cicek kalitesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "İncir",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - SÜRGÜN",
        "bbch": "09-19",
        "donem": "Mart-Nisan",
        "hedef": "K6k aktivasyonu ve yeni sUrgtin; meyve yeni surgiinde olusur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "7-9 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "7-9 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE TUTUMU",
        "bbch": "71-73",
        "donem": "Mayıs-Haziran",
        "hedef": "Geng meyvenin tutunmasi ve g6z (ostiol) yapisinin saglam kurulmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              },
              {
                "urun": "NPK 7-7-40+ME",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE İRİLEŞME",
        "bbch": "75-79",
        "donem": "Haziran-Temmuz",
        "hedef": "Hiicre genislemesi ve et oraninin artmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-6 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-6 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1 L/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA - ŞEKER",
        "bbch": "81-87",
        "donem": "Temmuz-Ağustos",
        "hedef": "Seker birikimi, kabuk saglamligi ve kuruma kalitesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI",
        "bbch": "91-97",
        "donem": "Eylül-Ekim",
        "hedef": "Rezerv birikimi ve kis dayanimi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Zeytin",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "UYANMA - SÜRGÜN",
        "bbch": "09-19",
        "donem": "Şubat-Mart",
        "hedef": "K6k aktivasyonu ve yeni siirgiin: cicek bu yilin sUrgtiniinde olusur.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-10 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEK TASLAĞI - SOMAK",
        "bbch": "55-59",
        "donem": "Mart-Nisan",
        "hedef": "Somak (cicek salkimi!) olusumu ve tam cicek orani.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250-300 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME - TANE TUTUMU",
        "bbch": "60-71",
        "donem": "Mayıs",
        "hedef": "Dédllenme ve geng tanenin tutunmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "TANE İRİLEŞME - SERTLEŞME",
        "bbch": "74-79",
        "donem": "Haziran-Ağustos",
        "hedef": "Cekirdek sertlesmesi ve et oraninin artmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "YAĞ BİRİKİMİ",
        "bbch": "81-85",
        "donem": "Eylül-Kasım",
        "hedef": "Yag asidi sentezi ve yag oraninin yukselmesi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "HASAT SONRASI",
        "bbch": "91-97",
        "donem": "Kasım-Aralık",
        "hedef": "Periyodisiteyi kirmak icin rezerv besleme.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "1 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Patates",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "DİKİM - ÇIKIŞ",
        "bbch": "00-09",
        "donem": "Mart-Nisan",
        "hedef": "K6k ve stolon taslagi; soguk toprakta fosfor alimi zayiftir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1-1,5 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da (sulama suyuna)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "VEJETATİF GELİŞİM",
        "bbch": "21-39",
        "donem": "Mayıs",
        "hedef": "G6vde ve yaprak alani: yumruyu besleyecek fabrika.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (bélinmits)"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (2-3 sulamada)"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "YUMRU BAĞLAMA (TÜBERİZASYON)",
        "bbch": "40-48",
        "donem": "Mayıs-Haziran",
        "hedef": "YUMRU SAYISI BURADA BELIRLENIR — azot dilser, K ve Ca yukselir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "YUMRU DOLUMU",
        "bbch": "71-79",
        "donem": "Haziran-Temmuz",
        "hedef": "Nisasta sentezi ve kuru madde; yumru agirligi kazanilir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "7-9 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "7-9 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA - KABUK",
        "bbch": "81-89",
        "donem": "Temmuz-Ağustos",
        "hedef": "Kabuk olusumu ve depolama dayanimi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Domates",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "FİDE - DİKİM",
        "bbch": "00-19",
        "donem": "Şubat-Nisan",
        "hedef": "K6k hacmi ve fide tutmasi; uzun hasadin altyapisi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1-1,5 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              },
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "VEJETATİF - 1. SALKIM",
        "bbch": "21-51",
        "donem": "Nisan-Mayıs",
        "hedef": "Goévde ve yaprak iskeleti; ilk salkimin taslyici gici.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-12 L/da"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-12 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME - TUTUM",
        "bbch": "61-69",
        "donem": "Mayıs-Haziran",
        "hedef": "Polen canliligi ve meyve tutumu — her salkimda tekrarlanir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "300 cc/da · her salkım"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "MEYVE DOLUMU",
        "bbch": "71-79",
        "donem": "Haziran-Ağustos",
        "hedef": "Hicre genislemesi ve kabuk dayanimi; CBC'nin 6nlendigi pencere.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "6-8 kg/da"
              },
              {
                "urun": "NPK 7-7-40+ME",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "300 cc/da - 10-15 gün ara"
              },
              {
                "urun": "ENLARGE POTASH",
                "doz": "1-2 L/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "RENKLENME - HASAT",
        "bbch": "81-89",
        "donem": "Temmuz-Ekim",
        "hedef": "Likopen sentezi, briks ve tasima dayanimi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "5-6 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "COLORFUL",
                "doz": "300 cc/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "PERİYODİK HASAT DESTEĞİ",
        "bbch": "89",
        "donem": "Ağustos-Ekim",
        "hedef": "Ust salkimlarin da dolmasi icin bitkinin ayakta tutulmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3 kg/da"
              },
              {
                "urun": "Mg NİTRAT",
                "doz": "2 kg/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 18-18-18",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Salatalık",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "DİKİM - FİDE",
        "bbch": "00-19",
        "donem": "Şubat-Nisan",
        "hedef": "K6k hacmi ve fide tutmasi; yuzeysel k6ék sistemi beslenir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1-1,5 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "VEJETATİF - KOL ATMA",
        "bbch": "21-39",
        "donem": "+15-30 gün",
        "hedef": "Yaprak alani: her meyveyi 4-6 saglikli yaprak besler.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "7-10 L/da"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "7-10 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "ÇİÇEKLENME - İLK MEYVE",
        "bbch": "61-69",
        "donem": "+30-45 gün",
        "hedef": "Disi cigek orani ve meyve tutumu.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "MKP",
                "doz": "2 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da"
              },
              {
                "urun": "FLOWER GOLD",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "SÜREKLİ HASAT",
        "bbch": "71-89",
        "donem": "Hasat boyunca",
        "hedef": "Ayni anda meyve dolumu + yeni cicek: kesintisiz ve dengeli besleme.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "5-7 kg/da"
              },
              {
                "urun": "NPK 7-7-40+ME",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "N-CALBOR",
                "doz": "250 cc/da - 10 gün ara"
              },
              {
                "urun": "ENLARGE POTASH",
                "doz": "1 L/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "BİTKİ YENİLEME",
        "bbch": "89",
        "donem": "Hasat ortası",
        "hedef": "Uzun hasatta bitkinin tukenmesini 6nlemek; yeni sUrgiin ve kék.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "2-3 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "2-3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "AMİNO ASİT",
                "doz": "300 cc/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "bitki": "Soğan",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "EKİM - ÇIKIŞ",
        "bbch": "00-13",
        "donem": "Ekim-Mart",
        "hedef": "SiG sagak k6k sisteminin kurulmasi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "YAPRAK GELİŞİMİ",
        "bbch": "14-19",
        "donem": "Nisan-Mayıs",
        "hedef": "Her yaprak bir halka: bas baglamadan once yaprak sayisi maksimize edilir.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              },
              {
                "urun": "NPK 18-18-18",
                "doz": "3-4 kg/da"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KOMBİ",
                "doz": "150 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "BAŞ BAĞLAMA EŞİĞİ",
        "bbch": "41-43",
        "donem": "Mayıs-Haziran",
        "hedef": "Yaprak Uretimi durur, depolama baslar — AZOTUN KESILDIGi AN.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              },
              {
                "urun": "KNO₃",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400 g/da"
              },
              {
                "urun": "N-CALBOR",
                "doz": "150 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "BAŞ ŞİŞME",
        "bbch": "45-47",
        "donem": "Haziran",
        "hedef": "Kuru madde, kabuk kalitesi ve bas iriligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "ENLARGE POTASH",
                "doz": "1 L/da"
              },
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "OLGUNLAŞMA - HASAT",
        "bbch": "47-49",
        "donem": "Temmuz",
        "hedef": "Boyun yumusamasi, devrilme ve kabuk kurumasi.",
        "uygulamalar": []
      }
    ]
  },
  {
    "bitki": "Çay",
    "sulama": "Damla + yağmurlama",
    "evreler": [
      {
        "evre": "KIŞ SONU - UYANMA",
        "bbch": "00-09",
        "donem": "Şubat-Mart",
        "hedef": "K6k aktivasyonu ve ilk surgiin hazirligi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              },
              {
                "urun": "FOSFORİK ASİT",
                "doz": "pH 5,0-5,5"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "NPK 12-40-12",
                "doz": "3 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "200 cc/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "1. SÜRGÜN (BAHAR HASADI)",
        "bbch": "11-19",
        "donem": "Nisan-Mayıs",
        "hedef": "Sirgun uzunlugu ve yaprak sayis! — yilin en kaliteli hasadi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da (b6élinmis)"
              },
              {
                "urun": "K₂SO₄",
                "doz": "3-4 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "10-14 L/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "MAGNEZYUM",
                "doz": "400 g/da"
              },
              {
                "urun": "AMİNO ASİT",
                "doz": "250 cc/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "2. SÜRGÜN (YAZ HASADI)",
        "bbch": "21-29",
        "donem": "Haziran-Temmuz",
        "hedef": "ikinci surgiin dalgasi; hasat sonras! hizli toparlanma.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "UAN-32",
                "doz": "8-12 L/da"
              },
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "KNO₃",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "400 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "3. SÜRGÜN (GÜZ HASADI)",
        "bbch": "31-39",
        "donem": "Ağustos-Eylül",
        "hedef": "Son hasat ve kisa hazirlik; yaprak kalitesi ve aroma.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yağmurlama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "4-5 kg/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "K-S",
                "doz": "500 g/da"
              },
              {
                "urun": "MAGNEZYUM",
                "doz": "300 g/da"
              }
            ]
          }
        ]
      },
      {
        "evre": "KIŞA HAZIRLIK - REZERV",
        "bbch": "91-97",
        "donem": "Ekim-Kasım",
        "hedef": "K6k rezervi ve soguk dayanimi.",
        "uygulamalar": [
          {
            "yontem": "Damla sulama",
            "urunler": [
              {
                "urun": "K₂SO₄",
                "doz": "3 kg/da"
              },
              {
                "urun": "MOL-50",
                "doz": "1 L/da"
              },
              {
                "urun": "KIANA EARTH PLUS",
                "doz": "200 g/da"
              }
            ]
          },
          {
            "yontem": "Yapraktan",
            "urunler": [
              {
                "urun": "EDTA Zn-Mn",
                "doz": "250 cc/da"
              },
              {
                "urun": "KIANA CLIMATE PLUS",
                "doz": "200-300 g/da"
              }
            ]
          }
        ]
      }
    ]
  }
];
