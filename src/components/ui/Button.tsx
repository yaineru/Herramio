import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-slate-950 text-white shadow-[0_18px_30px_rgba(15,23,42,0.22)] hover:bg-slate-900 active:bg-slate-950",
  // Gradient runs emerald-600 -> teal-700, measured at 5.48:1 and 5.47:1
  // against the white label. It used to end at emerald-500, which is
  // 2.54:1 — so the right-hand half of the most prominent button on the
  // site failed AA, and `hover:from-emerald-500` made it worse on hover
  // by lightening the dark end too. That is the exact failure mode the
  // token overrides in globals.css were introduced to prevent; it came
  // back through a component that hardcoded the shade instead of using
  // them. Hover and active now go DARKER, never lighter.
  secondary:
    "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-[0_16px_26px_rgba(4,120,87,0.2)] hover:from-emerald-700 hover:to-teal-800 active:from-emerald-700 active:to-teal-800",
  outline: "border border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[-0.01em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
