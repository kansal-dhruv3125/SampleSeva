import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** When provided, renders a react-router Link instead of a <button>. */
  to?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-600 text-white shadow-float hover:bg-primary-700 active:bg-primary-800",
  secondary: "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200 hover:bg-primary-100",
  outline: "border border-slate-300 bg-white text-slate-700 hover:border-primary-400 hover:text-primary-700",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  white: "bg-white text-primary-700 shadow-card hover:bg-primary-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  to,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
