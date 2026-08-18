import type { Location } from "../types";

/** Demo service locations — no real lab networks or maps are connected. */
export const locations: Location[] = [
  { id: "rajpura", name: "Rajpura", region: "Punjab", labCount: 2 },
  { id: "patiala", name: "Patiala", region: "Punjab", labCount: 2 },
  { id: "chandigarh", name: "Chandigarh", region: "Chandigarh", labCount: 2 },
  { id: "mohali", name: "Mohali", region: "Punjab", labCount: 2 },
];

export function getLocationByName(name: string): Location | undefined {
  return locations.find((l) => l.name.toLowerCase() === name.toLowerCase());
}
