# proje2 kuralları

## Dosya yapısı
- `app/page.jsx`: App Router sayfa düzeni; form, filtre, görev listesi ve analiz panellerini birleştirir.
- `app/useTodoApp.js` ve `app/todo-model.js`: görev akışı, tarayıcı kaydı ve veri dönüştürme kuralları.
- `app/TaskComposer.jsx`, `app/TaskToolbar.jsx`, `app/TodoList.jsx`, `app/Button.jsx`: erişilebilir arayüz bileşenleri.
- `app/globals.css`: tema renkleri, özel cam/neon ayrıntıları ve responsive kurallar; Tailwind düzen sınıfları da kullanılır.
- `server.py` ve `graph.py`: Flask JSON API'si ve kural tabanlı LangGraph akışı; `next.config.mjs` API isteklerini Flask'a iletir.
- `tests/` Python API testlerini, `e2e/` Playwright tarayıcı testlerini içerir.

## Kod stili
- JS adlarında camelCase, CSS sınıflarında kebab-case kullan; `var` kullanma.
- React bileşenlerini JSX dosyalarında, veri işlemlerini model/hook modüllerinde tut; her fonksiyon tek işi yapsın.
- Gerekli yerlerde kısa açıklama ekle ve yorumları kodun güncel davranışıyla uyumlu tut.
- Kullanıcı metnini React metin içeriği olarak göster; `innerHTML` kullanma.

## Arayüz kuralları
- Tema renklerini `app/globals.css` içindeki değişkenlerde tanımla; koyu varsayılanı ve açık temayı koru.
- Tailwind'i yerleşim ve responsive arayüzde, özel CSS'i cam/neon görünümünde kullan.
- Mobilde form, filtreler ve analiz panelleri dar ekrana uyum sağlar; yatay taşma olmaz.
- Her butonda `type` ve görünen metin veya `aria-label`; klavye odağı belirgin, dokunmatik kontroller en az 44px olur.
- Checkbox'ın erişilebilir adı görev metnini içerir; simge butonlarına açıklayıcı `aria-label` ekle.

## Veri kuralları
- Tek kayıt anahtarı `proje2-todos` olarak kalır. Sürüm bilgili kayıt zarfı görevleri, temayı ve yerel güne göre günlük tamamlanma sayılarını taşır.
- Eski görev dizisi ilk okumada otomatik taşınır; `id`, `text`, `done`, `priority` ve analiz sonuçları korunur. Son tarih, etiketler ve sıra da görevle saklanır.
- Her aktiften tamamlandıya geçiş yerel günün toplamını artırır. Görev yeniden açılsa veya silinse de geçmiş toplam değişmez.
- Tema yalnızca `dark` veya `light` olur; varsayılan `dark` olur. `trim()` sonrası boş görev eklenmez; bozuk JSON boş varsayılan veriyle açılır.

## Yapılmaması gerekenler
- Google Fonts kullanılabilir; gerektiğinde CDN, npm paketleri ve framework eklenebilir. Sürümleri sabitle ve gerekçelerini README.md'ye yaz.
- Arayüzü tek dosyada toplama veya kullanıcı metnini `innerHTML` ile basma.
- Başka localStorage anahtarı, sunucu senkronu veya hata için `alert` ekleme.
