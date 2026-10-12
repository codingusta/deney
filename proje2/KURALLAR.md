# proje2 kuralları

## Dosya yapısı
- `index.html`: iskelet, ekleme formu, filtreler, liste; CSS/JS ayrı dosyadan bağlanır.
- `styles.css`: `:root` renkleri, kart/form/liste, 480px altı mobil düzen.
- `script.js`: CRUD, filtre, düzenleme, `localStorage`; HTML içine JS yazılmaz.
- `KURALLAR.md`: yalnızca bu kurallar; uygulama kodu buraya konmaz.

## Kod stili
- JS: camelCase (`loadTodos`, `activeFilter`); CSS sınıfı kebab-case (`.todo-item`).
- JSDoc sadece `Todo` tipi ve dışarı açık fonksiyonlarda; satır içi yorum yok.
- Fonksiyon en fazla ~25 satır; DOM, kayıt ve filtre ayrı fonksiyonlarda durur.
- `const`/`let` kullan, `var` kullanma. Görev: `id` string, `text` string, `done` boolean.

## Arayüz kuralları
- Renkler yalnızca `:root`: `--ink`, `--accent` (#0d7a6f), `--danger`, `--paper`.
- Ana sütun `min(560px, calc(100% - 2rem))`; kart ve form boşluğu en az 0.55rem.
- 480px altında form/filtre dikey, butonlar tam genişlik, min-height 44px.
- Her butonda `type` ve görünür metin veya `aria-label`; odak halkası `--accent`.
- Checkbox ve Sil etiketi görev metnini içerir; tıklanabilir alan en az 24px.

## Veri kuralları
- Anahtar yalnızca `proje2-todos`. Dizi öğesi: `{ id, text, done }`.
- `trim()` sonrası boş metin eklenmez ve kaydedilmez; bozuk JSON `[]` kabul edilir.

## Yapılmaması gerekenler
- CDN, Google Fonts, npm, framework yok; yalnızca düz HTML/CSS/JS.
- Üç dosyayı tek HTML’de birleştirme; kullanıcı metnini `innerHTML` ile basma.
- Başka localStorage anahtarı, sunucu senkronu veya `alert` ile hata gösterme.
