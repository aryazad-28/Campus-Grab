import { motion } from "motion/react";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Calendar,
  Clock,
  Hash,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./ThemeToggle";

interface OrderReceiptProps {
  orderId: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  canteen: string;
  estimatedTime: number;
  onBack: () => void;
  onDownload: () => void;
}

export function OrderReceipt({
  orderId,
  orderDate,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  transactionId,
  canteen,
  estimatedTime,
  onBack,
  onDownload,
}: OrderReceiptProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 dark:from-emerald-600 dark:via-green-600 dark:to-teal-600 text-white p-4 sticky top-0 z-10 shadow-lg">
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
            <h2 className="text-white">Order Receipt</h2>
            <p className="text-sm text-emerald-100 dark:text-emerald-200">
              Payment Successful
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Success Message */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-emerald-800 dark:text-emerald-200 mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-emerald-700 dark:text-emerald-300">
              Your order has been placed and payment confirmed
            </p>
          </Card>
        </motion.div>

        {/* Order Details */}
        <Card className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Order ID
                  </p>
                  <p className="text-purple-600 dark:text-purple-400">{orderId}</p>
                </div>
              </div>
              <Badge className="bg-emerald-400 text-white border-0">Paid</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Order Date
                  </p>
                  <p className="text-slate-800 dark:text-white text-sm">
                    {formatDate(orderDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ready In
                  </p>
                  <p className="text-slate-800 dark:text-white text-sm">
                    ~{estimatedTime} mins
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Pickup Location */}
            <div className="flex items-start gap-3 mb-6 p-4 bg-sky-50 dark:bg-sky-950 rounded-xl">
              <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Pickup Location
                </p>
                <p className="text-slate-800 dark:text-white">{canteen}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Items List */}
            <div className="space-y-3">
              <h3 className="text-slate-800 dark:text-white">Order Items</h3>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-purple-600 dark:text-purple-400">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Payment Summary */}
            <div className="space-y-3">
              <h3 className="text-slate-800 dark:text-white mb-4">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-800 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    ₹{total}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Payment Method */}
            <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Payment Method
                  </p>
                  <p className="text-slate-800 dark:text-white">{paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500 dark:text-slate-500" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Transaction ID: {transactionId}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={onDownload}
            variant="outline"
            className="rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 py-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
          <Button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-6"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Footer Note */}
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            💡 Please show this receipt at the counter for pickup
          </p>
        </Card>
      </div>
    </div>
  );
}
