# Proje özeti
- `proje2`, görev ekleme, tamamlama, silme, çift tıklayarak düzenleme ve filtreleme yapan tarayıcı tabanlı bir yapılacaklar uygulamasıdır.
- `index.html` erişilebilir formu, filtreleri ve liste iskeletini; `styles.css` görünümü; `script.js` görev davranışlarını ve `localStorage` kaydını içerir.
- `KURALLAR.md` proje için mevcut kuralları açıklar; bu dosyayı değiştirme.

# Dosya yapısı ve kod stili
- HTML, CSS ve JavaScript ayrı dosyalarda kalsın; JS camelCase, CSS sınıfları kebab-case kullansın.
- Fonksiyonları kısa tut; DOM oluşturma, kayıt ve çizim sorumluluklarını ayrı fonksiyonlarda tut.
- `const`/`let` kullan; `var` kullanma. Gerekli tip ve dışarı açık fonksiyonlar için kısa JSDoc ekle.
- Kullanıcı metnini DOM'a `textContent` ile aktar; `innerHTML` kullanma.

# Arayüz kuralları
- Ana sütun `min(560px, calc(100% - 2rem))` genişliğinde; kart/form aralıkları en az `0.55rem` olsun.
- Renk değişkenlerini `:root` içinde tanımla; ana vurgu `--accent: #0d7a6f`, metin `--ink`, hata `--danger`, zemin `--paper` olsun.
- 480px altında form ve filtreler dikey, butonlar tam genişlik ve en az 44px yüksek olsun.
- Her butonda `type` ve görünür metin veya `aria-label`; klavye odağında `--accent` halkası olsun.
- Checkbox ve silme kontrolü en az 24px tıklama alanı sunsun; öncelikler renkli ve metin etiketli olsun.

# Veri kuralları
- Kayıt anahtarı `proje2-todos` olarak kalmalı; görev alanları `id`, `text`, `done` ve `priority` olmalı.
- `priority` yalnızca `low`, `medium`, `high`; eski kayıtlarda eksikse `medium` kabul et.
- `trim()` sonrası boş görev ekleme/kaydetme; bozuk JSON'u boş dizi kabul et.

# Yapılmaması gerekenler
- CDN, Google Fonts, npm paketi veya framework ekleme; düz HTML/CSS/JS kullan.
- Kodları tek dosyada toplama, yeni `localStorage` anahtarı/sunucu eşitlemesi ekleme veya hata için `alert` kullanma.
