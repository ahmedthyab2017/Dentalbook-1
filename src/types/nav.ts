import type { Role } from "./session";

export interface NavItem {
  id: string;
  ar: string;
  en: string;
  ownerOnly?: boolean;
}

export type NavGroupKey = "main" | "clinical" | "financial" | "mgmt" | "other";

export type NavMap = Record<NavGroupKey, NavItem[]>;

export type NavSide = "staff" | "patient";

export type { Role };
