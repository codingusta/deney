# Proje özeti
- `proje2`, görevleri tarayıcıda saklayan ve yeni görevleri kural tabanlı LangGraph akışında analiz eden yapılacaklar uygulamasıdır.
- Next.js App Router görev arayüzünü, Flask ise yalnızca `/api/analiz` ve `/api/graf` JSON uçlarını sağlar.
- `KURALLAR.md` proje kurallarını içerir; bu dosyayı değiştirme.

# Dosya yapısı ve kod stili
- `app/layout.jsx` sayfa kabuğunu, `app/page.jsx` bileşen düzenini, `app/useTodoApp.js` görev akışını ve `app/globals.css` temel/responsive stilleri içerir.
- `server.py` Flask API'sini, `graph.py` LangGraph akışını, `next.config.mjs` API proxy'sini tanımlar.
- `package.json` npm bağımlılıklarını; `requirements.txt` Python bağımlılıklarını sabit sürümle tutar; gerekçeler `README.md` içinde yazılır.
- UI'ı bileşen ve fonksiyonlara göre ayır; JS adlarında camelCase, CSS sınıflarında kebab-case kullan.
- Fonksiyonları kısa ve tek sorumluluklu tut; kullanıcı metnini React metin düğümleriyle göster, `innerHTML` kullanma.
- API testlerini `tests/`, gerçek tarayıcı E2E testlerini `e2e/` altında tut.

# Arayüz kuralları
- App Router arayüzünü responsive tut; 600px altında form ve araç çubukları dikey sıralanır.
- Renkleri `app/globals.css` değişkenlerinde tanımla; arayüz koyu temada açılır ve net klavye odağı sağlar.
- Her butonun `type` ve görünen metni veya `aria-label` değeri olsun; dokunmatik kontroller en az 44px yüksek olsun.
- Görev önceliği renk yanında metinle de belirtilsin; mobilde yatay taşmayı önle.

# Veri kuralları
- Tek `localStorage` anahtarı `proje2-todos` kalır; kayıt zarfı sürümü, görevleri, temayı ve günlük tamamlanma sayılarını taşır.
- Eski görev dizisini otomatik taşı; `id`, `text`, `done`, `priority` ve analiz sonuçlarını koru.
- Analiz `analysis`, `analysisError`, `analysisAttempted` alanlarında tutulur; son tarih, etiket ve sıra da görev kaydında saklanır.
- `priority` yalnızca `low`, `medium`, `high`; eksik öncelik `medium`, tema `dark` veya `light` ve varsayılanı `dark` olur.
- Boş görev ekleme; JSON bozuksa boş varsayılan veriyle aç.

# Yapılmaması gerekenler
- Google Fonts kullanılabilir; ek bağımlılıkların sürümünü sabitle ve nedenini `README.md` içinde açıkla.
- Yeni localStorage anahtarı, sunucu eşitlemesi veya hata için `alert` ekleme; görev ve analiz durumunu tek dosyada toplama.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
