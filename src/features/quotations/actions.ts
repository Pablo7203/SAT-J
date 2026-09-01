"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
export type QuoteState = {
  success: boolean;
  message?: string;
  requestNumber?: string;
};
const schema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().or(z.literal("")),
  company: z.string().trim().max(160),
  productId: z.string().uuid().or(z.literal("")),
  variantId: z.string().uuid().or(z.literal("")),
  quantity: z.coerce.number().positive().optional().or(z.literal("")),
  branchId: z.string().uuid().or(z.literal("")),
  message: z.string().trim().max(2000),
  website: z.string().max(0),
});
export async function submitQuote(
  _: QuoteState,
  data: FormData,
): Promise<QuoteState> {
  const parsed = schema.safeParse(Object.fromEntries(data));
  if (!parsed.success)
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Check the quotation details.",
    };
  const v = parsed.data;
  const { data: number, error } = await (
    await createClient()
  ).rpc("submit_quotation", {
    visitor_name: v.name,
    visitor_phone: v.phone,
    visitor_email: v.email || null,
    visitor_company: v.company || null,
    target_product: v.productId || null,
    target_variant: v.variantId || null,
    requested_quantity: v.quantity || null,
    target_branch: v.branchId || null,
    visitor_message: v.message || null,
    request_source: v.productId ? "PRODUCT" : "GENERAL_QUOTE",
    honey: v.website,
  });
  if (error)
    return {
      success: false,
      message: error.message.includes("wait")
        ? "Please wait before sending another request."
        : "We could not submit your request. Check the details and try again.",
    };
  return {
    success: true,
    message:
      "SAT-J Ent has received your quotation request. Our team will contact you using the details provided.",
    requestNumber: number,
  };
}
