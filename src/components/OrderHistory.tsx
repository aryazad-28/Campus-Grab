import { motion } from "motion/react";
import { ArrowLeft, Clock, Star, Receipt, RotateCcw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface OrderHistoryProps {
  onBack: () => void;
  onReorder: () => void;
}

const pastOrders = [
  {
    id: "OD4523",
    date: "Nov 3, 2025",
    time: "12:30 PM",
    items: ["2x Samosa", "1x Coffee", "1x Fresh Juice"],
    total: 110,
    rating: 5,
    canteen: "Canteen 2",
  },
  {
    id: "OD4401",
    date: "Nov 2, 2025",
    time: "1:15 PM",
    items: ["1x Veg Thali", "1x Lassi"],
    total: 95,
    rating: 4,
    canteen: "Canteen 1",
  },
  {
    id: "OD4298",
    date: "Nov 1, 2025",
    time: "11:45 AM",
    items: ["1x Burger", "1x Cold Coffee"],
    total: 85,
    rating: 5,
    canteen: "Canteen 1",
  },
  {
    id: "OD4156",
    date: "Oct 31, 2025",
    time: "2:00 PM",
    items: ["1x Pizza Slice", "1x Coke"],
    total: 65,
    rating: 4,
    canteen: "Canteen 2",
  },
];

const favorites = [
  { name: "Samosa", orders: 12, lastOrdered: "Today" },
  { name: "Coffee", orders: 8, lastOrdered: "Today" },
  { name: "Veg Thali", orders: 6, lastOrdered: "Yesterday" },
];

export function OrderHistory({ onBack, onReorder }: OrderHistoryProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 pb-20">
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
            <h2 className="text-white">Order History</h2>
            <p className="text-sm text-sky-100">Your past orders & favorites</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Favorites Section */}
        <div>
          <h3 className="text-slate-800 mb-4">⭐ Your Favorites</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {favorites.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 rounded-2xl shadow-md bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-slate-800">{item.name}</h3>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Ordered {item.orders} times</p>
                  <Button
                    onClick={onReorder}
                    size="sm"
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reorder
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Past Orders */}
        <div>
          <h3 className="text-slate-800 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {pastOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 rounded-2xl shadow-md bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-800">Order #{order.id}</h3>
                        <Badge variant="outline" className="border-purple-200 text-purple-600">
                          {order.canteen}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{order.date} • {order.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < order.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-slate-600 text-sm">
                        • {item}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <p className="text-purple-600">₹{order.total}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                      <Button
                        onClick={onReorder}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <Card className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <h3 className="text-white mb-4">Your Stats 📊</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl mb-1">32</p>
              <p className="text-sm text-purple-100">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-1">₹2,450</p>
              <p className="text-sm text-purple-100">Spent</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-1">4.8</p>
              <p className="text-sm text-purple-100">Avg Rating</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
