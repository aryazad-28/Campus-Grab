import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-[#C33811] via-[#F75412] to-[#FB882C] text-white shadow-md hover:shadow-lg hover:brightness-110 active:brightness-95",
                secondary: "bg-[#fdf5f0] text-[#C33811] hover:bg-[#fbe8da] dark:bg-[#241a15] dark:text-[#FB882C] dark:hover:bg-[#2d1f1a]",
                outline: "border border-[#f0e0d6] bg-white hover:bg-[#fdf5f0] hover:border-[#FB882C] dark:bg-[#1a1210] dark:border-[#2d1f1a] dark:hover:bg-[#241a15] dark:hover:border-[#FB882C]",
                ghost: "hover:bg-[#fdf5f0] dark:hover:bg-[#241a15]",
                destructive: "bg-red-500 text-white hover:bg-red-600",
                brand: "bg-gradient-to-r from-[#6D0C14] via-[#C33811] to-[#F75412] text-white shadow-lg hover:shadow-xl hover:brightness-110",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-6 text-base",
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
