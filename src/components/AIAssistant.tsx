import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function AIAssistant() {
  return (
    <motion.div
      className="inline-flex items-center justify-center"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-50"></div>
        <Sparkles className="relative w-6 h-6 text-purple-600" />
      </div>
    </motion.div>
  );
}
