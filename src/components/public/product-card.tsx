import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { PublicProductCard } from "@/lib/public-data";
import { formatGhs } from "@/lib/format";
export function ProductCard({ product }: { product: PublicProductCard }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_35px_rgb(15_23_42_/_0.12)]">
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
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold tracking-wide text-primary">
            {product.category}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h2 className="text-lg font-bold leading-snug">{product.name}</h2>
            <ArrowUpRight className="shrink-0 text-stone-400 transition group-hover:text-primary" />
          </div>
          {product.brand ? (
            <p className="mt-1 text-sm text-muted-foreground">{product.brand}</p>
          ) : null}
          <p className="mt-3 text-xs font-semibold text-muted-foreground">
            {product.availability}
          </p>
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
