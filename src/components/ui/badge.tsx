import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[#C33811] to-[#F75412] text-white",
                secondary: "bg-[#fdf5f0] text-[#C33811] dark:bg-[#241a15] dark:text-[#FB882C]",
                success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
                warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
                destructive: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                outline: "border border-[#f0e0d6] text-[#8a7060] dark:border-[#2d1f1a] dark:text-[#a89080]",
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
