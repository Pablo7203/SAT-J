"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cancelSale,
  completeSale,
  createSale,
  recordCustomerPayment,
  saveCustomer,
  type SalesState,
} from "./actions";
const initial: SalesState = {};
const Feedback = ({ state }: { state: SalesState }) =>
  state.error || state.success ? (
    <p
      role="status"
      className={state.error ? "text-sm text-destructive" : "text-sm"}
    >
      {state.error || state.success}
    </p>
  ) : null;
const Area = ({
  name,
  label,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
}) => (
  <Label>
    {label}
    <textarea
      name={name}
      required={required}
      defaultValue={defaultValue ?? ""}
      className="mt-1 w-full rounded-lg border bg-surface p-3"
    />
  </Label>
);
export function CustomerForm({
  customer,
}: {
  customer?: Record<string, string | null>;
}) {
  const [state, action, pending] = useActionState(saveCustomer, initial);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {customer?.id ? (
        <input type="hidden" name="id" value={customer.id} />
      ) : null}
      <Label>
        Customer name
        <Input name="name" required defaultValue={customer?.name ?? ""} />
      </Label>
      <Label>
        Customer type
        <select
          name="type"
          defaultValue={customer?.customer_type ?? "INDIVIDUAL"}
          className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
        >
          {[
            "INDIVIDUAL",
            "CONTRACTOR",
            "CONSTRUCTION_COMPANY",
            "RETAILER",
            "ARCHITECT_DESIGNER",
            "OTHER",
          ].map((x) => (
            <option key={x}>{x.replaceAll("_", " ")}</option>
          ))}
        </select>
      </Label>
      <Label>
        Company
        <Input name="company" defaultValue={customer?.company_name ?? ""} />
      </Label>
      <Label>
        Phone
        <Input name="phone" type="tel" defaultValue={customer?.phone ?? ""} />
      </Label>
      <Label>
        Email
        <Input name="email" type="email" defaultValue={customer?.email ?? ""} />
      </Label>
      <Label>
        Address
        <Input name="address" defaultValue={customer?.address ?? ""} />
      </Label>
      <div className="sm:col-span-2">
        <Area name="notes" label="Notes" defaultValue={customer?.notes} />
      </div>
      <Feedback state={state} />
      <div className="sm:col-span-2">
        <Button disabled={pending}>
          {pending ? "Saving…" : "Save customer"}
        </Button>
      </div>
    </form>
  );
}
type Option = { id: string; label: string };
type Variant = Option & {
  stock: string;
  unit: string;
  retail?: string;
  wholesale?: string;
};
export function SaleForm({
  customers,
  branches,
  variants,
  canOverride,
  canDiscount,
}: {
  customers: Option[];
  branches: Option[];
  variants: Variant[];
  canOverride: boolean;
  canDiscount: boolean;
}) {
  const [state, action, pending] = useActionState(createSale, initial);
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Label>
          Branch
          <select
            name="branchId"
            required
            className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
          >
            {branches.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          Customer
          <select
            name="customerId"
            required
            className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
          >
            {customers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          Credit due date
          <Input name="dueDate" type="date" />
        </Label>
        {canDiscount ? (
          <>
            <Label>
              Sale discount
              <Input
                name="saleDiscount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
              />
            </Label>
            <Label>
              Sale discount reason
              <Input name="saleDiscountReason" />
            </Label>
          </>
        ) : (
          <input type="hidden" name="saleDiscount" value="0" />
        )}
      </div>
      <fieldset className="space-y-3">
        <legend className="font-semibold">Sale items</legend>
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="rounded-lg border p-3" key={i}>
            <div className="grid gap-2 md:grid-cols-4">
              <select
                aria-label={`Product variant ${i + 1}`}
                name="variantId"
                className="min-h-11 rounded-lg border bg-surface px-3"
              >
                <option value="">Search/choose variant</option>
                {variants.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label} · available {x.stock} {x.unit} · retail{" "}
                    {x.retail ?? "not set"}
                  </option>
                ))}
              </select>
              <Input
                aria-label={`Quantity ${i + 1}`}
                name="quantity"
                type="number"
                min="0.001"
                step="0.001"
                placeholder="Quantity"
              />
              <select
                aria-label={`Price type ${i + 1}`}
                name="priceType"
                className="min-h-11 rounded-lg border bg-surface px-3"
              >
                <option>RETAIL</option>
                <option>WHOLESALE</option>
              </select>
              {canOverride ? (
                <Input
                  aria-label={`Override price ${i + 1}`}
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Override price (optional)"
                />
              ) : (
                <input type="hidden" name="unitPrice" value="" />
              )}
            </div>
            {canOverride ? (
              <Input
                aria-label={`Override reason ${i + 1}`}
                className="mt-2"
                name="overrideReason"
                placeholder="Price override reason"
              />
            ) : (
              <input type="hidden" name="overrideReason" value="" />
            )}
            {canDiscount ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Input
                  aria-label={`Line discount ${i + 1}`}
                  name="lineDiscount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
                <Input
                  aria-label={`Line discount reason ${i + 1}`}
                  name="lineDiscountReason"
                  placeholder="Line discount reason"
                />
              </div>
            ) : (
              <>
                <input type="hidden" name="lineDiscount" value="0" />
                <input type="hidden" name="lineDiscountReason" value="" />
              </>
            )}
          </div>
        ))}
      </fieldset>
      <Area name="notes" label="Sale notes" />
      <p className="text-sm text-muted-foreground">
        Saving a draft does not reserve or reduce stock. Current stock is
        advisory and is checked again under lock at completion.
      </p>
      <Feedback state={state} />
      <Button disabled={pending}>
        {pending ? "Saving…" : "Save draft sale"}
      </Button>
    </form>
  );
}
const Method = () => (
  <select
    name="method"
    className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
  >
    <option value="">No payment</option>
    <option>CASH</option>
    <option>MOBILE_MONEY</option>
    <option>BANK_TRANSFER</option>
    <option>CARD_POS</option>
    <option>OTHER</option>
  </select>
);
export function CompleteSaleForm({
  saleId,
  total,
  isWalkIn,
}: {
  saleId: string;
  total: string;
  isWalkIn: boolean;
}) {
  const [state, action, pending] = useActionState(completeSale, initial);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="saleId" value={saleId} />
      <input type="hidden" name="operationId" value={crypto.randomUUID()} />
      <p className="sm:col-span-2">
        Total: <strong>GHS {Number(total).toFixed(2)}</strong>
        {isWalkIn
          ? " · Walk-In sales must be paid fully."
          : " · Enter zero for a credit sale."}
      </p>
      <Label>
        Payment now
        <Input
          name="amount"
          type="number"
          min="0"
          max={total}
          step="0.01"
          required
          defaultValue={isWalkIn ? total : "0"}
        />
      </Label>
      <Label>
        Payment method
        <Method />
      </Label>
      <Label>
        Payment reference
        <Input name="reference" />
      </Label>
      <Label>
        Payment notes
        <Input name="notes" />
      </Label>
      <p className="text-sm text-muted-foreground sm:col-span-2">
        Confirming deducts inventory immediately and generates the final
        receipt.
      </p>
      <Feedback state={state} />
      <div className="sm:col-span-2">
        <Button disabled={pending}>
          {pending ? "Completing…" : "Complete sale"}
        </Button>
      </div>
    </form>
  );
}
export function CustomerPaymentForm({
  sale,
}: {
  sale: {
    saleId: string;
    customerId: string;
    branchId: string;
    balance: string;
  };
}) {
  const [state, action, pending] = useActionState(
    recordCustomerPayment,
    initial,
  );
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="saleId" value={sale.saleId} />
      <input type="hidden" name="customerId" value={sale.customerId} />
      <input type="hidden" name="branchId" value={sale.branchId} />
      <input type="hidden" name="operationId" value={crypto.randomUUID()} />
      <p className="sm:col-span-2">
        Outstanding: <strong>GHS {Number(sale.balance).toFixed(2)}</strong>
      </p>
      <Label>
        Amount
        <Input
          name="amount"
          required
          type="number"
          min="0.01"
          max={sale.balance}
          step="0.01"
        />
      </Label>
      <Label>
        Method
        <Method />
      </Label>
      <Label>
        Reference
        <Input name="reference" />
      </Label>
      <Label>
        Notes
        <Input name="notes" />
      </Label>
      <Feedback state={state} />
      <div className="sm:col-span-2">
        <Button disabled={pending}>
          {pending ? "Recording…" : "Record payment"}
        </Button>
      </div>
    </form>
  );
}
export function CancelSaleForm({ saleId }: { saleId: string }) {
  const [state, action, pending] = useActionState(cancelSale, initial);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="saleId" value={saleId} />
      <Area name="reason" label="Cancellation reason" required />
      <Feedback state={state} />
      <Button variant="danger" disabled={pending}>
        {pending ? "Cancelling…" : "Cancel erroneous sale"}
      </Button>
    </form>
  );
}
