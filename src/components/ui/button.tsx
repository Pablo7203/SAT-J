"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
type Variant = "primary" | "secondary" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-secondary text-secondary-foreground hover:bg-border",
  danger: "bg-destructive text-white hover:opacity-90",
};
const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-[background-color,box-shadow,transform] duration-200 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};
export function Button({
  className = "",
  variant = "primary",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const { pending } = useFormStatus();
  const isWorking = pending && props.type !== "button";
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isWorking}
      aria-busy={isWorking || undefined}
      {...props}
    >
      {isWorking ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: string;
  variant?: Variant;
};
export function ButtonLink({
  children,
  className = "",
  href,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${className}`}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
