import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";

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
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
