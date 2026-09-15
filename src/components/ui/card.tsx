import type { HTMLAttributes } from "react";
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border/90 bg-surface p-6 shadow-[0_1px_2px_rgb(15_23_42_/_0.06)] ${className}`}
      {...props}
    />
  );
}
