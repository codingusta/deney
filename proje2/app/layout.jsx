import "./globals.css";
import AmbientBackdrop from "./AmbientBackdrop";

export const metadata = {
  title: "Yapılacaklar",
  description: "Görevlerini düzenle ve tamamla.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-theme="dark">
      <body>
        <AmbientBackdrop />
        {children}
      </body>
    </html>
  );
}
