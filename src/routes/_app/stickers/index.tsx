import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

// Import necessary types from your types file
import type { Purchase, Resident, Sticker } from "@/types";

// Define an extended type for the fetched data, including joined relations
interface DetailedPurchase extends Purchase {
  resident: Resident | undefined; // Joined resident data
  product: Sticker | undefined; // Joined product data
}

export const Route = createFileRoute("/_app/stickers/")({
  component: StickersPage,
});

function StickersPage() {
  const {
    data: purchases,
    isLoading,
    isError,
    error,
    // status // Optional: Can use 'status' for more granular loading/error states
  } = useQuery<DetailedPurchase[], Error>({
    queryKey: ["allPurchases"],
    queryFn: async () => {
      console.log("Fetching all purchases..."); // Add log to track queryFn execution
      const { data, error } = await supabase
        .from("purchases")
        .select(
          `
          *,
          resident:residents(*),
          product:products(*)
        `
        )
        .order("purchase_date", { ascending: false });
      if (error) {
        throw error;
      }
      return data as DetailedPurchase[];
    },
    // Optional: Add some options to control refetching behavior
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch automatically when window regains focus
    refetchOnMount: false, // Don't refetch automatically on mount
    refetchOnReconnect: false, // Don't refetch automatically on reconnect
    // initialData: [], // If you want to start with empty data immediately
  });

  if (isLoading)
    return (
      <div className="p-4 text-center">Loading all sticker purchases...</div>
    );
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error?.message}
      </div>
    );

  return (
    <section className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">All Sticker Purchases</h2>
      </div>

      <div className="h-[calc(100vh-9rem)]">
        {/* FIX: Ensure table is only rendered when purchases data is available and not empty */}
        {purchases && purchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resident Name</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Sticker No.</TableHead>
                <TableHead>Plate No.</TableHead>
                <TableHead>AF No.</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact No.</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="uppercase">
                    {purchase.resident?.name || "N/A"}
                  </TableCell>
                  <TableCell>{purchase.resident?.phase || "N/A"}</TableCell>
                  <TableCell>{purchase.resident?.block || "N/A"}</TableCell>
                  <TableCell>{purchase.resident?.lot || "N/A"}</TableCell>
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
                  <TableCell>{purchase.plate_number}</TableCell>
                  <TableCell>{purchase.af_number}</TableCell>
                  <TableCell>{purchase.driver_name}</TableCell>
                  <TableCell>{purchase.driver_license || "N/A"}</TableCell>
                  <TableCell>{purchase.company || "N/A"}</TableCell>
                  <TableCell>{purchase.contact_number || "N/A"}</TableCell>
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
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{purchase.amount_paid.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          // Display message if no purchases
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No sticker purchases found.
          </div>
        )}
      </div>
    </section>
  );
}
