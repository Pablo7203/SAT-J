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
    <div
      className="internal-app flex min-h-screen flex-col bg-background text-foreground md:flex-row"
      data-theme="light"
    >
      <AppNavigation context={context} />
      <main className="min-w-0 flex-1 bg-background">
        <div className="w-full p-4 sm:p-5 lg:p-7 xl:p-8">{children}</div>
      </main>
    </div>
  );
}
