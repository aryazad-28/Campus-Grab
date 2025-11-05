import { motion } from "motion/react";
import { TrendingUp, Users, Clock, AlertCircle, ChefHat, CheckCircle2, BarChart3 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AIAssistant } from "./AIAssistant";

interface AdminDashboardProps {
  onNavigateToAnalytics: () => void;
}

const incomingOrders = [
  { id: "OD4525", items: ["2x Samosa", "1x Coffee"], time: "Just now", status: "new" },
  { id: "OD4524", items: ["1x Veg Thali"], time: "2 mins ago", status: "preparing" },
  { id: "OD4523", items: ["1x Burger", "1x Coke"], time: "5 mins ago", status: "preparing" },
  { id: "OD4522", items: ["1x Pizza Slice"], time: "8 mins ago", status: "ready" },
];

const topItems = [
  { name: "Samosa", sold: 45, trend: "+12%" },
  { name: "Coffee", sold: 38, trend: "+8%" },
  { name: "Veg Thali", sold: 32, trend: "+5%" },
];

export function AdminDashboard({ onNavigateToAnalytics }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white mb-1">Admin Dashboard 👨‍🍳</h1>
              <p className="text-emerald-100">Canteen 2 - South Campus</p>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* AI Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-6 rounded-3xl shadow-2xl border-0 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 flex-shrink-0">
                <AIAssistant />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white">🤖 AI Load Insights</h3>
                  <Badge className="bg-white/20 text-white border-0">Live</Badge>
                </div>
                <p className="text-orange-100 mb-3">
                  Current load: <span>Moderate</span> • Expected wait time: <span>6-8 mins</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-sm text-orange-100 mb-1">Peak Hour Prediction</p>
                    <p className="text-white">1:30 PM - 2:00 PM</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3">
                    <p className="text-sm text-orange-100 mb-1">Trending Item</p>
                    <p className="text-white">Samosa ↑</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-600 border-0">+12%</Badge>
              </div>
              <h3 className="text-slate-800">142</h3>
              <p className="text-sm text-slate-600">Total Orders Today</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-600 border-0">Live</Badge>
              </div>
              <h3 className="text-slate-800">8</h3>
              <p className="text-sm text-slate-600">Queue Length</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-slate-800">6.5 min</h3>
              <p className="text-sm text-slate-600">Avg Wait Time</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-pink-600" />
                </div>
                <Badge className="bg-pink-100 text-pink-600 border-0">Low</Badge>
              </div>
              <h3 className="text-slate-800">3</h3>
              <p className="text-sm text-slate-600">Low Stock Items</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Incoming Orders */}
          <div>
            <h3 className="text-slate-800 mb-4">📋 Incoming Orders</h3>
            <div className="space-y-3">
              {incomingOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 rounded-2xl shadow-md bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-slate-800 mb-1">Order #{order.id}</h3>
                        <p className="text-sm text-slate-500">{order.time}</p>
                      </div>
                      <Badge
                        className={`${
                          order.status === "new"
                            ? "bg-purple-100 text-purple-600"
                            : order.status === "preparing"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-emerald-100 text-emerald-600"
                        } border-0`}
                      >
                        {order.status === "new" ? "New" : order.status === "preparing" ? "Preparing" : "Ready"}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-sm text-slate-600">
                          • {item}
                        </p>
                      ))}
                    </div>

                    {order.status === "new" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-white rounded-xl"
                        >
                          Start Cooking
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-slate-300"
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {order.status === "preparing" && (
                      <div className="space-y-2">
                        <Progress value={65} className="h-2" />
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                        >
                          Mark as Ready
                        </Button>
                      </div>
                    )}

                    {order.status === "ready" && (
                      <Button
                        size="sm"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top Items & Analytics */}
          <div className="space-y-6">
            {/* Top Items */}
            <div>
              <h3 className="text-slate-800 mb-4">🔥 Top Items Today</h3>
              <Card className="p-5 rounded-2xl shadow-lg bg-white">
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-800">{item.name}</span>
                          <Badge className="bg-emerald-100 text-emerald-600 border-0 text-xs">
                            {item.trend}
                          </Badge>
                        </div>
                        <Progress value={(item.sold / 50) * 100} className="h-2" />
                      </div>
                      <span className="ml-4 text-purple-600">{item.sold}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-slate-800 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={onNavigateToAnalytics}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-6 justify-start"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  View Analytics & Reports
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-2 border-sky-300 text-sky-600 hover:bg-sky-50 py-6 justify-start"
                >
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Manage Inventory
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
