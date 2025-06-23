// src/routes/_app/vehicle-sticker-settings.tsx

import { StickerForm } from "@/components/sticker-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { type Sticker, type StickerFormValues } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";

// --- TanStack Router Route Definition ---
export const Route = createFileRoute("/_app/vehicle-sticker-settings")({
  component: VehicleStickerSettingsPage,
});

// --- Main Component ---
function VehicleStickerSettingsPage() {
  const queryClient = useQueryClient();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

  // --- Fetching Stickers (TanStack Query) ---
  const {
    data: stickers,
    isLoading,
    isError,
    error,
  } = useQuery<Sticker[], Error>({
    queryKey: ["stickers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return data as Sticker[];
    },
  });

  // --- Add Sticker Mutation ---
  const addStickerMutation = useMutation<Sticker, Error, StickerFormValues>({
    mutationFn: async (newSticker) => {
      const { data, error } = await supabase
        .from("products")
        .insert([newSticker])
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as Sticker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] }); // Invalidate cache to refetch and update list
      setIsAddFormOpen(false); // Close form sheet
      // Optionally show a success toast/message
    },
    onError: (err) => {
      console.error("Error adding sticker:", err);
      // Optionally show an error toast/message
    },
  });

  // --- Edit Sticker Mutation ---
  const editStickerMutation = useMutation<Sticker, Error, Sticker>({
    mutationFn: async (updatedSticker) => {
      const { id, ...updateData } = updatedSticker; // Destructure ID, other fields are update data
      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data as Sticker;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] }); // Invalidate cache to refetch
      setEditingSticker(null); // Close edit form sheet
      // Optionally show a success toast/message
    },
    onError: (err) => {
      console.error("Error updating sticker:", err);
      // Optionally show an error toast/message
    },
  });

  // --- Delete Sticker Mutation ---
  const deleteStickerMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stickers"] }); // Invalidate cache to refetch
      // Optionally show a success toast/message
    },
    onError: (err) => {
      console.error("Error deleting sticker:", err);
      // Optionally show an error toast/message
    },
  });

  if (isLoading)
    return <div className="p-4 text-center">Loading stickers...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error?.message}
      </div>
    );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Vehicle Sticker Settings</h2>
        <Button size="sm" onClick={() => setIsAddFormOpen(true)}>
          Add new sticker
        </Button>
      </div>

      {/* Stickers List Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stickers && stickers.length > 0 ? (
              stickers.map((sticker) => (
                <TableRow key={sticker.id}>
                  <TableCell>{sticker.name}</TableCell>
                  <TableCell>
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: sticker.color.toLowerCase(),
                        color: "white",
                      }}
                    >
                      {sticker.color}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{sticker.amount ? sticker.amount.toFixed(2) : "0.00"}
                  </TableCell>{" "}
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${sticker.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {sticker.active ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSticker(sticker)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStickerMutation.mutate(sticker.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No stickers found. Add one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Sticker Form Sheet */}
      {(isAddFormOpen || editingSticker) && (
        <StickerForm
          isOpen={isAddFormOpen || !!editingSticker}
          onClose={() => {
            setIsAddFormOpen(false);
            setEditingSticker(null);
          }}
          initialData={editingSticker}
          addMutation={addStickerMutation}
          editMutation={editStickerMutation}
        />
      )}
    </div>
  );
}
