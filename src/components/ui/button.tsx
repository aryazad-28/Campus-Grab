import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white shadow-md hover:shadow-lg hover:brightness-110 active:brightness-95",
                secondary: "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700",
                outline: "border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200",
                ghost: "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200",
                destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
                brand: "bg-gradient-to-r from-[#7F1D1D] via-[#991B1B] to-[#DC2626] text-white shadow-lg hover:shadow-xl hover:brightness-110 glow-brand",
                indigo: "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:shadow-lg hover:brightness-110",
                emerald: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:shadow-lg hover:brightness-110",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-lg px-3 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
