import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = "https://vetflow-saas.vercel.app"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0ea5e9",
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VetFlow — Sistema de Gestão para Clínicas Veterinárias",
    template: "%s | VetFlow",
  },
  description:
    "VetFlow é o sistema SaaS completo para clínicas e consultórios veterinários: tutores, pets, agenda de consultas, prontuário eletrônico e financeiro num só lugar. 7 dias grátis.",
  keywords: ["gestão veterinária", "software veterinário", "prontuário veterinário", "agenda veterinária", "clínica veterinária", "VetFlow", "SaaS veterinário"],
  authors: [{ name: "Estevam Souza" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "VetFlow",
    title: "VetFlow — Gestão para Clínicas Veterinárias",
    description: "Tutores, pets, agenda, prontuário e financeiro num só lugar. 7 dias grátis.",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
