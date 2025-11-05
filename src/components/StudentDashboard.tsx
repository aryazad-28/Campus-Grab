import { motion } from "motion/react";
import { Clock, TrendingUp, Zap, ChefHat, Users, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AIAssistant } from "./AIAssistant";
import { ThemeToggle } from "./ThemeToggle";

interface StudentDashboardProps {
  onNavigateToMenu: () => void;
}

export function StudentDashboard({ onNavigateToMenu }: StudentDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 dark:from-sky-600 dark:via-purple-600 dark:to-pink-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white mb-1">Welcome back, Student! 👋</h1>
              <p className="text-sky-100 dark:text-sky-200">What would you like to eat today?</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* AI Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-3xl shadow-2xl border-0 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 flex-shrink-0">
                <AIAssistant />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white">🍽 AI Recommendation</h3>
                  <Badge className="bg-white/20 text-white border-0">Smart</Badge>
                </div>
                <p className="text-purple-100 mb-4">
                  <span>Samosa</span> is ready in <span>4 mins</span>
                </p>
                <div className="flex items-center gap-2 text-sm mb-4">
                  <Zap className="w-4 h-4" />
                  <span className="text-purple-100">Canteen 2 is faster by 3 minutes</span>
                </div>
                <Button
                  onClick={onNavigateToMenu}
                  className="bg-white text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  Order Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Canteen Selection */}
        <div className="mb-6">
          <h2 className="text-slate-800 mb-4">Choose Your Canteen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Canteen 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950 dark:to-sky-950">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-emerald-400 rounded-2xl p-3">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-emerald-400 text-white border-0">Open</Badge>
                </div>
                <h3 className="text-slate-800 dark:text-white mb-2">Canteen 1</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">North Campus • Main Building</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">12 in queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">~8 mins</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Canteen 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToMenu}
            >
              <Card className="p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-sky-200 dark:border-sky-700 bg-gradient-to-br from-sky-50 to-purple-50 dark:from-sky-950 dark:to-purple-950 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Faster
                  </Badge>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-sky-400 rounded-2xl p-3">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-sky-400 text-white border-0">Open</Badge>
                </div>
                <h3 className="text-slate-800 dark:text-white mb-2">Canteen 2</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">South Campus • Library Block</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">5 in queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">~5 mins</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-slate-800">
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fastest Item</p>
              <p className="text-slate-800 dark:text-white">Samosa</p>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-slate-800">
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Popular Today</p>
              <p className="text-slate-800 dark:text-white">Veg Thali</p>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-slate-800">
            <div className="text-center">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/50 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Wait</p>
              <p className="text-slate-800 dark:text-white">6 mins</p>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-slate-800">
            <div className="text-center">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">New Item</p>
              <p className="text-slate-800 dark:text-white">Cold Coffee</p>
            </div>
          </Card>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onNavigateToMenu}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-6 shadow-lg"
        >
          Browse Menu
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
