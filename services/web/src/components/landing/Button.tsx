"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-porcelain disabled:opacity-50 disabled:cursor-not-allowed group";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-moss hover:bg-moss-hover text-white shadow-[0_12px_32px_rgba(31,122,77,0.2)] hover:shadow-[0_16px_36px_rgba(31,122,77,0.35)] border border-transparent",
    secondary:
      "bg-white hover:bg-cloud text-ink border border-slate-200 hover:border-slate-300 shadow-sm",
    outline: "bg-transparent border-2 border-slate-300 text-ink hover:border-moss hover:text-moss",
    ghost: "bg-transparent text-ink-sec hover:text-moss hover:bg-cloud",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = clsx(baseStyles, variants[variant], sizes[size], className);

  const content = (
    <>
      {children}
      {variant === "primary" && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
