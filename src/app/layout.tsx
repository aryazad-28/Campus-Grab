import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { CartProvider } from "@/components/CartProvider"
import { AuthProvider } from "@/components/AuthProvider"
import { OrdersProvider } from "@/components/OrdersProvider"
import { MenuProvider } from "@/components/MenuProvider"
import { AIProvider } from "@/components/AIProvider"
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Campus Grab - Quick Campus Food Ordering",
  description: "Order food from your campus canteens quickly and easily.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Campus Grab",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AIProvider>
              <MenuProvider>
                <CartProvider>
                  <OrdersProvider>
                    {children}
                  </OrdersProvider>
                </CartProvider>
              </MenuProvider>
            </AIProvider>
          </AuthProvider>
        </NextIntlClientProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
