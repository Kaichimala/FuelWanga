// ---------------------------------------------------------------------------
// DB-level fuel status (matches the Postgres check constraint)
// ---------------------------------------------------------------------------
export type DbStatus = "has_fuel" | "no_fuel";

// ---------------------------------------------------------------------------
// UI-level status – kept as a superset so future "low" state is easy to add.
// Currently only "ok" and "out" are produced from DB data.
// ---------------------------------------------------------------------------
export type Status = "ok" | "low" | "out";

// ---------------------------------------------------------------------------
// Station as returned by the `stations_public` Supabase view
// ---------------------------------------------------------------------------
export interface StationRow {
  id: string;
  name: string;
  brand: string;
  city: string;
  area: string;
  petrol_status: DbStatus;
  diesel_status: DbStatus;
  petrol_eta: string | null; // ISO timestamptz or null
  diesel_eta: string | null; // ISO timestamptz or null
  updated_at: string; // ISO timestamptz
}

// ---------------------------------------------------------------------------
// Station shape used inside the UI components
// ---------------------------------------------------------------------------
export interface Station {
  id: string;
  name: string;
  brand: string;
  city: string;
  area: string;
  petrol: Status;
  diesel: Status;
  petrol_eta: string | null; // ISO timestamp
  diesel_eta: string | null; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type FuelFilter = "Any" | "Petrol" | "Diesel";
export type StatusFilter = "All" | "Has fuel" | "No fuel";

export interface Filters {
  city: string;
  fuel: FuelFilter;
  status: StatusFilter;
  q: string;
}
