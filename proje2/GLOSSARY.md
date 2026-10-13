# proje2 yapılacaklar alanı

Bu alan, kullanıcının görevlerini kişisel listede düzenlemesini ve görev analizlerini görmesini kapsar.

## Görev ve düzenleme

**Son tarih**:
Bir görevin tamamlanmasının hedeflendiği, isteğe bağlı takvim günüdür.
_Avoid_: Bitiş saati

**Etiket**:
Kullanıcının `#` ile ekleyerek görevi sınıflandırdığı, bir görevde birden fazla bulunabilen kısa addır.
_Avoid_: Kategori (otomatik analiz kategorisiyle karışır)

**Filtreli sıralama**:
Aktif ya da tamamlanan görevler gibi görünür bir listenin sürüklenerek yeniden sıralanmasıdır.
_Avoid_: Arama sonucu sıralaması (davranışı ayrıca kararlaştırılacak)

## İlerleme ve görünüm

**Tamamlanma zamanı**:
Bir görevin tamamlandı durumuna geçtiği takvim zamanı; tarih bazlı ilerleme görünümünün dayanağıdır.
_Avoid_: Son tarih

**Tamamlanma olayı**:
Bir görevin aktif durumdan tamamlandı durumuna geçtiği tarihli kayıttır; tekrar tamamlanan görev yeni olay üretir.
_Avoid_: Tamamlanma durumu

**Tema**:
Uygulamanın renk görünümü; koyu seçenek varsayılan, açık seçenek kullanıcı tercihidir.
_Avoid_: Palet

**Cam-neon görünümü**:
Görev alanları ve panellerde hafif bulanık cam yüzeyleriyle ince neon kenarlıklar kullanan görsel stildir.
_Avoid_: Yoğun parıltı
