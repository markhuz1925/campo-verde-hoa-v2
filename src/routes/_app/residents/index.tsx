// src/routes/_app/residents/index.tsx

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"; // Import useRouter
import {
  X as ClearIcon,
  Edit,
  Filter as FilterIcon,
  Trash,
} from "lucide-react"; // Import Filter and ClearIcon
import { useEffect, useRef, useState } from "react"; // Import useEffect

// Shadcn Accordion components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input"; // Import Input
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// For filter form
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Import Resident types and form component
import { ResidentForm } from "@/components/resident-form";
import { buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Import cn
import type { Purchase, Resident, ResidentFormValues, Sticker } from "@/types";

// --- Resident Filter Form Schema ---
// Define possible unique values for phase, block, lot to create enums/select options dynamically
// For now, these will be strings, but in a real app, you might fetch unique values from DB or have a static list.
const residentFilterSchema = z.object({
  phase: z.string().optional(),
  block: z.string().optional(),
  lot: z.string().optional(),
});

type ResidentFilterValues = z.infer<typeof residentFilterSchema>;

// --- TanStack Router Route Definition ---
// Add a search validator for filter params
export const Route = createFileRoute("/_app/residents/")({
  // Validate and parse search params for filters
  validateSearch: residentFilterSchema,
  component: ResidentsPage,
});

// Helper function to fetch residents with their purchases
// Now accepts filter params
async function fetchResidentsWithPurchases(
  filters: ResidentFilterValues
): Promise<(Resident & { purchases: (Purchase & { product?: Sticker })[] })[]> {
  let query = supabase.from("residents").select("*");

  // Apply filters if present
  if (filters.phase) {
    query = query.eq("phase", filters.phase);
  }
  if (filters.block) {
    query = query.eq("block", filters.block);
  }
  if (filters.lot) {
    query = query.eq("lot", filters.lot);
  }

  const { data: residents, error: residentsError } = await query.order(
    "created_at",
    { ascending: false }
  );
  if (residentsError) throw residentsError;

  // Fetch all purchases and associated product details
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select(
      `
      *,
      product:products(*)
    `
    )
    .order("purchase_date", { ascending: false });
  if (purchasesError) throw purchasesError;

  // Map purchases to residents
  const residentsMap = new Map<
    string,
    Resident & { purchases: (Purchase & { product?: Sticker })[] }
  >();
  residents.forEach((resident) => {
    residentsMap.set(resident.id, { ...resident, purchases: [] });
  });

  purchases.forEach((purchase) => {
    const resident = residentsMap.get(purchase.resident_id);
    if (resident) {
      resident.purchases.push(purchase as Purchase & { product?: Sticker });
    }
  });

  return Array.from(residentsMap.values());
}

function ResidentsPage() {
  const router = useRouter(); // Get router instance for navigation
  const queryClient = useQueryClient();
  const { phase, block, lot } = Route.useSearch(); // Access filter search params from URL
  const filterCardRef = useRef<HTMLDivElement>(null);
  const [isFilterFixed, setIsFilterFixed] = useState(false);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Initialize filter form with current search params
  const filterForm = useForm<ResidentFilterValues>({
    resolver: zodResolver(residentFilterSchema),
    defaultValues: {
      phase: phase || "",
      block: block || "",
      lot: lot || "",
    },
  });

  // Effect to update form defaults if URL search params change
  useEffect(() => {
    filterForm.reset({
      phase: phase || "",
      block: block || "",
      lot: lot || "",
    });
  }, [phase, block, lot, filterForm]);

  // Update measurements and handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsFilterFixed(scrollY > 100); // Add shadow after scrolling 100px
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch residents with their purchases, passing current filters
  const {
    data: residents,
    isLoading,
    isError,
    error,
  } = useQuery<
    (Resident & { purchases: (Purchase & { product?: Sticker })[] })[],
    Error
  >({
    queryKey: ["residentsWithPurchases", { phase, block, lot }], // Query key includes filters
    queryFn: () => fetchResidentsWithPurchases({ phase, block, lot }), // Pass filters to fetcher
  });

  // Add Resident Mutation
  const addResidentMutation = useMutation<Resident, Error, ResidentFormValues>({
    mutationFn: async (newResident) => {
      const { data, error } = await supabase
        .from("residents")
        .insert([newResident])
        .select()
        .single();
      if (error) throw error;
      return data as Resident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentsWithPurchases"] });
      setIsAddFormOpen(false);
    },
    onError: (err) => console.error("Error adding resident:", err),
  });

  // Edit Resident Mutation
  const editResidentMutation = useMutation<Resident, Error, Resident>({
    mutationFn: async (updatedResident) => {
      const { id, ...updateData } = updatedResident;
      const { data, error } = await supabase
        .from("residents")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Resident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentsWithPurchases"] });
      setEditingResident(null);
    },
    onError: (err) => console.error("Error updating resident:", err),
  });

  // Delete Resident Mutation
  const deleteResidentMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("residents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residentsWithPurchases"] });
    },
    onError: (err) => console.error("Error deleting resident:", err),
  });

  // --- Filter Handlers ---
  const handleFilterSubmit = (values: ResidentFilterValues) => {
    // Navigate to update URL search params, triggering a new query
    router.navigate({
      search: (prev) => ({
        ...prev,
        ...values,
        // Ensure empty strings are removed from URL if field is cleared
        phase: values.phase || undefined,
        block: values.block || undefined,
        lot: values.lot || undefined,
      }),
      // Preserve current path, only update search
      to: "/residents" as string,
    });
  };

  const handleClearFilters = () => {
    filterForm.reset({ phase: "", block: "", lot: "" }); // Reset form
    router.navigate({
      search: (prev) => ({
        ...prev,
        phase: undefined, // Remove from URL
        block: undefined,
        lot: undefined,
      }),
      to: "/residents" as string,
    });
  };

  if (isLoading)
    return <div className="p-4 text-center">Loading residents...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error?.message}
      </div>
    );

  return (
    <section className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Residents</h2>
        <Button size="sm" onClick={() => setIsAddFormOpen(true)}>
          Register Resident
        </Button>
      </div>

      {/* Filter Section */}
      <div
        ref={filterCardRef}
        className={cn(
          "sticky top-4 z-40 border rounded-md bg-neutral-50/90 backdrop-blur-sm transition-all duration-200 w-full mb-4",
          isFilterFixed && "shadow-md"
        )}
      >
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FilterIcon className="h-4 w-4" /> Filter Residents
          </h3>
          <form
            onSubmit={filterForm.handleSubmit(handleFilterSubmit)}
            className="grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <div>
              <Label htmlFor="phase" className="text-xs mb-1.5">
                Phase
              </Label>
              <Input
                id="phase"
                {...filterForm.register("phase")}
                placeholder="e.g., Phase 1"
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="block" className="text-xs mb-1.5">
                Block
              </Label>
              <Input
                id="block"
                {...filterForm.register("block")}
                placeholder="e.g., Block A"
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="lot" className="text-xs mb-1.5">
                Lot
              </Label>
              <Input
                id="lot"
                {...filterForm.register("lot")}
                placeholder="e.g., Lot 12"
                className="h-8"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" size="sm" className="flex-1 h-8">
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-8"
              >
                <ClearIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4">
        {residents && residents.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {residents.map((resident) => (
              <AccordionItem value={resident.id} key={resident.id}>
                <AccordionTrigger className="flex justify-between items-center px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-5 w-full">
                    <Link
                      to={`/residents/${resident.id}` as string}
                      className="font-semibold text-lg hover:underline"
                    >
                      {resident.name}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      Phase: {resident.phase} | Block: {resident.block} | Lot:{" "}
                      {resident.lot}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingResident(resident);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </div>
                    <div
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "cursor-pointer"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteResidentMutation.mutate(resident.id);
                      }}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-secondary/20 rounded-b-md">
                  <h4 className="font-semibold mb-2">Purchased Stickers:</h4>
                  {resident.purchases.length > 0 ? (
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
                          <TableHead className="text-right">
                            Amount Paid
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resident.purchases.map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell>
                              {purchase.product?.name || "N/A"}
                            </TableCell>
                            <TableCell>{purchase.type}</TableCell>
                            <TableCell>
                              <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor:
                                    purchase.product?.color?.toLowerCase() ||
                                    "gray",
                                  color: "white",
                                }}
                              >
                                {purchase.product?.color || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>{purchase.sticker_number}</TableCell>
                            <TableCell>{purchase.plate_number}</TableCell>
                            <TableCell>{purchase.af_number}</TableCell>
                            <TableCell>{purchase.driver_name}</TableCell>
                            <TableCell>
                              {purchase.driver_license || "N/A"}
                            </TableCell>
                            <TableCell>{purchase.company || "N/A"}</TableCell>
                            <TableCell>
                              {purchase.contact_number || "N/A"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  purchase.penalty
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {purchase.penalty ? "Yes" : "No"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                purchase.purchase_date
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ₱{purchase.amount_paid.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No stickers purchased yet for this resident.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground h-24 flex items-center justify-center border rounded-md">
            No residents found. Register one!
          </div>
        )}
      </div>

      {/* Add/Edit Resident Form Sheet */}
      {(isAddFormOpen || editingResident) && (
        <ResidentForm
          isOpen={isAddFormOpen || !!editingResident}
          onClose={() => {
            setIsAddFormOpen(false);
            setEditingResident(null);
            queryClient.invalidateQueries({
              queryKey: ["residentsWithPurchases"],
            });
          }}
          initialData={editingResident}
          addMutation={addResidentMutation}
          editMutation={editResidentMutation}
        />
      )}
    </section>
  );
}
