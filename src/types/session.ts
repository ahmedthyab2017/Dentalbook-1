// Mirrors legacy `State` (app/app.js:1183-1197) + auth roles from
// tryLogin() (app/app.js:2058-2115).

export type Role = "owner" | "doctor" | "reception" | "secretary" | "patient";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  staffId?: string;
  ptId?: string;
}

export type Lang = "ar" | "en";
export type Theme = "light" | "dark";
