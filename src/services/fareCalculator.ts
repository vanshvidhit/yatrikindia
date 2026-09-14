export interface UpfrontFareResult {
  baseFare: number;
  distanceFare: number;
  congestionCharge: number;
  platformFee: number;
  gst: number;
  subtotal: number;
  surgeMultiplier: number;
  total: number;
}

export type LocalizedTier = "auto" | "go" | "sedan" | "xl";

export const TIER_RATES: Record<
  LocalizedTier,
  {
    name: string;
    fleetModels: string;
    pax: number;
    bootSpec: string;
    hasCNGNotice: boolean;
    base: number;
    perKm: number;
    delayRate: number; // ₹/delay min in gridlock
    firstKmIncluded?: number;
  }
> = {
  auto: {
    name: "Yatrik Auto",
    fleetModels: "Bajaj RE Compact, Piaggio Ape City",
    pax: 3,
    bootSpec: "No heavy luggage (Soft bags only)",
    hasCNGNotice: false,
    base: 30, // first 1.5 km included in base
    perKm: 15,
    delayRate: 1.5,
    firstKmIncluded: 1.5,
  },
  go: {
    name: "Yatrik Go (Hatchback)",
    fleetModels: "Maruti WagonR, Tata Tiago, Celerio",
    pax: 4,
    bootSpec: "Compact boot (2 small soft bags)",
    hasCNGNotice: false,
    base: 50,
    perKm: 14,
    delayRate: 2.0,
  },
  sedan: {
    name: "Yatrik Sedan (Sub-4m)",
    fleetModels: "Maruti Dzire Tour S, Hyundai Aura, Tigor",
    pax: 4,
    bootSpec: "1 medium suitcase (60L CNG cylinder fitted in boot)",
    hasCNGNotice: true,
    base: 70,
    perKm: 17,
    delayRate: 2.5,
  },
  xl: {
    name: "Yatrik XL (6-Seater SUV)",
    fleetModels: "Maruti Ertiga, Kia Carens, Innova Crysta",
    pax: 6,
    bootSpec: "Full clear trunk space (3-4 large suitcases, no cylinder)",
    hasCNGNotice: false,
    base: 120,
    perKm: 22,
    delayRate: 3.5,
  },
};

/**
 * Calculates Upfront Guaranteed Fare adhering strictly to:
 * - Upfront transparent traffic pricing (delay minutes instead of arbitrary per-min spikes)
 * - National Aggregator Guidelines (MoRTH) regulatory surge cap of max 2.0x
 * - 5% Indian Transport Goods & Services Tax (GST)
 * - Transparent Platform Fee (₹15)
 */
export const calculateUpfrontFare = (
  category: LocalizedTier,
  distanceKm: number,
  durationMins: number,
  normalDurationMins?: number,
  surge: number = 1.0
): UpfrontFareResult => {
  const rate = TIER_RATES[category] || TIER_RATES.sedan;

  // If normal baseline duration is not provided, estimate based on 30 km/h baseline
  const expectedNormalMins = normalDurationMins ?? Math.max(5, Math.round((distanceKm / 30) * 60));
  const delayMinutes = Math.max(0, durationMins - expectedNormalMins);

  // Regulatory cap strictly enforced: Min 1.0x, Max 2.0x ceiling as per MoRTH guidelines
  const surgeMultiplier = Math.min(Math.max(surge, 1.0), 2.0);

  // Distance billing (taking into account first km included for Auto)
  let chargeableDistance = distanceKm;
  if (rate.firstKmIncluded && rate.firstKmIncluded > 0) {
    chargeableDistance = Math.max(0, distanceKm - rate.firstKmIncluded);
  }
  const distanceFare = Math.round(chargeableDistance * rate.perKm);

  // Congestion factor * delay time (penalizes gridlock fairly, transparently upfront)
  const congestionCharge = Math.round(delayMinutes * rate.delayRate);

  const baseAndDistance = rate.base + distanceFare;
  const subtotal = Math.round((baseAndDistance + congestionCharge) * surgeMultiplier);
  const platformFee = 15;
  const gst = Math.round((subtotal + platformFee) * 0.05);
  const total = Math.round(subtotal + platformFee + gst);

  return {
    baseFare: rate.base,
    distanceFare,
    congestionCharge,
    platformFee,
    gst,
    subtotal,
    surgeMultiplier,
    total,
  };
};
