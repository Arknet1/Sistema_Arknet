import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import "@/styles/hr-theme.css";
import { HrToastProvider } from "@/components/hr/hr-toast";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0868B0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Recursos Humanos · J.Matos",
    template: "%s · J.Matos RH",
  },
  description: "Gestão de Recursos Humanos e Portal do Colaborador · J.Matos Tecnologia",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/hr/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/hr/favicon.png", sizes: "128x128", type: "image/png" },
    ],
    apple: "/hr/icon-192.png",
  },
};

export default function HrRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" className={`hr-html ${sourceSans.variable}`}>
      <body className="hr-root min-h-dvh flex flex-col bg-[var(--hr-bg)] text-[var(--hr-text)] antialiased">
        <HrToastProvider>
          {children}
        </HrToastProvider>
      </body>
    </html>
  );
}
