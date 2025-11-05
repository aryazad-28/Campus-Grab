import { useState } from "react";
import { motion } from "motion/react";
import { GraduationCap, Mail, Lock, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ThemeToggle } from "./ThemeToggle";

interface LoginPageProps {
  onLogin: (role: "student" | "admin") => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-400 to-purple-500 rounded-2xl shadow-lg"
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-slate-800 dark:text-white">AI Canteen</h1>
            <p className="text-slate-600 dark:text-slate-400">Smart ordering for smarter students</p>
          </div>

          {/* Tabs for Login/Signup */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-700">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">College ID / Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="student@college.edu"
                    className="pl-10 rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <Button
                onClick={() => onLogin("student")}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600"
              >
                Login as Student
              </Button>

              <Button
                onClick={() => onLogin("admin")}
                variant="outline"
                className="w-full rounded-xl border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Login as Admin
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">College ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="signup-email"
                    type="text"
                    placeholder="2024CS001"
                    className="pl-10 rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 rounded-xl border-slate-300"
                  />
                </div>
              </div>

              <Button
                onClick={() => onLogin("student")}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600"
              >
                Create Account
              </Button>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <button className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Continue with College ID
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
