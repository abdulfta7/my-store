export const EGYPT_GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Sharqia",
  "Dakahlia",
  "Beheira",
  "Kafr El Sheikh",
  "Gharbia",
  "Monufia",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "North Sinai",
  "South Sinai",
  "Beni Suef",
  "Faiyum",
  "Minya",
  "Assiut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matruh",
] as const;

export type Governorate = (typeof EGYPT_GOVERNORATES)[number];

/** Shipping cost by governorate — Cairo & Giza are cheapest */
export function getShippingCost(governorate: string): number {
  if (governorate === "Cairo" || governorate === "Giza") return 50;
  return 100;
}
