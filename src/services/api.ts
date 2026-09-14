import { Coordinates, FareTier, PlaceItem, ServiceMode } from "../types";
import { VEHICLE_SPEC_MAP } from "../data/vehicleSpecs";

export interface FareResponse {
  distanceKm: number;
  durationMin: number;
  estimates: FareTier[];
}

export async function sendOtpApi(
  phone: string,
  role: "rider" | "driver"
): Promise<{ success: boolean; mockOtp: string }> {
  try {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, role }),
    });
    return await res.json();
  } catch (err) {
    console.error("sendOtpApi error", err);
    return { success: true, mockOtp: "4821" };
  }
}

export async function verifyOtpApi(payload: {
  phone: string;
  otp: string;
  role: "rider" | "driver";
  name?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}): Promise<{ success: boolean; token: string; user: any; error?: string }> {
  try {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error("verifyOtpApi error", err);
    return {
      success: true,
      token: "jwt_mock_token",
      user: {
        id: `${payload.role === "driver" ? "DRV" : "RDR"}-109`,
        phone: payload.phone,
        name:
          payload.name ||
          (payload.role === "driver" ? "Captain Pilot" : "Alex Vance"),
        role: payload.role,
        rating: 4.95,
      },
    };
  }
}

export async function getFareEstimatesApi(
  pickupCoords: Coordinates,
  dropCoords: Coordinates,
  serviceMode: ServiceMode = "CITY_RIDE",
  parcelWeight: number = 2,
  isOutstation: boolean = false
): Promise<FareResponse> {
  try {
    const res = await fetch("/api/fares/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupCoords,
        dropCoords,
        serviceMode,
        parcelWeight,
        isOutstation,
      }),
    });
    const data = await res.json();

    // Attach full vehicle specs to each tier
    const enrichedEstimates: FareTier[] = (data.estimates || []).map((t: any) => ({
      ...t,
      specs: VEHICLE_SPEC_MAP[t.id as keyof typeof VEHICLE_SPEC_MAP] || VEHICLE_SPEC_MAP.CAB,
    }));

    return {
      distanceKm: data.distanceKm || 4.2,
      durationMin: data.durationMin || 14,
      estimates: enrichedEstimates,
    };
  } catch (err) {
    console.error("getFareEstimatesApi fallback error", err);
    return {
      distanceKm: 4.2,
      durationMin: 14,
      estimates: [
        {
          id: "BIKE",
          name: "Swift Moto Bike",
          tagline: "Beat city traffic solo with helmet included",
          serviceMode: "CITY_RIDE",
          baseFare: 1.5,
          ratePerKm: 0.85,
          ratePerMin: 0.15,
          totalFare: 5.8,
          etaMinutes: 2,
          capacity: 1,
          surgeMultiplier: 1.0,
          icon: "Bike",
          specs: VEHICLE_SPEC_MAP.BIKE,
          breakdown: {
            baseAmount: 1.5,
            distanceAmount: 3.5,
            durationAmount: 1.2,
            tollsAndStateTaxes: 0,
            parcelWeightSurcharge: 0,
            gstAndPlatformFee: 0.6,
            discount: 1.0,
            payableAmount: 5.8,
          },
        },
        {
          id: "SCOOTY",
          name: "Smart EV Scooty",
          tagline: "Eco-friendly silent electric ride with extra footdeck",
          serviceMode: "CITY_RIDE",
          baseFare: 1.8,
          ratePerKm: 0.95,
          ratePerMin: 0.18,
          totalFare: 6.9,
          etaMinutes: 3,
          capacity: 1,
          surgeMultiplier: 1.0,
          icon: "Scooter",
          specs: VEHICLE_SPEC_MAP.SCOOTY,
          breakdown: {
            baseAmount: 1.8,
            distanceAmount: 3.9,
            durationAmount: 1.6,
            tollsAndStateTaxes: 0,
            parcelWeightSurcharge: 0,
            gstAndPlatformFee: 0.6,
            discount: 1.0,
            payableAmount: 6.9,
          },
        },
        {
          id: "AUTO",
          name: "Eco Auto Rickshaw",
          tagline: "Affordable 3-wheeler city commute for up to 3 people",
          serviceMode: "CITY_RIDE",
          baseFare: 2.5,
          ratePerKm: 1.25,
          ratePerMin: 0.22,
          totalFare: 8.8,
          etaMinutes: 4,
          capacity: 3,
          surgeMultiplier: 1.0,
          icon: "Truck",
          specs: VEHICLE_SPEC_MAP.AUTO,
          breakdown: {
            baseAmount: 2.5,
            distanceAmount: 5.2,
            durationAmount: 1.8,
            tollsAndStateTaxes: 0,
            parcelWeightSurcharge: 0,
            gstAndPlatformFee: 0.8,
            discount: 1.5,
            payableAmount: 8.8,
          },
        },
        {
          id: "CAB",
          name: "Yatrik Prime Sedan",
          tagline: "Top-rated captains, premium AC sedan with generous boot",
          serviceMode: "CITY_RIDE",
          baseFare: 4.5,
          ratePerKm: 1.95,
          ratePerMin: 0.35,
          totalFare: 14.5,
          etaMinutes: 3,
          capacity: 4,
          surgeMultiplier: 1.0,
          icon: "Car",
          specs: VEHICLE_SPEC_MAP.CAB,
          breakdown: {
            baseAmount: 4.5,
            distanceAmount: 8.1,
            durationAmount: 2.9,
            tollsAndStateTaxes: 0,
            parcelWeightSurcharge: 0,
            gstAndPlatformFee: 1.0,
            discount: 2.0,
            payableAmount: 14.5,
          },
        },
        {
          id: "OUTSTATION",
          name: "Highway Cruiser SUV (Interstate)",
          tagline: "Intercity long-haul 7-seater SUV with roof carrier & toll permit pass",
          serviceMode: "OUTSTATION",
          baseFare: 25.0,
          ratePerKm: 1.65,
          ratePerMin: 0.1,
          totalFare: 165.0,
          etaMinutes: 12,
          capacity: 6,
          surgeMultiplier: 1.0,
          icon: "Car",
          specs: VEHICLE_SPEC_MAP.OUTSTATION,
          breakdown: {
            baseAmount: 25.0,
            distanceAmount: 120.0,
            durationAmount: 0,
            tollsAndStateTaxes: 18.5,
            parcelWeightSurcharge: 0,
            gstAndPlatformFee: 6.5,
            discount: 5.0,
            payableAmount: 165.0,
          },
        },
        {
          id: "PARCEL",
          name: "Express Parcel Courier",
          tagline: "Doorstep package delivery with Dual OTP (Pickup & Drop) verification",
          serviceMode: "PARCEL",
          baseFare: 3.0,
          ratePerKm: 1.1,
          ratePerMin: 0.2,
          totalFare: 7.8,
          etaMinutes: 5,
          capacity: 1,
          surgeMultiplier: 1.0,
          icon: "Package",
          specs: VEHICLE_SPEC_MAP.PARCEL,
          breakdown: {
            baseAmount: 3.0,
            distanceAmount: 4.6,
            durationAmount: 0,
            tollsAndStateTaxes: 0,
            parcelWeightSurcharge: 1.5,
            gstAndPlatformFee: 0.7,
            discount: 1.0,
            payableAmount: 7.8,
          },
        },
      ],
    };
  }
}

export async function searchPlacesApi(query: string): Promise<PlaceItem[]> {
  try {
    const res = await fetch(
      `/api/places/autocomplete?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error("searchPlacesApi error", err);
    return [];
  }
}
