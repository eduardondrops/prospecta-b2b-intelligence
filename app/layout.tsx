import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prospectaworbita.site"),
  title: "Prospecta | B2B Intelligence Platform",
  description: "A production-minded B2B prospecting and qualification platform engineered by Eduardo Nunes.",
  openGraph: {
    title: "Prospecta | B2B Intelligence Platform",
    description: "From fragmented business data to an actionable commercial pipeline.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
