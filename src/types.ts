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
