import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireActiveProfile } from "@/lib/auth/authorization";
export default async function ProfilePage() {
  const context = await requireActiveProfile();
  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Your employee identity and current access configuration."
      />
      <Card>
        <dl className="grid gap-5 sm:grid-cols-2">
          <Item
            label="Name"
            value={context.profile.fullName || "Not provided"}
          />
          <Item label="Email" value={context.user.email} />
          <Item label="Phone" value={context.profile.phone || "Not provided"} />
          <Item label="Role" value={context.role.name} />
          <Item label="Status" value="Active" />
          <Item
            label="Branches"
            value={
              context.role.scope === "COMPANY"
                ? "All branches"
                : context.accessibleBranches
                    .map((branch) => branch.name)
                    .join(", ") || "No active assignments"
            }
          />
        </dl>
      </Card>
    </div>
  );
}
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
