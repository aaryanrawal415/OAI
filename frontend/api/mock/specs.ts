import type { ListingStatus, Place, SourceType } from "../types";

// DEMONSTRATION LISTINGS. Invented for the demo: they are not real freight and the locations are
// approximate hubs. Each one is built to show a different outcome of the rules.

export interface DemoSpec {
  id: string;
  corridor: string;
  title: string;
  category: string;
  weight_kg: number | null;
  rate_inr: number | null;
  pickup: Place;
  drop: Place;
  pickup_at_km: number;
  drop_at_km: number;
  pickup_excursion_km: number | null;
  drop_excursion_km: number | null;
  window_ok: boolean | null;
  extra_active_minutes: number | null;
  status: ListingStatus;
  bundle_size: number;
  source: SourceType;
}

const P = (name: string, lat: number, lng: number): Place => ({ name, lat, lng });

const H = {
  okhla: P("Okhla Industrial Area, Delhi", 28.53, 77.27),
  bawana: P("Bawana Industrial Area, Delhi", 28.8, 77.04),
  manesar: P("Manesar, Haryana", 28.35, 76.94),
  jaipur: P("Sitapura, Jaipur", 26.78, 75.84),
  beawar: P("Beawar, Rajasthan", 26.1, 74.32),
  udaipur: P("Udaipur, Rajasthan", 24.58, 73.68),
  vatva: P("Vatva, Ahmedabad", 22.97, 72.65),
  makarpura: P("Makarpura, Vadodara", 22.25, 73.17),
  surat: P("Surat textile markets", 21.17, 72.83),
  sachin: P("Sachin, Surat", 21.09, 72.87),
  vapi: P("Vapi Industrial Estate", 20.37, 72.9),
  vasai: P("Vasai Virar", 19.4, 72.83),
  bhiwandi: P("Bhiwandi warehouse cluster", 19.3, 73.06),
  taloja: P("Taloja Industrial Area", 19.06, 73.12),
  jnpt: P("JNPT (Nhava Sheva)", 18.95, 72.95),
  chakan: P("Chakan, Pune", 18.76, 73.86),
  satara: P("Satara Industrial Area", 17.69, 74.0),
  kolhapur: P("Kolhapur", 16.7, 74.24),
  belagavi: P("Belagavi", 15.85, 74.5),
  hubballi: P("Hubballi-Dharwad", 15.36, 75.12),
  davanagere: P("Davanagere", 14.46, 75.92),
  tumakuru: P("Tumakuru", 13.34, 77.1),
  peenya: P("Peenya, Bengaluru", 13.03, 77.52),
  gwalior: P("Gwalior", 26.22, 78.18),
  mandideep: P("Mandideep, Bhopal", 23.1, 77.5),
  butibori: P("Butibori, Nagpur", 20.97, 78.98),
  patancheru: P("Patancheru, Hyderabad", 17.53, 78.27),
  vijayawada: P("Vijayawada", 16.51, 80.65),
  nellore: P("Nellore", 14.44, 79.99),
  sriperumbudur: P("Sriperumbudur", 12.97, 79.94),
  ambattur: P("Ambattur, Chennai", 13.1, 80.15),
};

interface Opts {
  status?: ListingStatus;
  bundle?: number;
}

function S(
  id: string,
  corridor: string,
  title: string,
  category: string,
  weight: number | null,
  rate: number | null,
  pickup: Place,
  drop: Place,
  pAt: number,
  dAt: number,
  pe: number | null,
  de: number | null,
  window: boolean | null,
  opts: Opts = {},
): DemoSpec {
  // Extra active time = loading + unloading (30 min + 2 min per tonne, each) + detour driving
  // at 30 km/h. Unknown weight or distance gives unknown time.
  const extraMin =
    weight != null && pe != null && de != null
      ? Math.round(60 + (4 * weight) / 1000 + ((pe + de) / 30) * 60)
      : null;
  return {
    id,
    corridor,
    title,
    category,
    weight_kg: weight,
    rate_inr: rate,
    pickup,
    drop,
    pickup_at_km: pAt,
    drop_at_km: dAt,
    pickup_excursion_km: pe,
    drop_excursion_km: de,
    window_ok: window,
    extra_active_minutes: extraMin,
    status: opts.status ?? "open",
    bundle_size: opts.bundle ?? 1,
    source: "synthetic",
  };
}

export const DEMO_SPECS: DemoSpec[] = [
  // ---- Delhi to Mumbai (about 1,400 km) ----
  S("dm-01", "delhi_mumbai", "Packaged goods, Okhla to Ahmedabad", "fmcg_packaged", 9000, 62000, H.okhla, H.vatva, 12, 930, 0, 0, true),
  S("dm-02", "delhi_mumbai", "Auto parts, Manesar to Vadodara", "auto_parts", 6800, 48500, H.manesar, H.makarpura, 45, 1060, 11.8, 0, true),
  S("dm-03", "delhi_mumbai", "Steel coils, Okhla to Surat", "steel_coils_sections", 15500, 74000, H.okhla, H.surat, 12, 1230, 0, 0, true),
  S("dm-04", "delhi_mumbai", "Garments, Jaipur to Surat", "textiles_garments", 5200, 41000, H.jaipur, H.surat, 270, 1230, 19.5, 0, true),
  S("dm-05", "delhi_mumbai", "Heavy machinery, Manesar to Vadodara", "machinery_heavy", 24000, 118000, H.manesar, H.makarpura, 45, 1060, 8, 0, true),
  S("dm-06", "delhi_mumbai", "Furniture, Udaipur to Bhiwandi", "furniture_household", 3900, 36000, H.udaipur, H.bhiwandi, 690, 1380, 40, 8, true),
  S("dm-07", "delhi_mumbai", "Parcels, Bawana to Vasai", "ecommerce_parcels", 2200, 29000, H.bawana, H.vasai, 20, 1370, 41, 0, true),
  S("dm-08", "delhi_mumbai", "Grain bags, Beawar to Vadodara", "agri_grain_bags", null, 33000, H.beawar, H.makarpura, 520, 1060, 0, 3.2, true),
  S("dm-09", "delhi_mumbai", "Cement bags, Beawar to Surat", "cement_bags", 14000, 52000, H.beawar, H.surat, 520, 1230, 0, 0, true, { status: "cancelled" }),
  S("dm-10", "delhi_mumbai", "3 consignments, Manesar cluster to Bhiwandi cluster", "fmcg_packaged", 7800, 71000, H.manesar, H.bhiwandi, 45, 1380, 9.2, 5.5, true, { bundle: 3 }),
  S("dm-11", "delhi_mumbai", "Auto parts, Okhla to Ahmedabad (distance unverified)", "auto_parts", 4100, 39000, H.okhla, H.vatva, 12, 930, null, 0, true),
  S("dm-12", "delhi_mumbai", "Parcels, Okhla to Surat", "ecommerce_parcels", 1900, 22000, H.okhla, H.surat, 12, 1230, 0, 0, false),

  // ---- Surat to Mumbai (about 280 km) ----
  S("sm-01", "surat_mumbai", "Garments, Surat to Bhiwandi", "textiles_garments", 6000, 28000, H.surat, H.bhiwandi, 5, 255, 0, 0, true),
  S("sm-02", "surat_mumbai", "Packaged chemicals, Sachin to Taloja", "chemicals_packaged_hazardous", 4000, 52000, H.sachin, H.taloja, 15, 265, 4, 0, true),
  S("sm-03", "surat_mumbai", "Parcels, Surat to Vasai", "ecommerce_parcels", 2000, 16000, H.surat, H.vasai, 5, 240, 0, 12, true),
  S("sm-04", "surat_mumbai", "Packaged goods, Vapi to JNPT", "fmcg_packaged", 11000, 31000, H.vapi, H.jnpt, 120, 270, 9, 33, true),
  S("sm-05", "surat_mumbai", "Cement bags, Vapi to Bhiwandi", "cement_bags", 20000, 38000, H.vapi, H.bhiwandi, 120, 255, 0, 0, true),
  S("sm-06", "surat_mumbai", "2 consignments, Surat cluster to Vasai", "textiles_garments", 3000, 41000, H.sachin, H.vasai, 10, 240, 3, 2, true, { bundle: 2 }),

  // ---- Mumbai to Bengaluru (about 1,000 km) ----
  S("mb-01", "mumbai_bengaluru", "Auto parts, Chakan to Bengaluru", "auto_parts", 8200, 54000, H.chakan, H.peenya, 150, 990, 0, 0, true),
  S("mb-02", "mumbai_bengaluru", "Packaged goods, Bhiwandi to Kolhapur", "fmcg_packaged", 7000, 39000, H.bhiwandi, H.kolhapur, 30, 380, 17.5, 6.2, true),
  S("mb-03", "mumbai_bengaluru", "Textiles, Taloja to Hubballi", "textiles_garments", 4800, 33500, H.taloja, H.hubballi, 20, 600, 22, 0, true),
  S("mb-04", "mumbai_bengaluru", "Machinery, Chakan to Belagavi", "machinery_heavy", 26000, 99000, H.chakan, H.belagavi, 150, 500, 0, 0, true),
  S("mb-05", "mumbai_bengaluru", "Grain bags, Satara to Tumakuru", "agri_grain_bags", 12500, 36000, H.satara, H.tumakuru, 280, 950, 0, 44.5, true),
  S("mb-06", "mumbai_bengaluru", "Furniture, Bhiwandi to Davanagere", "furniture_household", 5400, 32000, H.bhiwandi, H.davanagere, 30, 800, 0, 5, null),

  // ---- Delhi to Chennai (about 2,200 km) ----
  S("dc-01", "delhi_chennai", "Auto parts, Okhla to Nagpur", "auto_parts", 7500, 60000, H.okhla, H.butibori, 10, 1050, 0, 0, true),
  S("dc-02", "delhi_chennai", "Packaged goods, Okhla to Hyderabad", "fmcg_packaged", 10500, 78000, H.okhla, H.patancheru, 10, 1560, 14, 0, true),
  S("dc-03", "delhi_chennai", "Garments, Gwalior to Vijayawada", "textiles_garments", 6200, 52000, H.gwalior, H.vijayawada, 320, 1700, 26, 9, true),
  S("dc-04", "delhi_chennai", "Building materials, Mandideep to Nellore", "building_materials", 16500, 61000, H.mandideep, H.nellore, 760, 1990, 0, 41, true),
  S("dc-05", "delhi_chennai", "Furniture, Okhla to Chennai", "furniture_household", null, 45000, H.okhla, H.ambattur, 10, 2180, 0, 0, true),
  S("dc-06", "delhi_chennai", "3 consignments, Patancheru cluster to Sriperumbudur", "auto_parts", 9600, 83000, H.patancheru, H.sriperumbudur, 1560, 2150, 7, 12, true, { bundle: 3 }),
];
