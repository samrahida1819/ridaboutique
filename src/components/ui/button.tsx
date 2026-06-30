import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-green text-brand-ivory shadow-luxury hover:bg-brand-deep active:translate-y-px",
  secondary:
    "bg-brand-ivory text-brand-green ring-1 ring-brand-green/15 hover:bg-brand-cream",
  outline:
    "bg-transparent text-brand-green ring-1 ring-brand-green/25 hover:bg-brand-green hover:text-brand-ivory",
  ghost: "bg-transparent text-current hover:bg-current/10",
  gold: "bg-brand-gold text-brand-green shadow-gold-soft hover:bg-brand-champagne"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm",
  icon: "h-10 w-10 p-0"
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-luxury active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      type={type}
      {...props}
    />
  );
}

type ButtonLinkProps<T extends ElementType = typeof Link> = {
  as?: T;
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "href" | "className" | "children">;

export function ButtonLink<T extends ElementType = typeof Link>({
  as,
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps<T>) {
  const Component = as || Link;

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-luxury active:scale-[0.97]",
        variants[variant],
        sizes[size],
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </Component>
  );
}
