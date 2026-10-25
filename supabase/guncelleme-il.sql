-- Tarım 4.0 güncellemesi: tarlalara "il" sütunu (Türkiye geneli)
-- Supabase → SQL Editor'da bir kez çalıştırın. Tekrar çalıştırmak zarar vermez.
alter table public.tarlalar add column if not exists il text;

-- Daha önce ilçesi İstanbul ilçesi olarak girilmiş tarlalara il = İstanbul yaz
update public.tarlalar set il = 'İstanbul'
where il is null and ilce in (
  'Adalar','Arnavutköy','Ataşehir','Avcılar','Bağcılar','Bahçelievler','Bakırköy','Başakşehir','Bayrampaşa','Beşiktaş',
  'Beykoz','Beylikdüzü','Beyoğlu','Büyükçekmece','Çatalca','Çekmeköy','Esenler','Esenyurt','Eyüpsultan','Fatih',
  'Gaziosmanpaşa','Güngören','Kadıköy','Kağıthane','Kartal','Küçükçekmece','Maltepe','Pendik','Sancaktepe','Sarıyer',
  'Silivri','Sultanbeyli','Sultangazi','Şile','Şişli','Tuzla','Ümraniye','Üsküdar','Zeytinburnu'
);
