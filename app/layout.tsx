import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FMF Gradivo",
  description: "Izpiti, kolokviji, vaje in literatura za FMF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sl">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-bold">
              FMF Gradivo
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/upload" className="hover:underline">
                Naloži gradivo
              </a>
              <a href="/moje-objave" className="hover:underline">
                Moje objave
              </a>
              <a href="/login" className="hover:underline">
                Prijava
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}