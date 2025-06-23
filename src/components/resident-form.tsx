import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { SheetForm } from "@/components/sheet-form";
import {
  type Resident,
  type ResidentFormValues,
  residentFormSchema,
} from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Resident | null;
  addMutation: ReturnType<
    typeof useMutation<Resident, Error, ResidentFormValues>
  >;
  editMutation: ReturnType<typeof useMutation<Resident, Error, Resident>>;
}

export function ResidentForm({
  isOpen,
  onClose,
  initialData,
  addMutation,
  editMutation,
}: ResidentFormProps) {
  const isEditMode = !!initialData;
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: isEditMode
      ? {
          name: initialData.name,
          phase: initialData.phase,
          block: initialData.block,
          lot: initialData.lot,
        }
      : {
          name: "",
          phase: "",
          block: "",
          lot: "",
        },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditMode
          ? {
              name: initialData!.name,
              phase: initialData!.phase,
              block: initialData!.block,
              lot: initialData!.lot,
            }
          : {
              name: "",
              phase: "",
              block: "",
              lot: "",
            }
      );
      form.clearErrors(); // Clear errors on open
    }
  }, [isOpen, initialData, isEditMode, form.reset, form.clearErrors]);

  const onSubmit = async (values: ResidentFormValues) => {
    if (isEditMode && initialData) {
      editMutation.mutate({
        ...values,
        id: initialData.id,
        created_at: initialData.created_at,
      });
    } else {
      addMutation.mutate(values);
    }
    // onClose(); // Close the sheet is handled by onSuccess in parent
  };

  const isPending = addMutation.isPending || editMutation.isPending;

  return (
    <SheetForm
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Resident" : "Register New Resident"}
      description={
        isEditMode
          ? "Make changes to the resident's details here. Click save when you're done."
          : "Fill in the details for a new resident."
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
              ? "Registering resident..."
              : "Register Resident"}
        </Button>
      }
      className="px-4"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input id="name" className="col-span-3" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phase" className="text-right">
            Phase
          </Label>
          <Input
            id="phase"
            className="col-span-3"
            {...form.register("phase")}
          />
          {form.formState.errors.phase && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.phase.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="block" className="text-right">
            Block
          </Label>
          <Input
            id="block"
            className="col-span-3"
            {...form.register("block")}
          />
          {form.formState.errors.block && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.block.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lot" className="text-right">
            Lot
          </Label>
          <Input id="lot" className="col-span-3" {...form.register("lot")} />
          {form.formState.errors.lot && (
            <p className="col-span-4 text-right text-red-500 text-sm">
              {form.formState.errors.lot.message}
            </p>
          )}
        </div>
      </form>
    </SheetForm>
  );
}
