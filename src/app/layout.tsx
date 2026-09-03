import type { Metadata, Viewport } from "next";
import "./main.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import { Inter } from "next/font/google";
import { CustomerAuthProvider } from "@/lib/customer-auth-context";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { OrganizationJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#00102b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.arknet.co.ao"),
  title: {
    default: "ARKNET Angola | Telecomunicações, Internet Empresarial e Soluções de TI",
    template: "%s | ARKNET Angola",
  },
  description:
    "Líder em soluções de Telecomunicações, Internet Dedicada Empresarial, Cibersegurança, Cloud e Cabeamento Estruturado em Angola. Conectividade de alta disponibilidade e suporte 24/7 em Luanda.",
  keywords: [
    "telecomunicações em Angola",
    "soluções de TI em Angola",
    "internet empresarial em Angola",
    "internet dedicada em Angola",
    "serviços de cloud em Angola",
    "cibersegurança em Angola",
    "infraestrutura de redes em Angola",
    "cabeamento estruturado em Angola",
    "CFTV em Angola",
    "suporte técnico de TI em Luanda",
    "serviços de tecnologia em Luanda",
    "ARKNET",
    "ARKNET Angola",
  ],
  authors: [{ name: "ARKNET Angola", url: "https://www.arknet.co.ao" }],
  creator: "ARKNET Angola",
  publisher: "ARKNET Angola",
  applicationName: "ARKNET",
  category: "technology",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "https://www.arknet.co.ao",
  },
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: "https://www.arknet.co.ao",
    siteName: "ARKNET Angola",
    title: "ARKNET Angola | Telecomunicações, Internet Empresarial e Soluções de TI",
    description:
      "Soluções de Telecomunicações, Internet Dedicada, Cibersegurança, Cloud e Infraestruturas de TI para empresas em Angola com SLA garantido.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ARKNET — Telecomunicações e Soluções de TI em Angola",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARKNET Angola | Telecomunicações, Internet Empresarial e Soluções de TI",
    description:
      "Soluções de Telecomunicações, Internet Dedicada, Cibersegurança, Cloud e Infraestruturas de TI para empresas em Angola.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon18.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" className={cn("h-full antialiased", inter.variable)}>
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <CustomerAuthProvider>
            <ToastProvider>
              <Navbar />
              {children}
            </ToastProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}