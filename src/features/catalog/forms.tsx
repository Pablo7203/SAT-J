"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProduct,
  createReference,
  uploadProductImage,
  type CatalogActionState,
} from "./actions";

const initial: CatalogActionState = { success: false };
const Select = ({
  name,
  label,
  children,
  required = true,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <Label>
    {label}
    <select
      name={name}
      required={required}
      className="mt-1 min-h-11 w-full rounded-lg border bg-surface px-3"
    >
      {children}
    </select>
  </Label>
);
const Field = ({
  name,
  label,
  required,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) => (
  <Label>
    {label}
    <Input
      className="mt-1 font-normal"
      name={name}
      required={required}
      type={type}
      placeholder={placeholder}
      step={type === "number" ? "0.01" : undefined}
      min={type === "number" ? "0" : undefined}
    />
  </Label>
);

export function ProductForm({
  categories,
  brands,
  units,
}: {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  units: { id: string; name: string; code: string }[];
}) {
  const [state, action, pending] = useActionState(createProduct, initial);
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <Field name="name" label="Product name" required />
      <Field
        name="variantName"
        label="Default variant name"
        required
        placeholder="Standard"
      />
      <Label className="sm:col-span-2">
        Description
        <textarea
          name="description"
          rows={4}
          className="mt-1 w-full rounded-lg border bg-surface p-3"
        />
      </Label>
      <Select name="categoryId" label="Category">
        {categories.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </Select>
      <Select name="brandId" label="Brand" required={false}>
        <option value="">No brand</option>
        {brands.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </Select>
      <Select name="unitId" label="Unit of measure">
        {units.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name} ({x.code})
          </option>
        ))}
      </Select>
      <Select name="status" label="Initial status">
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
      </Select>
      <Field name="sku" label="SKU" required />
      <Field name="barcode" label="Barcode (optional)" />
      <Field name="retailPrice" label="Retail price (GHS)" type="number" />
      <Field
        name="wholesalePrice"
        label="Wholesale price (GHS)"
        type="number"
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isPublic" /> Publicly visible
      </label>
      <div className="sm:col-span-2">
        {state.message ? (
          <p role="status" className="mb-3 text-sm text-destructive">
            {state.message}
          </p>
        ) : null}
        <Button disabled={pending}>
          {pending ? "Creating…" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

export function ReferenceForm({
  kind,
  categories = [],
}: {
  kind: "category" | "brand" | "unit" | "attribute";
  categories?: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createReference, initial);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="kind" value={kind} />
      <Field name="name" label="Name" required />
      {kind === "category" || kind === "brand" ? (
        <Field name="slug" label="Slug" required />
      ) : null}
      {kind === "category" ? (
        <Select name="parentId" label="Parent" required={false}>
          <option value="">Top level</option>
          {categories.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </Select>
      ) : null}
      {kind === "unit" || kind === "attribute" ? (
        <Field name="code" label="Code" required />
      ) : null}
      {kind === "unit" ? <Field name="symbol" label="Symbol" required /> : null}
      {kind === "attribute" ? (
        <Select name="dataType" label="Data type">
          <option>TEXT</option>
          <option>NUMBER</option>
          <option>BOOLEAN</option>
          <option>SELECT</option>
        </Select>
      ) : null}
      <div className="sm:col-span-2">
        {state.message ? (
          <p role="status" className="mb-2 text-sm">
            {state.message}
          </p>
        ) : null}
        <Button disabled={pending}>{pending ? "Saving…" : "Create"}</Button>
      </div>
    </form>
  );
}

export function ProductImageForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(uploadProductImage, initial);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="productId" value={productId} />
      <Label>
        Image
        <input
          className="mt-1 block w-full text-sm"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
        />
      </Label>
      <Field name="altText" label="Alternative text" />
      <label className="flex items-center gap-2">
        <input type="checkbox" name="isPrimary" /> Primary product image
      </label>
      <div className="sm:col-span-2">
        {state.message ? (
          <p role="status" className="mb-2 text-sm">
            {state.message}
          </p>
        ) : null}
        <Button disabled={pending}>
          {pending ? "Uploading…" : "Upload image"}
        </Button>
      </div>
    </form>
  );
}
