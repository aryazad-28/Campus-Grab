import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/CartProvider"
import { AuthProvider } from "@/components/AuthProvider"
import { OrdersProvider } from "@/components/OrdersProvider"
import { Header } from "@/components/Header"
import { CurrentOrderBanner } from "@/components/CurrentOrderBanner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Campus Grab - Quick Campus Food Ordering",
  description: "Order food from your campus canteens quickly and easily.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <OrdersProvider>
              <Header />
              <main className="min-h-[calc(100vh-4rem)] pb-24">
                {children}
              </main>
              <CurrentOrderBanner />
            </OrdersProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
