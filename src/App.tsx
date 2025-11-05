import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoginPage } from "./components/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { MenuPage } from "./components/MenuPage";
import { CartCheckout } from "./components/CartCheckout";
import { OrderTracking } from "./components/OrderTracking";
import { OrderHistory } from "./components/OrderHistory";
import { OrderReceipt } from "./components/OrderReceipt";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminAnalytics } from "./components/AdminAnalytics";
import { ThemeProvider } from "./components/ThemeProvider";
import { CartProvider, useCart } from "./components/CartContext";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";
import { Home, ShoppingCart, Clock, History, ChefHat, BarChart3 } from "lucide-react";

type UserRole = "guest" | "student" | "admin";
type StudentPage = "dashboard" | "menu" | "cart" | "tracking" | "history" | "receipt";
type AdminPage = "dashboard" | "analytics";

interface OrderData {
  orderId: string;
  orderDate: Date;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  estimatedTime: number;
}

function StudentInterface({ onLogout }: { onLogout: () => void }) {
  const [studentPage, setStudentPage] = useState<StudentPage>("dashboard");
  const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
  const { cartCount } = useCart();

  const handleOrderPlaced = (orderData: Omit<OrderData, "orderDate">) => {
    setCurrentOrder({
      ...orderData,
      orderDate: new Date(),
    });
    setStudentPage("receipt");
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate a PDF
    const receiptText = `
      ========================================
      CANTEEN ORDER RECEIPT
      ========================================
      Order ID: ${currentOrder?.orderId}
      Date: ${currentOrder?.orderDate.toLocaleString()}
      
      Items:
      ${currentOrder?.items.map((item) => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join("\n      ")}
      
      Subtotal: ₹${currentOrder?.subtotal}
      GST (5%): ₹${currentOrder?.tax}
      Total: ₹${currentOrder?.total}
      
      Payment: ${currentOrder?.paymentMethod}
      Transaction ID: ${currentOrder?.transactionId}
      ========================================
    `;
    
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${currentOrder?.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {studentPage === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StudentDashboard onNavigateToMenu={() => setStudentPage("menu")} />
          </motion.div>
        )}
        {studentPage === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MenuPage
              onNavigateToCart={() => setStudentPage("cart")}
              onBack={() => setStudentPage("dashboard")}
            />
          </motion.div>
        )}
        {studentPage === "cart" && (
          <motion.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CartCheckout
              onBack={() => setStudentPage("menu")}
              onOrderPlaced={handleOrderPlaced}
            />
          </motion.div>
        )}
        {studentPage === "tracking" && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrderTracking
              onBack={() => setStudentPage("dashboard")}
              onNavigateToHistory={() => setStudentPage("history")}
            />
          </motion.div>
        )}
        {studentPage === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrderHistory
              onBack={() => setStudentPage("dashboard")}
              onReorder={() => setStudentPage("menu")}
            />
          </motion.div>
        )}
        {studentPage === "receipt" && currentOrder && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OrderReceipt
              orderId={currentOrder.orderId}
              orderDate={currentOrder.orderDate}
              items={currentOrder.items}
              subtotal={currentOrder.subtotal}
              tax={currentOrder.tax}
              total={currentOrder.total}
              paymentMethod={currentOrder.paymentMethod}
              transactionId={currentOrder.transactionId}
              canteen="Canteen 2 - South Campus"
              estimatedTime={currentOrder.estimatedTime}
              onBack={() => setStudentPage("dashboard")}
              onDownload={handleDownloadReceipt}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Students */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setStudentPage("dashboard")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                studentPage === "dashboard"
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setStudentPage("menu")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                studentPage === "menu"
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Menu</span>
            </button>
            <button
              onClick={() => setStudentPage("cart")}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                studentPage === "cart"
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="relative">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-pink-500 to-rose-500 border-0">
                    {cartCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs">Cart</span>
            </button>
            <button
              onClick={() => setStudentPage("tracking")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                studentPage === "tracking"
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs">Track</span>
            </button>
            <button
              onClick={() => setStudentPage("history")}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                studentPage === "history"
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs">History</span>
            </button>
            <button
              onClick={onLogout}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      <Toaster />
    </div>
  );
}

function AppContent() {
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [adminPage, setAdminPage] = useState<AdminPage>("dashboard");

  const handleLogin = (role: "student" | "admin") => {
    setUserRole(role);
    if (role === "admin") {
      setAdminPage("dashboard");
    }
  };

  const handleLogout = () => {
    setUserRole("guest");
    setAdminPage("dashboard");
  };

  // Student Navigation
  if (userRole === "student") {
    return <StudentInterface onLogout={handleLogout} />;
  }

  // Admin Navigation
  if (userRole === "admin") {
    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          {adminPage === "dashboard" && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard onNavigateToAnalytics={() => setAdminPage("analytics")} />
            </motion.div>
          )}
          {adminPage === "analytics" && (
            <motion.div
              key="admin-analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminAnalytics onBack={() => setAdminPage("dashboard")} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation for Admin */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-around py-3">
              <button
                onClick={() => setAdminPage("dashboard")}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  adminPage === "dashboard"
                    ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ChefHat className="w-5 h-5" />
                <span className="text-xs">Dashboard</span>
              </button>
              <button
                onClick={() => setAdminPage("analytics")}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  adminPage === "analytics"
                    ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">Analytics</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-xs">Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        <Toaster />
      </div>
    );
  }

  // Guest (Login Page)
  return (
    <>
      <LoginPage onLogin={handleLogin} />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
}
