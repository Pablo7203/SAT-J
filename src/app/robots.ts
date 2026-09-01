import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (process.env.NEXT_PUBLIC_APP_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: ["/", "/app/"] } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app/",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/access-denied",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
