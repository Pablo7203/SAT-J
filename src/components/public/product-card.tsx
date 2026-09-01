import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { PublicProductCard } from "@/lib/public-data";
import { formatGhs } from "@/lib/format";
export function ProductCard({ product }: { product: PublicProductCard }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eef1eb]">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400">
              <ImageIcon size={42} />
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-700">
            {product.availability}
          </span>
        </div>
        <div className="p-5">
          <p className="text-xs font-bold tracking-wider text-primary uppercase">
            {product.category}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold leading-snug">{product.name}</h2>
            <ArrowUpRight className="shrink-0 text-stone-400 transition group-hover:text-primary" />
          </div>
          {product.brand ? (
            <p className="mt-1 text-sm text-muted">{product.brand}</p>
          ) : null}
          <p className="mt-4 font-bold">
            {product.price != null
              ? `From ${formatGhs(product.price)}`
              : "Contact us for price"}
          </p>
        </div>
      </Link>
    </article>
  );
}
