"use client";
import { useActionState } from "react";
import { submitQuote, type QuoteState } from "./actions";
export function QuoteForm({
  product,
  variants,
  branches,
}: {
  product?: { id: string; name: string };
  variants?: { id: string; name: string }[];
  branches: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(submitQuote, {
    success: false,
  } as QuoteState);
  if (state.success)
    return (
      <div
        className="rounded-3xl border border-green-200 bg-green-50 p-8"
        role="status"
      >
        <h2 className="text-2xl font-black">Thank you.</h2>
        <p className="mt-3 leading-7">{state.message}</p>
        <p className="mt-3 font-bold">Reference: {state.requestNumber}</p>
      </div>
    );
  const field = "mt-1 min-h-12 w-full rounded-xl border bg-white px-4";
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="productId" value={product?.id ?? ""} />
      <label className="hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {product ? (
        <div className="rounded-xl bg-secondary p-4 sm:col-span-2">
          <p className="text-sm text-muted">Product</p>
          <p className="font-bold">{product.name}</p>
        </div>
      ) : null}
      <label className="font-bold">
        Name *<input className={field} name="name" required />
      </label>
      <label className="font-bold">
        Phone *<input className={field} name="phone" type="tel" required />
      </label>
      <label className="font-bold">
        Email
        <input className={field} name="email" type="email" />
      </label>
      <label className="font-bold">
        Company
        <input className={field} name="company" />
      </label>
      {variants?.length ? (
        <label className="font-bold">
          Variant
          <select className={field} name="variantId">
            <option value="">Any suitable option</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="variantId" value="" />
      )}
      <label className="font-bold">
        Quantity
        <input
          className={field}
          name="quantity"
          type="number"
          min="0.001"
          step="0.001"
        />
      </label>
      <label className="font-bold">
        Preferred branch
        <select className={field} name="branchId">
          <option value="">No preference</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="font-bold sm:col-span-2">
        Project details
        <textarea
          className="mt-1 w-full rounded-xl border bg-white p-4"
          name="message"
          rows={5}
          maxLength={2000}
        />
      </label>
      {state.message ? (
        <p className="text-sm text-destructive sm:col-span-2" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        className="min-h-12 rounded-xl bg-primary px-6 font-bold text-white sm:col-span-2"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send quotation request"}
      </button>
      <p className="text-xs text-muted sm:col-span-2">
        By submitting, you ask SAT-J Ent to contact you about this enquiry.
      </p>
    </form>
  );
}
