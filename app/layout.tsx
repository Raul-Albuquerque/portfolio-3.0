import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";
import { LanguageProvider } from "./context/LanguageContext";


export const metadata: Metadata = {
  title: "Raul Albuquerque | Full Stack Developer",
  description: "Raul Albuquerque | Full Stack Developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
