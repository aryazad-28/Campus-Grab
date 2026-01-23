import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/CartProvider"
import { AuthProvider } from "@/components/AuthProvider"
import { OrdersProvider } from "@/components/OrdersProvider"
import { MenuProvider } from "@/components/MenuProvider"
import { AIProvider } from "@/components/AIProvider"

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
      </body>
    </html>
  )
}
