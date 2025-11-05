import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminAnalyticsProps {
  onBack: () => void;
}

const salesData = [
  { time: "9 AM", orders: 12, revenue: 850 },
  { time: "10 AM", orders: 18, revenue: 1200 },
  { time: "11 AM", orders: 25, revenue: 1800 },
  { time: "12 PM", orders: 42, revenue: 3200 },
  { time: "1 PM", orders: 55, revenue: 4100 },
  { time: "2 PM", orders: 38, revenue: 2900 },
  { time: "3 PM", orders: 22, revenue: 1650 },
];

const categoryData = [
  { name: "Snacks", value: 45, color: "#f59e0b" },
  { name: "Meals", value: 35, color: "#8b5cf6" },
  { name: "Beverages", value: 20, color: "#06b6d4" },
];

const popularItems = [
  { name: "Samosa", count: 45 },
  { name: "Coffee", count: 38 },
  { name: "Veg Thali", count: 32 },
  { name: "Sandwich", count: 28 },
  { name: "Burger", count: 24 },
];

export function AdminAnalytics({ onBack }: AdminAnalyticsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-xl bg-white/20 hover:bg-white/30 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-white">Analytics & Reports</h2>
            <p className="text-sm text-emerald-100">Performance insights for today</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">+18%</Badge>
              </div>
              <h3 className="text-white mb-1">₹15,750</h3>
              <p className="text-sm text-purple-100">Total Revenue</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-sky-500 text-white border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">+12%</Badge>
              </div>
              <h3 className="text-white mb-1">212</h3>
              <p className="text-sm text-emerald-100">Orders Completed</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-sky-500 to-purple-500 text-white border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <Badge className="bg-white/20 text-white border-0">+8%</Badge>
              </div>
              <h3 className="text-white mb-1">168</h3>
              <p className="text-sm text-sky-100">Unique Customers</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-5 rounded-2xl shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-white mb-1">₹74</h3>
              <p className="text-sm text-yellow-100">Avg Order Value</p>
            </Card>
          </motion.div>
        </div>

        {/* Sales Trend Chart */}
        <Card className="p-6 rounded-2xl shadow-lg bg-white">
          <h3 className="text-slate-800 mb-4">📈 Sales Trend Today</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", r: 5 }}
                name="Orders"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: "#ec4899", r: 5 }}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card className="p-6 rounded-2xl shadow-lg bg-white">
            <h3 className="text-slate-800 mb-4">🍽 Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Popular Items */}
          <Card className="p-6 rounded-2xl shadow-lg bg-white">
            <h3 className="text-slate-800 mb-4">⭐ Popular Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularItems}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <h3 className="text-white mb-4">🎯 Performance Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <p className="text-sm text-purple-100 mb-1">Peak Hour</p>
              <p className="text-white">1:00 PM - 2:00 PM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <p className="text-sm text-purple-100 mb-1">Customer Satisfaction</p>
              <p className="text-white">4.6 / 5.0 ⭐</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <p className="text-sm text-purple-100 mb-1">Avg Preparation Time</p>
              <p className="text-white">6.5 minutes</p>
            </div>
          </div>
        </Card>

        {/* Inventory Status */}
        <Card className="p-6 rounded-2xl shadow-lg bg-white">
          <h3 className="text-slate-800 mb-4">📦 Inventory Status</h3>
          <div className="space-y-3">
            {[
              { item: "Samosa (Raw)", stock: 85, status: "good" },
              { item: "Coffee Powder", stock: 45, status: "medium" },
              { item: "Bread", stock: 15, status: "low" },
              { item: "Vegetables", stock: 70, status: "good" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-slate-800 mb-1">{item.item}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === "good"
                            ? "bg-emerald-500"
                            : item.status === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${item.stock}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600">{item.stock}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
