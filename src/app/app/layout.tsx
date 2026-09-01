import type { ReactNode } from "react";
import { AppNavigation } from "@/components/layout/app-navigation";
import { requireActiveProfile } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";
export default async function InternalAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireActiveProfile();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppNavigation context={context} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl p-5 sm:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
