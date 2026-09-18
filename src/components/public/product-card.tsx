/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { PublicProductCard } from "@/lib/public-data";
import { formatGhs } from "@/lib/format";

export function ProductCard({ product }: { product: PublicProductCard }) {
  return (
    <article className="group text-[#1d1e19]">
      <Link className="block" href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#e7ded0]">
          {product.image_url ? (
            <img
              alt={product.name}
              className="object-cover transition duration-500 group-hover:scale-[1.025]"
              src={product.image_url}
              style={{ height: "100%", width: "100%" }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#8a8478]">
              <ImageIcon size={34} />
            </div>
          )}
        </div>
        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6d695f]">
            {product.category}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold leading-snug tracking-[-0.025em]">
              {product.name}
            </h2>
            <ArrowUpRight
              className="mt-0.5 shrink-0 text-[#6d695f] transition-colors group-hover:text-[#28372c]"
              size={18}
            />
          </div>
          {product.brand ? (
            <p className="mt-1 text-sm text-[#6d695f]">{product.brand}</p>
          ) : null}
          {product.description ? (
            <p className="mt-2 line-clamp-1 text-sm text-[#6d695f]">
              {product.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#6d695f]">
              View available options
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-[#6d695f]">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${product.availability === "Available" ? "bg-[#567151]" : product.availability === "Limited availability" ? "bg-[#9a712e]" : "bg-[#8b574d]"}`}
              />
              {product.availability}
            </span>
            <span className="font-semibold text-[#28372c]">
              {product.price != null
                ? `From ${formatGhs(product.price)}`
                : "Enquire for price"}
            </span>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#28372c]">
            View product <ArrowUpRight aria-hidden="true" size={16} />
          </p>
        </div>
      </Link>
    </article>
  );
}
