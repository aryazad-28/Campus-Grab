import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Trash2,
  Plus,
  Minus,
  Smartphone,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "./CartContext";
import { toast } from "sonner@2.0.3";

interface CartCheckoutProps {
  onBack: () => void;
  onOrderPlaced: (orderData: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    transactionId: string;
    estimatedTime: number;
  }) => void;
}

type PaymentMethod = "phonepe" | "gpay" | "paytm" | "upi";

export function CartCheckout({ onBack, onOrderPlaced }: CartCheckoutProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("gpay");
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartTotal;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const estimatedTime = cart.length > 0 ? Math.max(...cart.map((item) => item.eta)) : 0;

  const paymentOptions = [
    {
      id: "gpay" as PaymentMethod,
      name: "Google Pay",
      icon: "🟢",
      color: "from-green-400 to-emerald-400",
    },
    {
      id: "phonepe" as PaymentMethod,
      name: "PhonePe",
      icon: "🟣",
      color: "from-purple-400 to-violet-400",
    },
    {
      id: "paytm" as PaymentMethod,
      name: "Paytm",
      icon: "🔵",
      color: "from-blue-400 to-sky-400",
    },
    {
      id: "upi" as PaymentMethod,
      name: "Other UPI",
      icon: "💳",
      color: "from-slate-400 to-gray-400",
    },
  ];

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePayment = () => {
    if (selectedPayment === "upi" && !upiId) {
      toast.error("Please enter your UPI ID");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderId = `OD${Date.now().toString().slice(-6)}`;
      const transactionId = `TXN${Date.now().toString().slice(-8)}`;
      const paymentMethodName =
        paymentOptions.find((p) => p.id === selectedPayment)?.name || "UPI";

      const orderData = {
        orderId,
        items: cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        total,
        paymentMethod: paymentMethodName,
        transactionId,
        estimatedTime,
      };

      clearCart();
      setIsProcessing(false);
      setShowPaymentDialog(false);
      toast.success("Payment successful! 🎉");
      onOrderPlaced(orderData);
    }, 2500);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 dark:from-sky-600 dark:via-purple-600 dark:to-pink-600 text-white p-4 sticky top-0 z-10 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="rounded-xl bg-white/20 hover:bg-white/30 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-white">Your Cart</h2>
            </div>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🛒
              </motion.div>
            </div>
            <h2 className="text-slate-800 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Add some delicious items to get started!
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-8"
            >
              Browse Menu
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 dark:from-sky-600 dark:via-purple-600 dark:to-pink-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-xl bg-white/20 hover:bg-white/30 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-white">Your Cart</h2>
            <p className="text-sm text-sky-100 dark:text-sky-200">{cart.length} items</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Cart Items */}
        <div className="space-y-3">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-slate-800 dark:text-white mb-1">{item.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>~{item.eta} mins</span>
                      </div>
                      <p className="text-purple-600 dark:text-purple-400 mt-1">
                        ₹{item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl p-1">
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center text-slate-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => removeFromCart(item.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Estimated Time */}
        <Card className="p-4 rounded-2xl shadow-md bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950 dark:to-sky-950 border-2 border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Estimated Pickup Time
                </p>
                <p className="text-slate-800 dark:text-white">~{estimatedTime} minutes</p>
              </div>
            </div>
            <Badge className="bg-emerald-400 text-white border-0">Ready Soon</Badge>
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 rounded-2xl shadow-lg bg-white dark:bg-slate-800">
          <h3 className="text-slate-800 dark:text-white mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
              <span className="text-slate-800 dark:text-white">Total Amount</span>
              <span className="text-purple-600 dark:text-purple-400">₹{total}</span>
            </div>
          </div>
        </Card>

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-6 shadow-lg"
        >
          Proceed to Payment • ₹{total}
        </Button>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md rounded-3xl bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-800 dark:text-white">
              Choose Payment Method
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Select your preferred UPI payment method to complete the order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup value={selectedPayment} onValueChange={(v) => setSelectedPayment(v as PaymentMethod)}>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPayment === option.id
                        ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/30"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-white">{option.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Pay via {option.name}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>

            {selectedPayment === "upi" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="upi-id" className="text-slate-700 dark:text-slate-300">
                  Enter UPI ID
                </Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="upi-id"
                    type="text"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="pl-10 rounded-xl dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </motion.div>
            )}

            <Card className="bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 dark:text-slate-300">Amount to Pay</span>
                <span className="text-purple-600 dark:text-purple-400">₹{total}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inclusive of all taxes
              </p>
            </Card>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-6"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <>Pay ₹{total}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
