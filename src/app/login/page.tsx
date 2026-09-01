import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Login" };
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          className="mx-auto mb-6 flex w-fit items-center gap-2 font-bold"
          href="/"
        >
          <Building2 aria-hidden="true" className="text-primary" /> SAT-J Ent
        </Link>
        <Card>
          <h1 className="text-2xl font-bold">Staff login</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use your SAT-J Ent account. Full access controls will be introduced
            in Phase 1.
          </p>
          <LoginForm />
          <Link
            href="/forgot-password"
            className="mt-5 block text-center text-sm font-semibold text-primary"
          >
            Forgot password?
          </Link>
        </Card>
      </div>
    </main>
  );
}
