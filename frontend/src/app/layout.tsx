import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eduardo · Laboratorio Azure + n8n",
  description: "Laboratorio didáctico para explorar Azure, n8n y una Torre de Control con datos ficticios.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
