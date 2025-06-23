// src/routes/_app/residents/$residentId.tsx

import { SheetForm } from "@/components/sheet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import type { Resident, Sticker } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import type { PurchaseType } from "@/types";
import {
  type Purchase,
  type PurchaseFormValues,
  PURCHASE_TYPES,
  purchaseFormSchema,
} from "@/types";

// --- TanStack Router Route Definition ---
export const Route = createFileRoute("/_app/residents/$residentId")({
  component: ResidentDetailPage,
});

// --- Main Component ---
function ResidentDetailPage() {
  const { residentId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Sticker[]>([]);

  // --- Fetch Resident Details ---
  const {
    data: resident,
    isLoading: isResidentLoading,
    isError: isResidentError,
    error: residentError,
  } = useQuery<Resident, Error>({
    queryKey: ["resident", residentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("residents")
        .select("*")
        .eq("id", residentId)
        .single();
      if (error) throw error;
      return data as Resident;
    },
  });

  // --- Fetch Purchased Stickers for this Resident ---
  const {
    data: purchasedStickers,
    isLoading: isPurchasesLoading,
    isError: isPurchasesError,
    error: purchasesError,
  } = useQuery<(Purchase & { product?: Sticker })[], Error>({
    queryKey: ["residentPurchases", residentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(
          `
          *,
          product:products(*)
        `
        )
        .eq("resident_id", residentId)
        .order("purchase_date", { ascending: false });
      if (error) throw error;
      return data as (Purchase & { product?: Sticker })[];
    },
  });

  // --- Fetch Available Products (Stickers) for Purchase Form ---
  const { data: productsData, isLoading: isProductsLoading } = useQuery<
    Sticker[],
    Error
  >({
    queryKey: ["availableProducts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data as Sticker[];
    },
  });

  React.useEffect(() => {
    if (productsData) {
      setAvailableProducts(productsData);
    }
  }, [productsData]);

  // --- Purchase Sticker Mutation ---
  const purchaseStickerMutation = useMutation<
    Purchase,
    Error,
    PurchaseFormValues
  >({
    mutationFn: async (values) => {
      // FIX: Apply penalty doubling ONLY HERE, right before sending to DB
      const finalAmount = values.penalty
        ? values.amount_paid * 2
        : values.amount_paid;

      const { data, error } = await supabase
        .from("purchases")
        .insert([
          {
            resident_id: residentId,
            product_id: values.product_id,
            amount_paid: finalAmount, // Use finalAmount after penalty
            driver_name: values.driver_name,
            driver_license: values.driver_license || null,
            company: values.company || null,
            contact_number: values.contact_number || null,
            sticker_number: values.sticker_number,
            plate_number: values.plate_number,
            af_number: values.af_number,
            penalty: values.penalty,
            type: values.type,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data as Purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentsWithPurchases"] });
      queryClient.invalidateQueries({
        queryKey: ["residentPurchases", residentId],
      });
      setIsPurchaseFormOpen(false);
    },
    onError: (err) => {
      console.error("Error purchasing sticker:", err);
    },
  });

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      product_id: "",
      amount_paid: 0.01,
      driver_name: "",
      driver_license: null,
      company: null,
      contact_number: null,
      sticker_number: "",
      plate_number: "",
      af_number: "",
      penalty: false,
      type: "New Application",
    },
  });

  // --- Penalty Logic (watches 'penalty' and updates 'amount_paid' VISUALLY) ---
  // This logic is for UI feedback only, the actual doubling for DB happens in mutationFn
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "penalty" || name === "product_id") {
        const selectedProduct = availableProducts.find(
          (p) => p.id === form.getValues("product_id")
        );
        if (selectedProduct) {
          const baseAmount = selectedProduct.amount;
          let newAmount = baseAmount;

          if (form.getValues("penalty")) {
            // Check the latest penalty value from form state
            newAmount = baseAmount * 2;
          }
          form.setValue("amount_paid", newAmount, { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, availableProducts]); // Depend on form and availableProducts

  // Reset form when purchase form opens
  React.useEffect(() => {
    if (isPurchaseFormOpen) {
      form.reset({
        product_id: "",
        amount_paid: 0.01,
        driver_name: "",
        driver_license: null,
        company: null,
        contact_number: null,
        sticker_number: "",
        plate_number: "",
        af_number: "",
        penalty: false,
        type: "New Application",
      });
      form.clearErrors();
    }
  }, [isPurchaseFormOpen, form.reset, form.clearErrors]);

  const onSubmitPurchase = async (values: PurchaseFormValues) => {
    purchaseStickerMutation.mutate(values);
  };

  if (isResidentLoading || isPurchasesLoading || isProductsLoading)
    return <div className="p-4 text-center">Loading resident details...</div>;
  if (isResidentError)
    return (
      <div className="p-4 text-center text-red-500">
        Error loading resident: {residentError?.message}
      </div>
    );
  if (isPurchasesError)
    return (
      <div className="p-4 text-center text-red-500">
        Error loading purchases: {purchasesError?.message}
      </div>
    );

  if (!resident)
    return (
      <div className="p-4 text-center text-muted-foreground">
        Resident not found.
      </div>
    );

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
      {/* Resident Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/residents" as string })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold uppercase">{resident.name}</h2>
        </div>
        <Button size="sm" onClick={() => setIsPurchaseFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Purchase Sticker
        </Button>
      </div>

      {/* Resident Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 border rounded-md">
          <h3 className="font-semibold mb-2">Details</h3>
          <p>
            <strong>Phase:</strong> {resident.phase}
          </p>
          <p>
            <strong>Block:</strong> {resident.block}
          </p>
          <p>
            <strong>Lot:</strong> {resident.lot}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Registered: {new Date(resident.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Purchased Stickers List */}
      <h3 className="text-xl font-bold mb-4">Purchased Stickers</h3>
      <div className="rounded-md border mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Sticker No.</TableHead>
              <TableHead>Plate No.</TableHead>
              <TableHead>AF No.</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Penalty</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchasedStickers && purchasedStickers.length > 0 ? (
              purchasedStickers.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.product?.name || "N/A"}</TableCell>
                  <TableCell>{purchase.type}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          purchase.product?.color?.toLowerCase() || "gray",
                        color: "white",
                      }}
                    >
                      {purchase.product?.color || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>{purchase.sticker_number}</TableCell>
                  <TableCell className="uppercase">
                    {purchase.plate_number}
                  </TableCell>
                  <TableCell>{purchase.af_number}</TableCell>
                  <TableCell className="uppercase">
                    {purchase.driver_name}
                  </TableCell>
                  <TableCell>{purchase.driver_license || "N/A"}</TableCell>
                  <TableCell className="uppercase">
                    {purchase.company || "N/A"}
                  </TableCell>
                  <TableCell>{purchase.contact_number || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${purchase.penalty ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                    >
                      {purchase.penalty ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{purchase.amount_paid.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center text-muted-foreground"
                >
                  No stickers purchased yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Purchase Sticker Form Sheet */}
      {isPurchaseFormOpen && (
        <SheetForm
          isOpen={isPurchaseFormOpen}
          onClose={() => {
            setIsPurchaseFormOpen(false);
            form.reset();
            form.clearErrors();
          }}
          title="Purchase New Sticker"
          description="Select a sticker and enter the amount paid, along with driver details."
          footerContent={
            <Button
              type="submit"
              disabled={purchaseStickerMutation.isPending}
              onClick={form.handleSubmit(onSubmitPurchase)}
            >
              {purchaseStickerMutation.isPending
                ? "Purchasing..."
                : "Confirm Purchase"}
            </Button>
          }
        >
          <form
            onSubmit={form.handleSubmit(onSubmitPurchase)}
            className="grid gap-4 py-4"
          >
            {/* Purchase Type Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Purchase Type
              </Label>
              <Select
                onValueChange={(val) =>
                  form.setValue("type", val as PurchaseType)
                }
                value={form.watch("type")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select purchase type" />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            {/* Sticker Type Selection */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product_id" className="text-right">
                Sticker Type
              </Label>
              <Select
                onValueChange={(val) => {
                  form.setValue("product_id", val);
                  const selectedProduct = availableProducts.find(
                    (p) => p.id === val
                  );
                  if (selectedProduct) {
                    // Update base amount, which will be doubled if penalty is active
                    form.setValue("amount_paid", selectedProduct.amount, {
                      shouldValidate: true,
                    });
                    // If penalty is currently active, re-apply the doubling
                    if (form.getValues("penalty")) {
                      form.setValue("amount_paid", selectedProduct.amount * 2, {
                        shouldValidate: true,
                      });
                    }
                  }
                }}
                value={form.watch("product_id")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a sticker type" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.length > 0 ? (
                    availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block size-4 rounded-full"
                            style={{
                              backgroundColor: product.color.toLowerCase(),
                            }}
                          ></span>
                          {product.name} (₱{product.amount.toFixed(2)})
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No active stickers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.product_id && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.product_id.message}
                </p>
              )}
            </div>

            {/* Amount Paid Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount_paid" className="text-right">
                Amount Paid
              </Label>
              <Input
                id="amount_paid"
                type="number"
                step="0.01"
                className="col-span-3"
                {...form.register("amount_paid", { valueAsNumber: true })}
                disabled={form.watch("penalty")} // Disable if penalty is active
              />
              {form.formState.errors.amount_paid && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.amount_paid.message}
                </p>
              )}
            </div>

            {/* Penalty Switch */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="penalty" className="text-right">
                Apply Penalty
              </Label>
              <Switch
                id="penalty"
                checked={form.watch("penalty")}
                onCheckedChange={(checked) => form.setValue("penalty", checked)}
                className="col-span-3 justify-self-start"
              />
              {form.formState.errors.penalty && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.penalty.message}
                </p>
              )}
            </div>

            {/* Driver Name Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driver_name" className="text-right">
                Driver Name
              </Label>
              <Input
                id="driver_name"
                className="col-span-3"
                {...form.register("driver_name")}
              />
              {form.formState.errors.driver_name && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.driver_name.message}
                </p>
              )}
            </div>

            {/* Driver License Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driver_license" className="text-right">
                Driver License
              </Label>
              <Input
                id="driver_license"
                className="col-span-3"
                {...form.register("driver_license")}
              />
              {form.formState.errors.driver_license && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.driver_license.message}
                </p>
              )}
            </div>

            {/* Company Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                className="col-span-3"
                {...form.register("company")}
              />
              {form.formState.errors.company && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.company.message}
                </p>
              )}
            </div>

            {/* Contact Number Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_number" className="text-right">
                Contact Number
              </Label>
              <Input
                id="contact_number"
                className="col-span-3"
                {...form.register("contact_number")}
              />
              {form.formState.errors.contact_number && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.contact_number.message}
                </p>
              )}
            </div>

            {/* Sticker Number Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sticker_number" className="text-right">
                Sticker No.
              </Label>
              <Input
                id="sticker_number"
                className="col-span-3"
                {...form.register("sticker_number")}
              />
              {form.formState.errors.sticker_number && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.sticker_number.message}
                </p>
              )}
            </div>

            {/* Plate Number Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plate_number" className="text-right">
                Plate No.
              </Label>
              <Input
                id="plate_number"
                className="col-span-3"
                {...form.register("plate_number")}
              />
              {form.formState.errors.plate_number && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.plate_number.message}
                </p>
              )}
            </div>

            {/* AF Number Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="af_number" className="text-right">
                AF No.
              </Label>
              <Input
                id="af_number"
                className="col-span-3"
                {...form.register("af_number")}
              />
              {form.formState.errors.af_number && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.af_number.message}
                </p>
              )}
            </div>
          </form>
        </SheetForm>
      )}
    </section>
  );
}
