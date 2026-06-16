import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bohac Med — Análise de Equiparação Hospitalar",
  description:
    "Descubra em segundos se sua clínica ou empresa médica tem direito à redução de impostos pela tese de equiparação hospitalar. Análise gratuita.",
  keywords: ["equiparação hospitalar", "redução de impostos médicos", "IRPJ CSLL clínica", "tese tributária médica"],
  openGraph: {
    title: "Bohac Med — Análise Gratuita de Equiparação Hospitalar",
    description: "Sua clínica pode pagar muito menos imposto. Descubra agora em segundos.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
