"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    name: string
    icon: LucideIcon
}

interface AnimeCategoryNavProps {
    items: NavItem[]
    activeItem: string | null
    onItemClick: (name: string | null) => void
    className?: string
}

export function AnimeCategoryNav({ items, activeItem, onItemClick, className }: AnimeCategoryNavProps) {
    const [mounted, setMounted] = useState(false)
    const [hoveredTab, setHoveredTab] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    if (!mounted) return null

    const allItems: NavItem[] = items

    return (
        <div className={cn("w-full", className)}>
            <div className="flex justify-center">
                <motion.div
                    className="flex items-center gap-1.5 bg-black/50 border border-white/10 backdrop-blur-lg py-1.5 px-1.5 rounded-full shadow-lg relative overflow-x-auto scrollbar-hide max-w-full"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                    }}
                >
                    {allItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeItem === item.name
                        const isHovered = hoveredTab === item.name

                        return (
                            <button
                                key={item.name}
                                onClick={() => onItemClick(isActive ? null : item.name)}
                                onMouseEnter={() => setHoveredTab(item.name)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className={cn(
                                    "relative cursor-pointer text-xs font-semibold px-3 py-2 rounded-full transition-all duration-300 whitespace-nowrap shrink-0",
                                    "text-white/70 hover:text-white",
                                    isActive && "text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{
                                            opacity: [0.3, 0.5, 0.3],
                                            scale: [1, 1.03, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-red-500/25 rounded-full blur-md" />
                                        <div className="absolute inset-[-4px] bg-red-500/20 rounded-full blur-xl" />
                                        <div className="absolute inset-[-8px] bg-red-500/15 rounded-full blur-2xl" />

                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"
                                            style={{
                                                animation: "shine 3s ease-in-out infinite"
                                            }}
                                        />
                                    </motion.div>
                                )}

                                <span className="relative z-10 flex items-center gap-1.5">
                                    <Icon size={14} strokeWidth={2.5} />
                                    <span className="hidden sm:inline">{item.name}</span>
                                </span>

                                <AnimatePresence>
                                    {isHovered && !isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="absolute inset-0 bg-white/10 rounded-full -z-10"
                                        />
                                    )}
                                </AnimatePresence>
                            </button>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}
