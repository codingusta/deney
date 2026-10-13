import "./globals.css";

export const metadata = {
  title: "Yapılacaklar",
  description: "Görevlerini düzenle ve tamamla.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
