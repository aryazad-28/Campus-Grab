import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[#C33811] to-[#F75412] text-white border-transparent",
                secondary: "bg-[#fdf5f0] text-[#C33811] border-[#f0e0d6] dark:bg-[#241a15] dark:text-[#FB882C] dark:border-[#2d1f1a]",
                success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40",
                warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
                destructive: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40",
                outline: "border-[#f0e0d6] text-[#8a7060] dark:border-[#2d1f1a] dark:text-[#a89080]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
