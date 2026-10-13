# Next.js arayüzü, Flask analiz API'si

Durum: accepted

Mevcut kural tabanlı LangGraph akışını Flask API'sinde koruyup arayüzü Next.js App Router'a taşıyoruz; Next.js bu API'ye istek iletecek. Böylece istenen React/Tailwind bileşen ekosistemi kullanılabilirken Python analiz akışı ve LLM'siz çalışma korunur; geliştirme ortamında arayüz ve API ayrı süreçlerde çalışır.
