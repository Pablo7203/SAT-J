import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
export default async function AccessPage() {
  await requirePermission("roles.read");
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select(
      "id, code, name, scope, role_permissions(permissions(code, description))",
    )
    .order("name");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & access"
        description="System roles are migration-controlled. Module permissions will be added in later phases."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {roles?.map((role) => (
          <Card key={role.id}>
            <div className="flex justify-between gap-3">
              <h2 className="text-lg font-bold">{role.name}</h2>
              <span className="text-xs font-semibold text-muted">
                {role.scope}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{role.code}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {role.role_permissions.flatMap((item) => {
                const permission = item.permissions as unknown as {
                  code: string;
                  description: string;
                } | null;
                return permission
                  ? [
                      <li key={permission.code}>
                        <strong>{permission.code}</strong> —{" "}
                        {permission.description}
                      </li>,
                    ]
                  : [];
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
