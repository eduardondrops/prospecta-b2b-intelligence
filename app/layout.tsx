import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prospectaworbita.site"),
  title: "Prospecta | B2B Intelligence Platform",
  description: "Pesquisa, qualificação e organização de prospects B2B em um fluxo comercial controlado.",
  openGraph: {
    title: "Prospecta | B2B Intelligence Platform",
    description: "Transforme sinais de mercado em um pipeline comercial acionável.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
