type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export const publicSiteUrl = (path = "") =>
  new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").toString();

export function StructuredData({ data }: { data: JsonLd }) {
  const json = JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: publicSiteUrl(item.path),
    })),
  };
}
