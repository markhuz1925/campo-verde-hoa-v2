import type { useAuth } from "./contexts/AuthContext";

export interface MyRouterContext {
  auth: ReturnType<typeof useAuth>;
}
