"use server";
import { revalidatePath } from "next/cache";
import {
  branchSchema,
  employeeSchema,
  accessSchema,
} from "@/features/admin/schemas";
import { requirePermission } from "@/lib/auth/authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { success: boolean; message?: string };
const branchesFrom = (formData: FormData) =>
  formData
    .getAll("branchIds")
    .filter((value): value is string => typeof value === "string");

export async function createBranch(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("branches.manage");
  const values = branchSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    openingHours: formData.get("openingHours"),
  });
  if (!values.success)
    return { success: false, message: values.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.from("branches").insert({
    code: values.data.code,
    name: values.data.name,
    address: values.data.address,
    phone: values.data.phone,
    email: values.data.email || null,
    opening_hours: values.data.openingHours || null,
  });
  if (error)
    return {
      success: false,
      message:
        "The branch could not be created. Check that its code is unique.",
    };
  revalidatePath("/app/admin/branches");
  return { success: true, message: "Branch created." };
}

export async function setBranchActive(formData: FormData) {
  await requirePermission("branches.manage");
  const id = formData.get("id");
  const active = formData.get("active") === "true";
  if (typeof id !== "string") return;
  const parsed = accessSchema.shape.userId.safeParse(id);
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("branches")
    .update({ is_active: active })
    .eq("id", parsed.data);
  revalidatePath("/app/admin/branches");
}

export async function updateBranch(formData: FormData) {
  await requirePermission("branches.manage");
  const id = accessSchema.shape.userId.safeParse(formData.get("id"));
  const values = branchSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    openingHours: formData.get("openingHours"),
  });
  if (!id.success || !values.success) return;
  const supabase = await createClient();
  await supabase
    .from("branches")
    .update({
      code: values.data.code,
      name: values.data.name,
      address: values.data.address,
      phone: values.data.phone,
      email: values.data.email || null,
      opening_hours: values.data.openingHours || null,
      is_public: formData.get("isPublic") === "on",
    })
    .eq("id", id.data);
  revalidatePath("/app/admin/branches");
}

export async function inviteEmployee(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("users.manage");
  const values = employeeSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    roleId: formData.get("roleId"),
    branchIds: branchesFrom(formData),
  });
  if (!values.success)
    return { success: false, message: values.error.issues[0]?.message };
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      success: false,
      message: "Employee invitation requires server administrator credentials.",
    };
  }
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    values.data.email,
    { data: { full_name: values.data.fullName, phone: values.data.phone } },
  );
  if (error || !data.user)
    return {
      success: false,
      message:
        "The invitation could not be sent. Verify email delivery configuration and whether the account already exists.",
    };
  const supabase = await createClient();
  const { error: configError } = await supabase.rpc(
    "configure_employee_access",
    {
      target_user_id: data.user.id,
      target_role_id: values.data.roleId,
      target_branch_ids: values.data.branchIds,
      target_active: true,
    },
  );
  if (configError)
    return {
      success: false,
      message:
        "The account was invited but remains inactive because access configuration failed.",
    };
  revalidatePath("/app/admin/users");
  return { success: true, message: "Employee invited and access configured." };
}

export async function configureEmployee(formData: FormData) {
  await requirePermission("users.manage");
  const values = accessSchema.safeParse({
    userId: formData.get("userId"),
    roleId: formData.get("roleId"),
    branchIds: branchesFrom(formData),
    isActive: formData.get("isActive") === "true",
  });
  if (!values.success) return;
  const supabase = await createClient();
  await supabase.rpc("configure_employee_access", {
    target_user_id: values.data.userId,
    target_role_id: values.data.roleId,
    target_branch_ids: values.data.branchIds,
    target_active: values.data.isActive,
  });
  revalidatePath("/app/admin/users");
}
