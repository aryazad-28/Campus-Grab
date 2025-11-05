import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Clock, Zap, Filter, Search, ArrowLeft } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { AIAssistant } from "./AIAssistant";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ThemeToggle } from "./ThemeToggle";
import { useCart, MenuItem } from "./CartContext";
import { toast } from "sonner@2.0.3";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";


interface MenuPageProps {
  onNavigateToCart: () => void;
  onBack: () => void;
}

const categories = ["All", "Snacks", "Meals", "Beverages"];

export function MenuPage({ onNavigateToCart, onBack }: MenuPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart: addToCartContext, cartCount } = useCart();
  const [recommendedItem, setRecommendedItem] = useState<MenuItem | null>(null);
  const [recommendedCanteen, setRecommendedCanteen] = useState<number | null>(null);


  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  useEffect(() => {
  const fetchMenu = async () => {
    const querySnapshot = await getDocs(collection(db, "menuItems"));
    const items: MenuItem[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        price: Number(data.price),
        eta: Number(data.eta),
        canteen: Number(data.canteen),
      };
    }) as MenuItem[];

    setMenuItems(items);

    // 🧠 AI Logic: Find fastest item + best canteen
    if (items && items.length > 0) {
      // Find the fastest item (lowest ETA)
      const fastestItem = items.reduce((best, item) =>
        item.eta < best.eta ? item : best
      );
      setRecommendedItem(fastestItem);

      // Calculate which canteen is faster (lower average ETA)
      const canteenStats: Record<number, { totalEta: number; count: number }> = {};
      items.forEach((item) => {
        if (!canteenStats[item.canteen]) {
          canteenStats[item.canteen] = { totalEta: 0, count: 0 };
        }
        canteenStats[item.canteen].totalEta += item.eta;
        canteenStats[item.canteen].count += 1;
      });

      let bestCanteen = null;
      let bestAvgEta = Infinity;

      for (const [canteen, data] of Object.entries(canteenStats)) {
        const avg = data.totalEta / data.count;
        if (avg < bestAvgEta) {
          bestAvgEta = avg;
          bestCanteen = Number(canteen);
        }
      }

      setRecommendedCanteen(bestCanteen);
    }
  };

  fetchMenu();
}, [menuItems]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 dark:from-sky-600 dark:via-purple-600 dark:to-pink-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="rounded-xl bg-white/20 hover:bg-white/30 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-white">Menu</h2>
              <p className="text-sm text-sky-100 dark:text-sky-200">Canteen 2 - South Campus</p>
            </div>
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl bg-white dark:bg-slate-800 dark:text-white border-0"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* AI Smart Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-2xl shadow-lg border-0">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-2 flex-shrink-0">
                <AIAssistant />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">⚡ Fastest Available</h3>
                <p className="text-sm text-yellow-100">
  {recommendedItem && recommendedCanteen
    ? `${recommendedItem.name} is the fastest right now (~${recommendedItem.eta} mins). Canteen ${recommendedCanteen} is currently serving quicker!`
    : "Analyzing canteen data..."}
</p>

              </div>
            </div>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`rounded-xl flex-shrink-0 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                  : "border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800">
                <div className="relative">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  {item.readySoon && (
                    <Badge className="absolute top-2 right-2 bg-emerald-400 text-white border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      Ready Soon
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-slate-800 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                    <p className="text-purple-600 dark:text-purple-400">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>~{item.eta} mins</span>
                    <span className="text-slate-400 dark:text-slate-600">•</span>
                    <span>Canteen {item.canteen}</span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white rounded-xl"
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <Button
            onClick={onNavigateToCart}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-6 shadow-2xl flex items-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>View Cart ({cartCount})</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
