"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

export type PurchasingState = { error?: string; success?: string };
const uuid = z.string().uuid();
const message = (raw: string) => {
  if (raw.includes("remaining ordered"))
    return "You cannot receive more than the remaining ordered quantity.";
  if (raw.includes("outstanding balance"))
    return "The payment amount exceeds the outstanding balance.";
  if (raw.includes("permission") || raw.includes("branch"))
    return "You do not have access to perform this action.";
  return raw.includes("duplicate key")
    ? "This operation was already recorded."
    : "The operation could not be completed. Check the values and try again.";
};
const text = (data: FormData, key: string) => String(data.get(key) ?? "");

export async function saveSupplier(
  _state: PurchasingState,
  data: FormData,
): Promise<PurchasingState> {
  const id = text(data, "id");
  await requirePermission(id ? "suppliers.update" : "suppliers.create");
  const s = await createClient();
  const args = {
    supplier_name: text(data, "name"),
    company: text(data, "company"),
    contact: text(data, "contact"),
    phone_number: text(data, "phone"),
    email_address: text(data, "email"),
    postal_address: text(data, "address"),
    supplier_notes: text(data, "notes"),
  };
  const result = id
    ? await s.rpc("update_supplier", { target_supplier: id, ...args })
    : await s.rpc("create_supplier", args);
  if (result.error) return { error: message(result.error.message) };
  redirect(`/app/suppliers/${id || result.data}`);
}
export async function toggleSupplier(data: FormData) {
  await requirePermission("suppliers.archive");
  const id = uuid.safeParse(data.get("id"));
  if (!id.success) return;
  const s = await createClient();
  await s.rpc("set_supplier_active", {
    target_supplier: id.data,
    new_active: text(data, "active") === "true",
  });
  revalidatePath(`/app/suppliers/${id.data}`);
}
export async function createPurchase(
  _state: PurchasingState,
  data: FormData,
): Promise<PurchasingState> {
  await requirePermission("purchases.create");
  const supplier = uuid.safeParse(data.get("supplierId")),
    branch = uuid.safeParse(data.get("branchId"));
  const variants = data.getAll("variantId").map(String),
    quantities = data.getAll("quantity").map(String),
    costs = data.getAll("unitCost").map(String),
    discounts = data.getAll("lineDiscount").map(String);
  const items = variants
    .map((variant_id, i) => ({
      variant_id,
      quantity: quantities[i],
      unit_cost: costs[i],
      discount_amount: discounts[i] || "0",
      notes: "",
    }))
    .filter(
      (x) =>
        uuid.safeParse(x.variant_id).success &&
        Number(x.quantity) > 0 &&
        Number(x.unit_cost) >= 0,
    );
  if (!supplier.success || !branch.success || !items.length)
    return { error: "Choose a supplier, branch, and at least one item." };
  const s = await createClient();
  const { data: id, error } = await s.rpc("create_purchase", {
    target_supplier: supplier.data,
    target_branch: branch.data,
    purchase_on: text(data, "purchaseDate") || null,
    expected_on: text(data, "expectedDate") || null,
    supplier_invoice: text(data, "invoice"),
    purchase_notes: text(data, "notes"),
    purchase_discount: Number(text(data, "discount") || 0),
    purchase_other_costs: Number(text(data, "otherCosts") || 0),
    items,
  });
  if (error || !id) return { error: message(error?.message ?? "") };
  redirect(`/app/purchases/${id}`);
}
export async function orderPurchase(data: FormData) {
  await requirePermission("purchases.update");
  const id = uuid.safeParse(data.get("id"));
  if (!id.success) return;
  const s = await createClient();
  await s.rpc("order_purchase", { target_purchase: id.data });
  revalidatePath(`/app/purchases/${id.data}`);
}
export async function cancelPurchase(data: FormData) {
  await requirePermission("purchases.cancel");
  const id = uuid.safeParse(data.get("id"));
  if (!id.success) return;
  const s = await createClient();
  await s.rpc("cancel_purchase", { target_purchase: id.data });
  revalidatePath(`/app/purchases/${id.data}`);
}
export async function receivePurchase(
  _state: PurchasingState,
  data: FormData,
): Promise<PurchasingState> {
  await requirePermission("purchases.receive");
  const purchase = uuid.safeParse(data.get("purchaseId"));
  if (!purchase.success) return { error: "Invalid purchase." };
  const ids = data.getAll("itemId").map(String),
    quantities = data.getAll("quantity").map(String);
  const items = ids
    .map((purchase_item_id, i) => ({
      purchase_item_id,
      quantity: quantities[i],
    }))
    .filter((x) => Number(x.quantity) > 0);
  if (!items.length)
    return { error: "Enter a quantity for at least one item." };
  const s = await createClient();
  const { error } = await s.rpc("receive_purchase", {
    target_purchase: purchase.data,
    operation_id: text(data, "operationId") || randomUUID(),
    delivery_reference: text(data, "deliveryReference"),
    receipt_notes: text(data, "notes"),
    items,
  });
  if (error) return { error: message(error.message) };
  revalidatePath("/app/inventory", "layout");
  return { success: "Goods received and inventory updated." };
}
export async function recordPayment(
  _state: PurchasingState,
  data: FormData,
): Promise<PurchasingState> {
  await requirePermission("supplier_payments.create");
  const supplier = uuid.safeParse(data.get("supplierId")),
    purchase = uuid.safeParse(data.get("purchaseId")),
    branch = uuid.safeParse(data.get("branchId"));
  if (!supplier.success || !purchase.success || !branch.success)
    return { error: "Invalid payment context." };
  const s = await createClient();
  const { error } = await s.rpc("record_supplier_payment", {
    target_supplier: supplier.data,
    target_purchase: purchase.data,
    target_branch: branch.data,
    operation_id: text(data, "operationId") || randomUUID(),
    payment_amount: Number(text(data, "amount")),
    method: text(data, "method"),
    reference: text(data, "reference"),
    payment_on: text(data, "paymentDate") || null,
    payment_notes: text(data, "notes"),
  });
  if (error) return { error: message(error.message) };
  revalidatePath(`/app/purchases/${purchase.data}`);
  return { success: "Supplier payment recorded." };
}
