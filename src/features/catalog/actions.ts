"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
import { idSchema, productSchema, referenceSchema } from "./schemas";

export type CatalogActionState = { success: boolean; message?: string };
const fail = (message: string): CatalogActionState => ({
  success: false,
  message,
});
const messageFor = (error: { message: string } | null) =>
  error?.message ?? "The change could not be saved.";

export async function createProduct(
  _state: CatalogActionState,
  data: FormData,
): Promise<CatalogActionState> {
  await requirePermission("products.create");
  const parsed = productSchema.safeParse({
    name: data.get("name"),
    description: data.get("description") ?? "",
    categoryId: data.get("categoryId"),
    brandId: data.get("brandId") ?? "",
    unitId: data.get("unitId"),
    status: data.get("status"),
    isPublic: data.get("isPublic") === "on",
    variantName: data.get("variantName"),
    sku: data.get("sku"),
    barcode: data.get("barcode") ?? "",
    retailPrice: data.get("retailPrice") ?? "",
    wholesalePrice: data.get("wholesalePrice") ?? "",
  });
  if (!parsed.success)
    return fail(
      parsed.error.issues[0]?.message ?? "Check the product details.",
    );
  const v = parsed.data;
  const supabase = await createClient();
  const { data: productId, error } = await supabase.rpc(
    "create_product_with_default_variant",
    {
      product_name: v.name,
      product_description: v.description,
      product_category_id: v.categoryId,
      product_brand_id: v.brandId,
      product_unit_id: v.unitId,
      product_is_public: v.isPublic,
      product_status: v.status,
      variant_name: v.variantName,
      variant_sku: v.sku,
      variant_barcode: v.barcode,
      retail_amount: v.retailPrice ?? null,
      wholesale_amount: v.wholesalePrice ?? null,
    },
  );
  if (error || !productId) return fail(messageFor(error));
  revalidatePath("/app/products");
  redirect(`/app/products/${productId}`);
}

export async function updateProduct(data: FormData) {
  await requirePermission("products.update");
  const id = idSchema.safeParse(data.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({
      name: String(data.get("name") ?? "").trim(),
      description: String(data.get("description") ?? "").trim() || null,
      category_id: data.get("categoryId"),
      brand_id: data.get("brandId") || null,
      unit_of_measure_id: data.get("unitId"),
      is_public: data.get("isPublic") === "on",
      show_price_online: data.get("showPriceOnline") === "on",
      is_featured: data.get("isFeatured") === "on",
    })
    .eq("id", id.data);
  revalidatePath(`/app/products/${id.data}`);
  revalidatePath("/app/products");
}

export async function setProductStatus(data: FormData) {
  const status = data.get("status");
  await requirePermission(
    status === "ARCHIVED" ? "products.archive" : "products.update",
  );
  const id = idSchema.safeParse(data.get("id"));
  if (!id.success || !["DRAFT", "ACTIVE", "ARCHIVED"].includes(String(status)))
    return;
  const supabase = await createClient();
  await supabase.from("products").update({ status }).eq("id", id.data);
  revalidatePath(`/app/products/${id.data}`);
  revalidatePath("/app/products");
}

export async function changePrice(data: FormData) {
  await requirePermission("product_prices.manage");
  const variantId = idSchema.safeParse(data.get("variantId"));
  const amount = Number(data.get("amount"));
  const priceType = String(data.get("priceType"));
  if (
    !variantId.success ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !["RETAIL", "WHOLESALE"].includes(priceType)
  )
    return;
  const supabase = await createClient();
  await supabase.rpc("change_product_price", {
    target_variant_id: variantId.data,
    target_branch_id: data.get("branchId") || null,
    target_price_type: priceType,
    new_amount: amount,
  });
  revalidatePath("/app/products");
  revalidatePath("/app/catalog/pricing");
}

export async function createReference(
  _state: CatalogActionState,
  data: FormData,
): Promise<CatalogActionState> {
  const parsed = referenceSchema.safeParse({
    kind: data.get("kind"),
    name: data.get("name"),
    code: data.get("code") ?? "",
    slug: data.get("slug") ?? "",
    parentId: data.get("parentId") ?? "",
    symbol: data.get("symbol") ?? "",
    dataType: data.get("dataType") ?? "TEXT",
  });
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Check the details.");
  const v = parsed.data;
  const supabase = await createClient();
  let error;
  if (v.kind === "category") {
    await requirePermission("categories.manage");
    ({ error } = await supabase
      .from("categories")
      .insert({ name: v.name, slug: v.slug, parent_id: v.parentId }));
  } else if (v.kind === "brand") {
    await requirePermission("brands.manage");
    ({ error } = await supabase
      .from("brands")
      .insert({ name: v.name, slug: v.slug }));
  } else if (v.kind === "unit") {
    await requirePermission("units.manage");
    ({ error } = await supabase
      .from("units_of_measure")
      .insert({ name: v.name, code: v.code.toUpperCase(), symbol: v.symbol }));
  } else {
    await requirePermission("product_attributes.manage");
    ({ error } = await supabase.from("attributes").insert({
      name: v.name,
      code: v.code.toUpperCase(),
      data_type: v.dataType,
    }));
  }
  if (error) return fail(messageFor(error));
  revalidatePath("/app/catalog", "layout");
  return { success: true, message: `${v.name} created.` };
}

export async function toggleReference(data: FormData) {
  const table = String(data.get("table"));
  const id = idSchema.safeParse(data.get("id"));
  if (!id.success) return;
  const allowed = {
    categories: "categories.manage",
    brands: "brands.manage",
    units_of_measure: "units.manage",
    attributes: "product_attributes.manage",
  } as const;
  if (!(table in allowed)) return;
  await requirePermission(allowed[table as keyof typeof allowed]);
  const supabase = await createClient();
  await supabase
    .from(table)
    .update({ is_active: data.get("active") === "true" })
    .eq("id", id.data);
  revalidatePath("/app/catalog", "layout");
}

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
export async function uploadProductImage(
  _state: CatalogActionState,
  data: FormData,
): Promise<CatalogActionState> {
  await requirePermission("product_images.manage");
  const productId = idSchema.safeParse(data.get("productId"));
  const file = data.get("image");
  if (!productId.success || !(file instanceof File))
    return fail("Choose an image.");
  const extension = imageTypes.get(file.type);
  if (!extension || file.size > 5 * 1024 * 1024)
    return fail("Use a JPG, PNG, WebP, or AVIF image up to 5 MB.");
  const s = await createClient();
  const path = `products/${productId.data}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await s.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return fail(messageFor(uploadError));
  const { error } = await s.from("product_images").insert({
    product_id: productId.data,
    storage_path: path,
    alt_text: String(data.get("altText") ?? "").trim() || null,
    is_primary: data.get("isPrimary") === "on",
  });
  if (error) {
    await s.storage.from("product-images").remove([path]);
    return fail(messageFor(error));
  }
  revalidatePath(`/app/products/${productId.data}`);
  return { success: true, message: "Image uploaded." };
}
export async function deleteProductImage(data: FormData) {
  await requirePermission("product_images.manage");
  const productId = idSchema.safeParse(data.get("productId"));
  const imageId = idSchema.safeParse(data.get("imageId"));
  if (!productId.success || !imageId.success) return;
  const s = await createClient();
  const { data: image } = await s
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId.data)
    .eq("product_id", productId.data)
    .single();
  if (!image?.storage_path.startsWith(`products/${productId.data}/`)) return;
  const { error } = await s.storage
    .from("product-images")
    .remove([image.storage_path]);
  if (error) return;
  await s
    .from("product_images")
    .delete()
    .eq("id", imageId.data)
    .eq("product_id", productId.data);
  revalidatePath(`/app/products/${productId.data}`);
}

export async function addVariant(data: FormData) {
  await requirePermission("products.update");
  const productId = idSchema.safeParse(data.get("productId"));
  if (!productId.success) return;
  const name = String(data.get("name") ?? "").trim();
  const sku = String(data.get("sku") ?? "").trim();
  const barcode = String(data.get("barcode") ?? "").trim();
  if (!name || !sku) return;
  const s = await createClient();
  const { data: product } = await s
    .from("products")
    .select("status")
    .eq("id", productId.data)
    .single();
  if (product?.status !== "DRAFT") return;
  await s.from("product_variants").insert({
    product_id: productId.data,
    name,
    sku,
    barcode: barcode || null,
    is_default: false,
  });
  revalidatePath(`/app/products/${productId.data}`);
}

export async function createAttributeValue(data: FormData) {
  await requirePermission("product_attributes.manage");
  const attributeId = idSchema.safeParse(data.get("attributeId"));
  const value = String(data.get("value") ?? "").trim();
  if (!attributeId.success || !value) return;
  const s = await createClient();
  await s
    .from("attribute_values")
    .insert({ attribute_id: attributeId.data, value });
  revalidatePath("/app/catalog/attributes");
}
export async function mapCategoryAttribute(data: FormData) {
  await requirePermission("product_attributes.manage");
  const attributeId = idSchema.safeParse(data.get("attributeId"));
  const categoryId = idSchema.safeParse(data.get("categoryId"));
  if (!attributeId.success || !categoryId.success) return;
  const s = await createClient();
  await s.from("category_attributes").upsert({
    attribute_id: attributeId.data,
    category_id: categoryId.data,
    is_required: data.get("isRequired") === "on",
  });
  revalidatePath("/app/catalog/attributes");
}

export async function setVariantAttribute(data: FormData) {
  await requirePermission("products.update");
  const variantId = idSchema.safeParse(data.get("variantId"));
  const attributeId = idSchema.safeParse(data.get("attributeId"));
  const productId = idSchema.safeParse(data.get("productId"));
  if (!variantId.success || !attributeId.success || !productId.success) return;
  const type = String(data.get("dataType"));
  const raw = String(data.get("value") ?? "").trim();
  if (!raw) return;
  const row: {
    variant_id: string;
    attribute_id: string;
    attribute_value_id?: string;
    text_value?: string;
    number_value?: number;
    boolean_value?: boolean;
  } = { variant_id: variantId.data, attribute_id: attributeId.data };
  if (type === "SELECT") {
    const value = idSchema.safeParse(raw);
    if (!value.success) return;
    row.attribute_value_id = value.data;
  } else if (type === "NUMBER") {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    row.number_value = value;
  } else if (type === "BOOLEAN") row.boolean_value = raw === "true";
  else row.text_value = raw;
  const s = await createClient();
  await s
    .from("variant_attribute_values")
    .upsert(row, { onConflict: "variant_id,attribute_id" });
  revalidatePath(`/app/products/${productId.data}`);
}
