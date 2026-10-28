import type { Station, Status } from "./types";

type Row = [string, string, string, string, Status, Status, number | null, number];

// Sample data. Replace with a fetch from your API once real updates exist.
const rows: Row[] = [
  ["Puma Area 3", "Puma Energy", "Lilongwe", "Area 3", "ok", "ok", null, 12],
  ["Total Capital City", "TotalEnergies", "Lilongwe", "City Centre", "out", "ok", 3, 25],
  ["Petroda Kanengo", "Petroda", "Lilongwe", "Kanengo", "ok", "ok", null, 8],
  ["Engen Area 47", "Engen", "Lilongwe", "Area 47", "ok", "out", 5, 40],
  ["Moil Old Town", "Moil", "Lilongwe", "Old Town", "out", "out", 20, 55],
  ["Puma Limbe", "Puma Energy", "Blantyre", "Limbe", "ok", "ok", null, 6],
  ["Total Chichiri", "TotalEnergies", "Blantyre", "Chichiri", "out", "ok", 4, 18],
  ["Petroda Ginnery Corner", "Petroda", "Blantyre", "Ginnery Corner", "out", "out", 2, 33],
  ["Engen Mandala", "Engen", "Blantyre", "Mandala", "ok", "out", 6, 15],
  ["Puma Mzuzu Town", "Puma Energy", "Mzuzu", "Town Centre", "out", "out", 8, 22],
  ["Total Katoto", "TotalEnergies", "Mzuzu", "Katoto", "out", "out", 26, 70],
  ["Petroda Luwinga", "Petroda", "Mzuzu", "Luwinga", "ok", "ok", null, 10],
  ["Puma Zomba Market", "Puma Energy", "Zomba", "Market", "ok", "ok", null, 14],
  ["Total Mulunguzi", "TotalEnergies", "Zomba", "Mulunguzi", "out", "ok", 7, 45],
  ["Engen Zomba Road", "Engen", "Zomba", "Zomba Road", "ok", "out", 9, 29],
];

export const stations: Station[] = rows.map((r, id) => ({
  id,
  name: r[0],
  brand: r[1],
  city: r[2],
  area: r[3],
  petrol: r[4],
  diesel: r[5],
  eta: r[6],
  mins: r[7],
}));

export const ALL_LOCATIONS = "All locations";
export const cities = [ALL_LOCATIONS, ...Array.from(new Set(stations.map((s) => s.city)))];
