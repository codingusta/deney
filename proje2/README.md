Markdown
## 📄 Licensing & Commercial Use

This project is licensed under the **PolyForm Noncommercial License 1.0.0** (Free for personal, educational, and noncommercial use).

💼 **Commercial Licensing:**
If you wish to use this software, its source code, or derived products for commercial purposes or within a commercial enterprise, you must acquire a commercial license. 

Please contact



# proje2 — Yapılacaklar

Next.js App Router arayüzü, Flask tabanlı kural tabanlı LangGraph analiz API'siyle birlikte çalışır. Görevler ve analiz sonuçları tarayıcıda `proje2-todos` anahtarı altında saklanır; eski görev dizileri ilk açılışta sürüm bilgili kayıt zarfına taşınır.

## Geliştirme

Windows PowerShell'de `proje2` klasöründen:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm install
npm run dev
```

`npm run dev` Next.js'i `http://localhost:3000` üzerinde ve Flask API'sini `http://127.0.0.1:8000` üzerinde başlatır. `FLASK_API_URL` ayarlanırsa Next.js proxy hedefi değiştirilebilir. API uçları `POST /api/analiz` ve `GET /api/graf` şeklindedir.

## Bağımlılıklar

Sürümler `package.json` ve `requirements.txt` içinde sabitlenir; npm kurulumunda kesin çözüm ağacı `package-lock.json` ile kaydedilir.

- `next`, `react` ve `react-dom`, App Router tabanlı web uygulamasını sunmak ve etkileşimli arayüzü oluşturmak için kullanılır.
- `@fontsource-variable/inter`, tipografiyi ağ isteği veya Google Fonts çalışma zamanı CDN'si gerektirmeden Inter değişken fontuyla sunmak için eklenmiştir.
- `tailwindcss` ve `@tailwindcss/postcss`, uygulama bileşenlerinin responsive stillerini Tailwind üzerinden derlemek için kullanılır.
- `@radix-ui/react-slot` ve `@radix-ui/react-checkbox`, shadcn/ui uyumlu bileşenlerde erişilebilir Radix yapı taşları için eklenmiştir.
- `lucide-react`, arayüzde tutarlı ve erişilebilir SVG simgeleri sağlamak için kullanılır.
- `framer-motion`, arayüz geçişleri ve küçük etkileşim hareketleri için kullanılır.
- `@xyflow/react`, LangGraph düğümlerini ve bağlantılarını etkileşimli görselleştirmek için kullanılır.
- `recharts`, tarih bazlı tamamlanma istatistik grafiği için kullanılır.
- `postcss`, Tailwind v4 PostCSS eklentisini Next.js derlemesine bağlamak için kullanılır.
- `@playwright/test`, Next.js ve Flask birlikte çalışırken tarayıcı uçtan uca testleri yürütmek için geliştirme bağımlılığıdır.
- `Flask`, HTTP JSON API uçlarını sunar; `langgraph`, görev analizinin kural tabanlı düğüm akışını çalıştırır; `pytest`, API testlerini yürütür.

## Testler

```powershell
npm run test:api
npx playwright install chromium
npm run test:e2e
```

API testleri Flask test istemcisini, E2E testleri çalışan Next.js ve Flask süreçlerini kullanır.
