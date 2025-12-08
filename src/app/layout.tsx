import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/contexts/auth-context";
import { TenantProvider } from "@/shared/contexts/tenant-context";
import { QueryProvider } from "@/shared/contexts/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestión de Seguridad Stegmaier",
  description: "Sistema integral de gestión de documentos de seguridad industrial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <TenantProvider>
              {children}
            </TenantProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
