import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

/**
 * Jost é a família do grupo Bohac (bohac.com.br usa a mesma).
 * Sem `weight`: o Google serve o arquivo variável (wght 100–900) num único
 * download. Passar `weight: [...]` forçaria 6 instâncias estáticas.
 */
const jost = Jost({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jost",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bohacmed.com.br"),
  title: "Bohac Med — Equiparação Hospitalar para clínicas médicas",
  description:
    "Verificação preliminar de enquadramento de clínicas e serviços médicos no regime de equiparação hospitalar (Lei 9.249/1995, art. 15, §1º, III, 'a').",
  keywords: [
    "equiparação hospitalar",
    "IRPJ CSLL clínica médica",
    "lucro presumido serviços hospitalares",
    "direito médico tributário",
  ],
  openGraph: {
    title: "Bohac Med — Equiparação Hospitalar",
    description:
      "Clínicas no Lucro Presumido podem estar recolhendo IRPJ e CSLL sobre base maior do que a devida.",
    type: "website",
    locale: "pt_BR",
    siteName: "Bohac Med",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Bohac Med" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1a33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* A variável da fonte VAI NO <html>.
       `:root` (onde --sans é declarada em globals.css) É o <html>; se
       --font-jost nascesse no <body>, `--sans` resolveria como valor inválido
       e a tipografia inteira cairia para o fallback — sem erro visível. */
    <html lang="pt-BR" className={jost.variable}>
      {/* Sem className: cor e fundo vêm de body{} em globals.css. */}
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
