export type Status = "ok" | "low" | "out";

export interface Station {
  id: number;
  name: string;
  brand: string;
  city: string;
  area: string;
  petrol: Status;
  diesel: Status;
  /** Hours until next delivery, or null when fuel is available. */
  eta: number | null;
  /** Minutes since the last update. */
  mins: number;
}

export type FuelFilter = "Any" | "Petrol" | "Diesel";
export type StatusFilter = "All" | "Has fuel" | "No fuel";

export interface Filters {
  city: string;
  fuel: FuelFilter;
  status: StatusFilter;
  q: string;
}
