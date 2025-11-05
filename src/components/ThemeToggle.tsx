import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { motion } from "motion/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="rounded-xl bg-white/20 hover:bg-white/30 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 backdrop-blur-lg"
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        key={theme}
        transition={{ duration: 0.3 }}
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-white" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </motion.div>
    </Button>
  );
}
