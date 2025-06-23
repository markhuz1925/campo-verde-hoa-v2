import { SheetForm } from "@/components/sheet-form";
import {
  STICKER_COLORS,
  STICKER_NAMES,
  type Sticker,
  type StickerColor,
  type StickerFormValues,
  type StickerName,
  stickerFormSchema,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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

interface StickerFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Sticker | null;
  addMutation: ReturnType<
    typeof useMutation<Sticker, Error, StickerFormValues>
  >;
  editMutation: ReturnType<typeof useMutation<Sticker, Error, Sticker>>;
}

export function StickerForm({
  isOpen,
  onClose,
  initialData,
  addMutation,
  editMutation,
}: StickerFormProps) {
  const isEditMode = !!initialData;
  const form = useForm<StickerFormValues>({
    resolver: zodResolver(stickerFormSchema),
    defaultValues: isEditMode
      ? {
          name: initialData.name,
          color: initialData.color,
          amount: initialData.amount,
          active: initialData.active,
        }
      : {
          name: "Homeowner",
          color: "GREEN",
          amount: 0.01,
          active: true,
        },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditMode
          ? {
              name: initialData!.name,
              color: initialData!.color,
              amount: initialData!.amount,
              active: initialData!.active,
            }
          : {
              name: "Homeowner",
              color: "GREEN",
              amount: 0.01,
              active: true,
            }
      );
      form.clearErrors(); // Clear errors on open
    }
  }, [isOpen, initialData, isEditMode, form.reset, form.clearErrors]);

  const onSubmit = async (values: StickerFormValues) => {
    if (isEditMode && initialData) {
      editMutation.mutate({
        ...values,
        id: initialData.id,
        created_at: initialData.created_at,
      });
    } else {
      addMutation.mutate(values);
    }
    onClose();
  };

  const isPending = addMutation.isPending || editMutation.isPending;

  return (
    <SheetForm
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Sticker" : "Add New Sticker"}
      description={
        isEditMode
          ? "Make changes to the sticker here. Click save when you're done."
          : "Fill in the details for a new vehicle sticker."
      }
      footerContent={
        <Button
          type="submit"
          disabled={isPending}
          onClick={form.handleSubmit(onSubmit)}
        >
          {isEditMode
            ? isPending
              ? "Saving changes..."
              : "Save changes"
            : isPending
              ? "Adding sticker..."
              : "Add sticker"}
        </Button>
      }
      className="px-4"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Type
          </Label>
          <Select
            onValueChange={(val) => form.setValue("name", val as StickerName)}
            value={form.watch("name")}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {STICKER_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.name && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="color" className="text-right">
            Color
          </Label>
          <Select
            onValueChange={(val) => form.setValue("color", val as StickerColor)}
            value={form.watch("color")}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              {STICKER_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-4 rounded-full"
                      style={{ backgroundColor: color.toLowerCase() }}
                    ></span>
                    {color}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.color && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.color.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            className="col-span-3"
            {...form.register("amount", { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="active" className="text-right">
            Active
          </Label>
          <Switch
            id="active"
            checked={form.watch("active")}
            onCheckedChange={(checked) => form.setValue("active", checked)}
            className="col-span-3 justify-self-start"
          />
        </div>
      </form>
    </SheetForm>
  );
}
