# Görev verisi ve tamamlanma geçmişi

Durum: accepted

Tema ve tamamlanma istatistikleri için mevcut `proje2-todos` anahtarını koruyup eski görev dizisini yeni bir veri zarfına otomatik taşıyoruz; böylece mevcut görevler ve analiz sonuçları kaybolmaz, yeni bir localStorage anahtarı gerekmez. Her aktiften tamamlandıya geçiş, tarayıcının yerel gününe ait saklanan günlük sayacı artırır; yeniden açma eski sayımı geri almaz ve görevi silmek metni kaldırsa da anonim günlük toplamı korur.
