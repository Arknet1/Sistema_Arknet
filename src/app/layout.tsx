import type { Metadata } from "next";
import "./main.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ARKNET | Soluções de Telecomunicações e TI",
  description:
    "A ARKNET oferece soluções tecnológicas de excelência para o seu negócio. Infraestrutura de telecomunicações, suporte técnico e serviços de IT em Angola.",
  keywords: [
    "telecomunicações",
    "tecnologia",
    "IT",
    "Angola",
    "ARKNET",
    "suporte técnico",
    "infraestrutura",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={cn("h-full antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        {children}
      </body>
    </html>
  );
}