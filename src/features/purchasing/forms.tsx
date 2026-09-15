"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPurchase,
  receivePurchase,
  recordPayment,
  saveSupplier,
  type PurchasingState,
} from "./actions";
const initial: PurchasingState = {};
const Feedback = ({ state }: { state: PurchasingState }) =>
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
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) => (
  <Label>
    {label}
    <textarea
      name={name}
      defaultValue={defaultValue ?? ""}
      className="mt-1 w-full rounded-lg border bg-surface p-3"
    />
  </Label>
);
export function SupplierForm({
  supplier,
}: {
  supplier?: Record<string, string | null>;
}) {
  const [state, action, pending] = useActionState(saveSupplier, initial);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {supplier?.id ? (
        <input type="hidden" name="id" value={supplier.id} />
      ) : null}
      <Label>
        Supplier name
        <Input name="name" required defaultValue={supplier?.name ?? ""} />
      </Label>
      <Label>
        Company name
        <Input name="company" defaultValue={supplier?.company_name ?? ""} />
      </Label>
      <Label>
        Contact person
        <Input name="contact" defaultValue={supplier?.contact_person ?? ""} />
      </Label>
      <Label>
        Phone
        <Input name="phone" type="tel" defaultValue={supplier?.phone ?? ""} />
      </Label>
      <Label>
        Email
        <Input name="email" type="email" defaultValue={supplier?.email ?? ""} />
      </Label>
      <Label>
        Address
        <Input name="address" defaultValue={supplier?.address ?? ""} />
      </Label>
      <div className="sm:col-span-2">
        <Area name="notes" label="Notes" defaultValue={supplier?.notes} />
      </div>
      <Feedback state={state} />
      <div className="sm:col-span-2">
        <Button disabled={pending}>
          {pending ? "Saving…" : "Save supplier"}
        </Button>
      </div>
    </form>
  );
}
type Option = { id: string; label: string };
export function PurchaseForm({
  suppliers,
  branches,
  variants,
}: {
  suppliers: Option[];
  branches: Option[];
  variants: Option[];
}) {
  const [state, action, pending] = useActionState(createPurchase, initial);
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Label>
          Supplier
          <select
            name="supplierId"
            required
            className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
          >
            {suppliers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          Receiving branch
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
          Purchase date
          <Input
            type="date"
            name="purchaseDate"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </Label>
        <Label>
          Expected delivery
          <Input type="date" name="expectedDate" />
        </Label>
        <Label>
          Supplier invoice/reference
          <Input name="invoice" />
        </Label>
        <Label>
          Purchase discount
          <Input
            type="number"
            min="0"
            step="0.01"
            name="discount"
            defaultValue="0"
          />
        </Label>
        <Label>
          Other costs
          <Input
            type="number"
            min="0"
            step="0.01"
            name="otherCosts"
            defaultValue="0"
          />
        </Label>
      </div>
      <fieldset className="space-y-2">
        <legend className="font-semibold">Purchase items</legend>
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="grid gap-2 sm:grid-cols-4" key={i}>
            <select
              aria-label={`Product variant ${i + 1}`}
              name="variantId"
              className="min-h-11 rounded-lg border bg-surface px-3"
            >
              <option value="">Choose variant</option>
              {variants.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
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
            <Input
              aria-label={`Unit cost ${i + 1}`}
              name="unitCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="Unit cost"
            />
            <Input
              aria-label={`Line discount ${i + 1}`}
              name="lineDiscount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Discount"
            />
          </div>
        ))}
      </fieldset>
      <Area name="notes" label="Notes" />
      <Feedback state={state} />
      <Button disabled={pending}>
        {pending ? "Saving…" : "Save draft purchase"}
      </Button>
    </form>
  );
}
export function ReceiptForm({
  purchaseId,
  items,
}: {
  purchaseId: string;
  items: { id: string; label: string; ordered: number; received: number }[];
}) {
  const [state, action, pending] = useActionState(receivePurchase, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="purchaseId" value={purchaseId} />
      <input type="hidden" name="operationId" value={crypto.randomUUID()} />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th>Item</th>
              <th>Ordered</th>
              <th>Previously received</th>
              <th>Remaining</th>
              <th>Receive now</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="py-3">
                  <input type="hidden" name="itemId" value={x.id} />
                  {x.label}
                </td>
                <td>{x.ordered}</td>
                <td>{x.received}</td>
                <td>{x.ordered - x.received}</td>
                <td>
                  <Input
                    aria-label={`Receive ${x.label}`}
                    name="quantity"
                    type="number"
                    min="0"
                    max={x.ordered - x.received}
                    step="0.001"
                    defaultValue="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Label>
        Supplier delivery reference
        <Input name="deliveryReference" />
      </Label>
      <Area name="notes" label="Receipt notes" />
      <p className="text-sm text-muted-foreground">
        Confirming immediately updates inventory. This posted receipt cannot be
        edited.
      </p>
      <Feedback state={state} />
      <Button disabled={pending}>
        {pending ? "Receiving…" : "Confirm goods receipt"}
      </Button>
    </form>
  );
}
export function PaymentForm({
  purchase,
}: {
  purchase: {
    purchaseId: string;
    supplierId: string;
    branchId: string;
    balance: string;
  };
}) {
  const [state, action, pending] = useActionState(recordPayment, initial);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="purchaseId" value={purchase.purchaseId} />
      <input type="hidden" name="supplierId" value={purchase.supplierId} />
      <input type="hidden" name="branchId" value={purchase.branchId} />
      <input type="hidden" name="operationId" value={crypto.randomUUID()} />
      <p className="sm:col-span-2">
        Outstanding balance:{" "}
        <strong>GHS {Number(purchase.balance).toFixed(2)}</strong>
      </p>
      <Label>
        Amount
        <Input
          name="amount"
          type="number"
          required
          min="0.01"
          max={purchase.balance}
          step="0.01"
        />
      </Label>
      <Label>
        Method
        <select
          name="method"
          className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
        >
          <option>CASH</option>
          <option>MOBILE_MONEY</option>
          <option>BANK_TRANSFER</option>
          <option>CARD_POS</option>
          <option>OTHER</option>
        </select>
      </Label>
      <Label>
        Payment date
        <Input
          name="paymentDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </Label>
      <Label>
        Reference
        <Input name="reference" />
      </Label>
      <div className="sm:col-span-2">
        <Area name="notes" label="Notes" />
      </div>
      <Feedback state={state} />
      <div className="sm:col-span-2">
        <Button disabled={pending}>
          {pending ? "Recording…" : "Confirm payment"}
        </Button>
      </div>
    </form>
  );
}
