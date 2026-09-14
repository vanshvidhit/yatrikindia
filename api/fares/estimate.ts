export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { pickupCoords, dropCoords, serviceMode = "CITY_RIDE" } = req.body || {};

  let rawDistanceKm = 4.5;
  if (pickupCoords && dropCoords) {
    const dLat = (dropCoords.lat - pickupCoords.lat) * 111;
    const dLng = (dropCoords.lng - pickupCoords.lng) * 102;
    rawDistanceKm = Math.max(1.2, Math.sqrt(dLat * dLat + dLng * dLng) * 1.25);
  }

  const durationMin = Math.max(5, Math.round(rawDistanceKm * 2.8));

  const estimates = [
    {
      id: "AUTO",
      name: "Yatrik Auto",
      tagline: "Bajaj Compact 3-Wheeler • Doorstep meter pickup",
      serviceMode: "CITY_RIDE",
      baseFare: 30.0,
      ratePerKm: 15.0,
      ratePerMin: 1.5,
      totalFare: parseFloat((30.0 + Math.max(0, rawDistanceKm - 1.5) * 15.0 + 10.0).toFixed(2)),
      etaMinutes: 2,
      capacity: 3,
      surgeMultiplier: 1.0,
      hasCNGCylinder: false,
      bootSpaceClearance: false,
      luggageNotice: "No heavy luggage (Soft bags only)",
      icon: "Zap",
      breakdown: {
        baseAmount: 30.0,
        distanceAmount: parseFloat((Math.max(0, rawDistanceKm - 1.5) * 15.0).toFixed(2)),
        durationAmount: 0,
        tollsAndStateTaxes: 0,
        parcelWeightSurcharge: 0,
        gstAndPlatformFee: 15.0,
        discount: 5.0,
        payableAmount: parseFloat((30.0 + Math.max(0, rawDistanceKm - 1.5) * 15.0 + 10.0).toFixed(2)),
      },
    },
    {
      id: "GO",
      name: "Yatrik Go (Hatchback)",
      tagline: "Maruti WagonR, Tata Tiago • Compact City Hatchback",
      serviceMode: "CITY_RIDE",
      baseFare: 50.0,
      ratePerKm: 14.0,
      ratePerMin: 2.0,
      totalFare: parseFloat((50.0 + rawDistanceKm * 14.0 + durationMin * 2.0).toFixed(2)),
      etaMinutes: 3,
      capacity: 4,
      surgeMultiplier: 1.0,
      hasCNGCylinder: false,
      bootSpaceClearance: true,
      luggageNotice: "Compact boot (2 small soft bags)",
      icon: "Car",
      breakdown: {
        baseAmount: 50.0,
        distanceAmount: parseFloat((rawDistanceKm * 14.0).toFixed(2)),
        durationAmount: parseFloat((durationMin * 2.0).toFixed(2)),
        tollsAndStateTaxes: 0,
        parcelWeightSurcharge: 0,
        gstAndPlatformFee: 17.8,
        discount: 0,
        payableAmount: parseFloat((50.0 + rawDistanceKm * 14.0 + durationMin * 2.0).toFixed(2)),
      },
    },
    {
      id: "SEDAN",
      name: "Yatrik Sedan (Sub-4m)",
      tagline: "Maruti Dzire Tour S, Hyundai Aura • CNG fitted boot",
      serviceMode: "CITY_RIDE",
      baseFare: 70.0,
      ratePerKm: 17.0,
      ratePerMin: 2.5,
      totalFare: parseFloat((70.0 + rawDistanceKm * 17.0 + durationMin * 2.5).toFixed(2)),
      etaMinutes: 4,
      capacity: 4,
      surgeMultiplier: 1.0,
      hasCNGCylinder: true,
      bootSpaceClearance: false,
      luggageNotice: "1 suitcase (60L CNG cylinder fitted in boot)",
      icon: "Car",
      breakdown: {
        baseAmount: 70.0,
        distanceAmount: parseFloat((rawDistanceKm * 17.0).toFixed(2)),
        durationAmount: parseFloat((durationMin * 2.5).toFixed(2)),
        tollsAndStateTaxes: 0,
        parcelWeightSurcharge: 0,
        gstAndPlatformFee: 23.4,
        discount: 0,
        payableAmount: parseFloat((70.0 + rawDistanceKm * 17.0 + durationMin * 2.5).toFixed(2)),
      },
    },
    {
      id: "XL",
      name: "Yatrik XL (6-Seater SUV)",
      tagline: "Maruti Ertiga, Kia Carens • Full luggage clearance",
      serviceMode: "CITY_RIDE",
      baseFare: 120.0,
      ratePerKm: 22.0,
      ratePerMin: 3.5,
      totalFare: parseFloat((120.0 + rawDistanceKm * 22.0 + durationMin * 3.5).toFixed(2)),
      etaMinutes: 5,
      capacity: 6,
      surgeMultiplier: 1.0,
      hasCNGCylinder: false,
      bootSpaceClearance: true,
      luggageNotice: "Clear boot (3-4 suitcases, no cylinder)",
      icon: "Car",
      breakdown: {
        baseAmount: 120.0,
        distanceAmount: parseFloat((rawDistanceKm * 22.0).toFixed(2)),
        durationAmount: parseFloat((durationMin * 3.5).toFixed(2)),
        tollsAndStateTaxes: 0,
        parcelWeightSurcharge: 0,
        gstAndPlatformFee: 32.0,
        discount: 0,
        payableAmount: parseFloat((120.0 + rawDistanceKm * 22.0 + durationMin * 3.5).toFixed(2)),
      },
    },
  ];

  return res.status(200).json({
    distanceKm: parseFloat(rawDistanceKm.toFixed(2)),
    durationMin,
    estimates,
  });
}
