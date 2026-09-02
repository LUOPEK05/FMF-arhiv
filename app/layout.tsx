import "./globals.css";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import AuthNavLink from "@/components/AuthNavLink";

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
        <header className="border-b border-ink/10 dark:border-chalk/10 bg-paper dark:bg-chalkboardDark sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
            <a href="/" className="text-3xl sm:text-4xl font-bold tracking-tight">
              FMF Gradivo
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/upload" className="hover:underline hidden sm:inline">
                Naloži gradivo
              </a>
              <a href="/moje-objave" className="hover:underline hidden sm:inline">
                Moje objave
              </a>
              <AuthNavLink className="hover:underline hidden sm:inline" />
              <ThemeToggle />
            </nav>
          </div>
          {/* mobile nav row */}
          <div className="sm:hidden border-t border-ink/10 dark:border-chalk/10 px-4 py-2 flex gap-4 text-sm overflow-x-auto">
            <a href="/upload" className="hover:underline whitespace-nowrap">
              Naloži gradivo
            </a>
            <a href="/moje-objave" className="hover:underline whitespace-nowrap">
              Moje objave
            </a>
            <AuthNavLink className="hover:underline whitespace-nowrap" />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}