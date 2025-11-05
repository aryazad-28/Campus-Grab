import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Clock, ChefHat, Bell } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface OrderTrackingProps {
  onBack: () => void;
  onNavigateToHistory: () => void;
}

export function OrderTracking({ onBack, onNavigateToHistory }: OrderTrackingProps) {
  const [orderStatus, setOrderStatus] = useState(0); // 0: Accepted, 1: Preparing, 2: Ready
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate order progress
    const timer1 = setTimeout(() => {
      setOrderStatus(1);
      setProgress(50);
    }, 3000);

    const timer2 = setTimeout(() => {
      setOrderStatus(2);
      setProgress(100);
    }, 6000);

    // Update progress smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 33 && orderStatus === 0) return prev + 1;
        if (prev < 66 && orderStatus === 1) return prev + 1;
        if (prev < 100 && orderStatus === 2) return prev + 1;
        return prev;
      });
    }, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(progressInterval);
    };
  }, [orderStatus]);

  const statuses = [
    { label: "Order Accepted", icon: CheckCircle2, status: 0 },
    { label: "Preparing", icon: ChefHat, status: 1 },
    { label: "Ready for Pickup", icon: Bell, status: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-xl bg-white/20 hover:bg-white/30 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-white">Track Order</h2>
            <p className="text-sm text-sky-100">Order #OD{Math.floor(Math.random() * 10000)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 rounded-3xl shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <div className="text-center mb-6">
              <motion.div
                animate={orderStatus === 2 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: orderStatus === 2 ? Infinity : 0, repeatDelay: 1 }}
                className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                {orderStatus === 0 && <Clock className="w-10 h-10" />}
                {orderStatus === 1 && <ChefHat className="w-10 h-10" />}
                {orderStatus === 2 && <Bell className="w-10 h-10" />}
              </motion.div>
              <h2 className="text-white mb-2">
                {orderStatus === 0 && "Order Accepted"}
                {orderStatus === 1 && "Being Prepared"}
                {orderStatus === 2 && "Ready for Pickup! 🎉"}
              </h2>
              <p className="text-purple-100">
                {orderStatus === 0 && "Your order is being processed"}
                {orderStatus === 1 && "Our chefs are working on your order"}
                {orderStatus === 2 && "Your order is ready at the counter"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <Progress value={progress} className="h-3 bg-white/20" />
            </div>

            {/* Estimated Time */}
            <div className="text-center">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-lg">
                <Clock className="w-4 h-4 mr-2" />
                {orderStatus === 2 ? "Ready Now!" : `~${4 - orderStatus * 2} mins remaining`}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Status Timeline */}
        <Card className="p-6 rounded-2xl shadow-lg bg-white">
          <h3 className="text-slate-800 mb-6">Order Progress</h3>
          <div className="space-y-4">
            {statuses.map((status, index) => {
              const isCompleted = index <= orderStatus;
              const isCurrent = index === orderStatus;
              const Icon = status.icon;

              return (
                <div key={index} className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                      backgroundColor: isCompleted ? "#8b5cf6" : "#e2e8f0",
                    }}
                    transition={{
                      scale: { duration: 0.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 },
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-purple-500" : "bg-slate-200"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isCompleted ? "text-white" : "text-slate-400"}`} />
                  </motion.div>
                  <div className="flex-1">
                    <p className={isCompleted ? "text-slate-800" : "text-slate-400"}>
                      {status.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-purple-600">In progress...</p>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-sm text-emerald-600">Completed</p>
                    )}
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-6 rounded-2xl shadow-lg bg-white">
          <h3 className="text-slate-800 mb-4">Order Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">2x Samosa</span>
              <span className="text-slate-800">₹40</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">1x Coffee</span>
              <span className="text-slate-800">₹30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">1x Fresh Juice</span>
              <span className="text-slate-800">₹35</span>
            </div>
            <div className="border-t-2 border-dashed border-slate-200 pt-3 flex justify-between">
              <span className="text-slate-800">Total Paid</span>
              <span className="text-purple-600">₹110</span>
            </div>
          </div>
        </Card>

        {/* Pickup Location */}
        <Card className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-sky-50 to-purple-50 border-2 border-sky-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-sky-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-slate-800 mb-1">Pickup Location</h3>
              <p className="text-slate-600">Canteen 2 - South Campus</p>
              <p className="text-sm text-slate-500">Library Block, Counter #3</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderStatus === 2 && (
            <Button
              onClick={onNavigateToHistory}
              className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white rounded-2xl py-6 shadow-lg"
            >
              Order Collected
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full rounded-2xl border-2 border-purple-300 text-purple-600 hover:bg-purple-50 py-6"
          >
            Need Help?
          </Button>
        </div>
      </div>
    </div>
  );
}
