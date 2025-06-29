import { z } from "zod";
import type { useAuth } from "./contexts/AuthContext";

export interface MyRouterContext {
  auth: ReturnType<typeof useAuth>;
}

export type StickerName =
  | "Homeowner"
  | "Tenant"
  | "Courier"
  | "Delivery/Service"
  | "Visitor";
export type StickerColor = "GREEN" | "YELLOW" | "RED" | "GRAY" | "WHITE";

export interface Sticker {
  id: string;
  name: StickerName;
  color: StickerColor;
  amount: number; // Stored as NUMERIC in DB, handled as number in app
  active: boolean;
  created_at: string;
}

export const STICKER_NAMES: StickerName[] = [
  "Homeowner",
  "Tenant",
  "Courier",
  "Delivery/Service",
  "Visitor",
];
export const STICKER_COLORS: StickerColor[] = [
  "GREEN",
  "YELLOW",
  "RED",
  "GRAY",
  "WHITE",
];

// --- Form Schema for Validation (Moved here for reusability) ---
export const stickerFormSchema = z.object({
  name: z.enum([...STICKER_NAMES] as [StickerName, ...StickerName[]], {
    message: "Please select a valid sticker type.",
  }),
  color: z.enum([...STICKER_COLORS] as [StickerColor, ...StickerColor[]], {
    message: "Please select a valid sticker color.",
  }),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  active: z.boolean(),
});

export type StickerFormValues = z.infer<typeof stickerFormSchema>;

export interface Resident {
  id: string;
  name: string;
  phase: string;
  block: string;
  lot: string;
  created_at: string;
}

export type PurchaseType = "Renewal" | "New Application"; // New: Type for purchase

export interface Purchase {
  id: string;
  resident_id: string;
  product_id: string;
  purchase_date: string;
  amount_paid: number;
  driver_name: string;
  driver_license: string | null;
  company: string | null;
  contact_number: string | null;
  sticker_number: string;
  plate_number: string;
  af_number: string;
  penalty: boolean;
  type: PurchaseType; // New: Type of purchase
  product?: Sticker; // Joined product details
}

// --- Form Schema for Resident Validation ---
export const residentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phase: z
    .string()
    .min(1, "Phase is required.")
    .max(10, "Phase cannot exceed 10 characters."),
  block: z
    .string()
    .min(1, "Block is required.")
    .max(10, "Block cannot exceed 10 characters."),
  lot: z
    .string()
    .min(1, "Lot is required.")
    .max(10, "Lot cannot exceed 10 characters."),
});

export type ResidentFormValues = z.infer<typeof residentFormSchema>;

// New: Constants for Purchase Type dropdown
export const PURCHASE_TYPES: PurchaseType[] = ["New Application", "Renewal"];

// --- New: Form Schema for Purchase (Expanded with new fields) ---
export const purchaseFormSchema = z.object({
  product_id: z.string().min(1, "Please select a sticker to purchase."),
  amount_paid: z.coerce.number().min(0.01, "Amount must be greater than 0."),
  driver_name: z
    .string()
    .min(2, "Driver's name is required.")
    .max(50, "Driver's name is too long."),
  driver_license: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  contact_number: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        return /^\+?[0-9\s-()]{7,20}$/.test(val);
      },
      {
        message: "Invalid contact number format.",
      }
    ),
  sticker_number: z.string().min(1, "Sticker number is required."),
  plate_number: z.string().min(1, "Plate number is required."),
  af_number: z.string().min(1, "AF number is required."),
  penalty: z.boolean(),
  type: z.enum([...PURCHASE_TYPES] as [PurchaseType, ...PurchaseType[]], {
    message: "Please select a valid purchase type.",
  }), // New field
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

// --- Transaction Interface ---
export interface Transaction {
  id: string;
  purchase_id: string;
  resident_id: string;
  product_id: string;
  transaction_type: 'purchase' | 'refund' | 'adjustment';
  amount: number;
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'gcash';
  reference_number?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  transaction_date: string;
  processed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data from transactions_detailed view
  resident_name?: string;
  phase?: string;
  block?: string;
  lot?: string;
  product_name?: string;
  product_color?: string;
  driver_name?: string;
  plate_number?: string;
  sticker_number?: string;
  af_number?: string;
  purchase_type?: string;
}
