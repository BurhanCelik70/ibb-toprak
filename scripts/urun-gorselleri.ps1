# İGSAŞ ürün görsellerini igsas.com.tr'den public/urunler klasörüne indirir (bir kez çalıştırın).
# Çalıştırma: PowerShell'de  cd C:\Users\user\ibb-toprak ; powershell -ExecutionPolicy Bypass -File scripts\urun-gorselleri.ps1
$hedef = Join-Path $PSScriptRoot "..\public\urunler"
New-Item -ItemType Directory -Force -Path $hedef | Out-Null
$liste = @(
  @("mol-50", "https://www.igsas.com.tr/uploads/new-products/mol50.png"),
  @("amino-asit", "https://www.igsas.com.tr/uploads/Products/aminoasitmockup.png"),
  @("n-calbor", "https://www.igsas.com.tr/uploads/new-products/N-CALBOR.png"),
  @("flower-gold", "https://www.igsas.com.tr/uploads/Products/igsas-flower-gold.png"),
  @("colorful", "https://www.igsas.com.tr/uploads/new-products/COLORFUL.png"),
  @("enlarge-potash", "https://www.igsas.com.tr/uploads/Products/igsas-enlarge-potash.png"),
  @("kombi", "https://www.igsas.com.tr/uploads/new-products/COMBI.png"),
  @("magnezyum", "https://www.igsas.com.tr/uploads/new-products/MAGNEZYUM.png"),
  @("mn-zn", "https://www.igsas.com.tr/uploads/new-products/MN-ZN.png"),
  @("eddha-fe-6", "https://www.igsas.com.tr/uploads/new-products/igsas-EDDHAFe6.png"),
  @("k-s", "https://www.igsas.com.tr/uploads/new-products/k-s.png"),
  @("dap", "https://www.igsas.com.tr/uploads/new-products/taban-g%C3%BCbreleri/%C4%B0GSA%C5%9E-DAP-%C3%87UVAL.png"),
  @("20-20-0-zn", "https://www.igsas.com.tr/uploads/new-products/taban-g%C3%BCbreleri/20.20.0+12SO3+ZN-KOMPOZE-%C3%87UVAL.png"),
  @("12-40-12", "https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/12-40-12+ME.png"),
  @("18-18-18", "https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/18-18-18-ME.png"),
  @("20-20-20", "https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/20-20-20-ME.png"),
  @("7-7-40", "https://www.igsas.com.tr/uploads/new-products/damla-sulama-g%C3%BCbreleri/igsas-7-7-40+ME.png"),
  @("uan-32", "https://www.igsas.com.tr/uploads/new-products/UAN-32.png"),
  @("as-21", "https://www.igsas.com.tr/uploads/new-products/%C3%BCst-g%C3%BCbreler/AMONYUM-S%C3%9CLFAT-21-%C3%87UVAL.png"),
  @("potasyum-nitrat", "https://www.igsas.com.tr/uploads/new-products/potasyum-nitrat-yeni.png"),
  @("potasyum-sulfat", "https://www.igsas.com.tr/uploads/new-products/saf-g%C3%BCbreler/potasyum-sulfat.png"),
  @("mkp", "https://www.igsas.com.tr/uploads/new-products/saf-g%C3%BCbreler/mono-potasyum-fosfat-0-52-34.png"),
  @("magnezyum-nitrat", "https://www.igsas.com.tr/uploads/new-products/saf-g%C3%BCbreler/magnezyum-nitrat.png"),
  @("fosforik-asit", "https://www.igsas.com.tr/uploads/new-products/fosforikasitdekupe.png"),
  @("nitrik-asit", "https://www.igsas.com.tr/uploads/new-products/56-HNO.png")
)
foreach ($u in $liste) {
  $dosya = Join-Path $hedef ($u[0] + ".png")
  try { Invoke-WebRequest -Uri $u[1] -OutFile $dosya -UseBasicParsing; Write-Host "indi: $($u[0])" }
  catch { Write-Host "INMEDI: $($u[0])  $($u[1])" }
}
