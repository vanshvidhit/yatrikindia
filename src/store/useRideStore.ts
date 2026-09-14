import { create } from "zustand";
import {
  ActiveRide,
  Coordinates,
  DriverTelemetry,
  EmergencyAlertBroadcast,
  EmergencyContact,
  FareTier,
  IncomingRideOffer,
  MapLayerMode,
  OutstationDetails,
  PackageCategory,
  ParcelDetails,
  PaymentMethod,
  PlaceItem,
  RideHistoryItem,
  SafetyAlert,
  ServiceMode,
  SocketPacketLog,
  VehicleType,
} from "../types";
import { generateRoutePoints, checkGeofenceDeviation } from "../services/geoService";
import { socketService } from "../services/socketService";
import { emergencyAlertService, DEFAULT_EMERGENCY_CONTACTS } from "../services/emergencyAlertService";
import { VEHICLE_SPEC_MAP } from "../data/vehicleSpecs";

export type ViewMode =
  | "DUAL_SPLIT"
  | "RIDER_ONLY"
  | "DRIVER_ONLY"
  | "SUPER_PROMPT_GUIDE"
  | "TELEMETRY_INSPECTOR"
  | "CODEBASE_EXPLORER";

export type AppTheme = "dark" | "light";

interface RideStoreState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Global Theme (Dark / Light Mode)
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  // Dynamic Brand Name & Logo Customization
  brandName: string;
  setBrandName: (name: string) => void;

  // Map Visualization Controls
  mapLayerMode: MapLayerMode;
  setMapLayerMode: (mode: MapLayerMode) => void;

  // Service Mode Tab (City Ride vs Outstation vs Parcel Courier)
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;

  // Parcel Specific State
  parcelDetails: ParcelDetails;
  setParcelDetails: (details: Partial<ParcelDetails>) => void;

  // Outstation Specific State
  outstationDetails: OutstationDetails;
  setOutstationDetails: (details: Partial<OutstationDetails>) => void;

  // Payment & Wallet
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  walletBalance: number;
  topUpWallet: (amount: number) => void;

  // Rider State
  riderAuth: {
    isLoggedIn: boolean;
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  setRiderAuth: (auth: Partial<RideStoreState["riderAuth"]>) => void;
  logoutRider: () => void;

  riderLocation: Coordinates & { address: string };
  setRiderLocation: (loc: Coordinates & { address: string }) => void;

  pickupLocation: PlaceItem | null;
  dropLocation: PlaceItem | null;
  setPickupLocation: (place: PlaceItem | null) => void;
  setDropLocation: (place: PlaceItem | null) => void;

  selectedVehicleType: VehicleType;
  setSelectedVehicleType: (v: VehicleType) => void;

  fareTiers: FareTier[];
  setFareTiers: (tiers: FareTier[]) => void;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;

  riderActiveRide: ActiveRide | null;
  currentRide: ActiveRide | null;
  setRiderActiveRide: (ride: ActiveRide | null) => void;

  // In-Ride Comfort & AC Feedback
  updateAcFeedback: (rideId: string, feedback: string) => void;

  // Rider Ride History & Feedback
  riderRideHistory: RideHistoryItem[];
  setRiderRideHistory: (history: RideHistoryItem[]) => void;
  addRideToHistory: (
    ride: ActiveRide,
    feedback?: {
      rating?: number;
      feedbackComments?: string;
      compliments?: string[];
      acFeedback?: "CHILLED" | "COMFORTABLE" | "TOO_WARM" | "TOO_COLD" | "AC_OFF";
      tipAmount?: number;
    }
  ) => void;
  updateRideFeedback: (
    rideId: string,
    rating: number,
    feedbackComments: string,
    tipAmount: number,
    compliments?: string[]
  ) => void;

  nearbyDrivers: DriverTelemetry[];
  setNearbyDrivers: (drivers: DriverTelemetry[]) => void;

  // Driver State
  driverAuth: {
    isLoggedIn: boolean;
    id: string;
    name: string;
    phone: string;
    vehicleType: VehicleType;
    vehicleNumber: string;
    rating: number;
    isOnline: boolean;
    earningsToday: number;
    completedTrips: number;
    acceptanceRate: number;
  };
  setDriverAuth: (auth: Partial<RideStoreState["driverAuth"]>) => void;
  toggleDriverOnline: () => void;
  logoutDriver: () => void;

  driverLocation: Coordinates & { heading: number; speed: number };
  setDriverLocation: (loc: Coordinates & { heading: number; speed: number }) => void;

  incomingOffer: IncomingRideOffer | null;
  setIncomingOffer: (offer: IncomingRideOffer | null) => void;

  driverActiveRide: ActiveRide | null;
  setDriverActiveRide: (ride: ActiveRide | null) => void;

  // Navigation & Route Simulation
  activeRoutePoints: Coordinates[];
  setActiveRoutePoints: (points: Coordinates[]) => void;
  routeProgressIndex: number;
  setRouteProgressIndex: (index: number) => void;

  // Safety & SOS
  safetyAlert: SafetyAlert | null;
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  activeSOSBroadcast: EmergencyAlertBroadcast | null;
  triggerSOSAlert: (reason?: string) => Promise<void>;
  dismissSafetyAlert: () => void;

  // Debugger Packet Logs
  packetLogs: SocketPacketLog[];
  addPacketLog: (log: SocketPacketLog) => void;
  clearPacketLogs: () => void;

  // Simulation Controls
  isSimulatingTrip: boolean;
  setIsSimulatingTrip: (simulating: boolean) => void;
  simulationStep: () => void;
}

// Helper for theme persistence and DOM sync
const getInitialTheme = (): AppTheme => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rideflow_theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  }
  return "dark";
};

const applyThemeToDOM = (theme: AppTheme) => {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
    }
  }
};

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

// Default User Location: Indrapuri Sector C, Bhopal, Madhya Pradesh
const DEFAULT_RIDER_COORDS = {
  lat: 23.2517,
  lng: 77.4650,
  address: "Indrapuri Sector C, Raisen Road, Bhopal, MP 462022",
};

const DEFAULT_DRIVER_COORDS = {
  lat: 23.2530,
  lng: 77.4668,
  heading: 140,
  speed: 28,
};

const INITIAL_DROP_LOCATION: PlaceItem = {
  id: "p2",
  title: "DB City Mall & MP Nagar Zone-1",
  subtitle: "Arera Hills, MP Nagar, Bhopal, Madhya Pradesh",
  coords: { lat: 23.2332, lng: 77.4326 },
  category: "COMMERCIAL",
};

const INITIAL_ROUTE_POINTS = generateRoutePoints(
  DEFAULT_RIDER_COORDS,
  INITIAL_DROP_LOCATION.coords,
  25
);

export const DEFAULT_FARE_TIERS: FareTier[] = [
  {
    id: "AUTO",
    name: "Yatrik Auto",
    tagline: "Bajaj Compact 3-Wheeler • Doorstep meter pickup",
    serviceMode: "CITY_RIDE",
    baseFare: 30.0,
    ratePerKm: 15.0,
    ratePerMin: 1.5,
    totalFare: 80.0,
    etaMinutes: 2,
    capacity: 3,
    surgeMultiplier: 1.0,
    hasCNGCylinder: false,
    bootSpaceClearance: false,
    luggageNotice: "No heavy luggage (Soft bags only)",
    icon: "Zap",
    specs: VEHICLE_SPEC_MAP.AUTO,
    breakdown: {
      baseAmount: 30.0,
      distanceAmount: 49.5,
      durationAmount: 0,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 15.0,
      discount: 14.5,
      payableAmount: 80.0,
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
    totalFare: 135.0,
    etaMinutes: 3,
    capacity: 4,
    surgeMultiplier: 1.0,
    hasCNGCylinder: false,
    bootSpaceClearance: true,
    luggageNotice: "Compact boot (2 small soft bags)",
    icon: "Car",
    specs: VEHICLE_SPEC_MAP.GO,
    breakdown: {
      baseAmount: 50.0,
      distanceAmount: 67.2,
      durationAmount: 0,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 17.8,
      discount: 0,
      payableAmount: 135.0,
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
    totalFare: 175.0,
    etaMinutes: 4,
    capacity: 4,
    surgeMultiplier: 1.0,
    hasCNGCylinder: true,
    bootSpaceClearance: false,
    luggageNotice: "1 suitcase (60L CNG cylinder fitted in boot)",
    icon: "Car",
    specs: VEHICLE_SPEC_MAP.SEDAN,
    breakdown: {
      baseAmount: 70.0,
      distanceAmount: 81.6,
      durationAmount: 0,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 23.4,
      discount: 0,
      payableAmount: 175.0,
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
    totalFare: 260.0,
    etaMinutes: 5,
    capacity: 6,
    surgeMultiplier: 1.0,
    hasCNGCylinder: false,
    bootSpaceClearance: true,
    luggageNotice: "Full clear trunk space (3-4 large suitcases)",
    icon: "Compass",
    specs: VEHICLE_SPEC_MAP.XL,
    breakdown: {
      baseAmount: 120.0,
      distanceAmount: 105.6,
      durationAmount: 0,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 34.4,
      discount: 0,
      payableAmount: 260.0,
    },
  },
  {
    id: "BIKE",
    name: "Rapido Moto Bike",
    tagline: "Beat city traffic solo with sanitized helmet included",
    serviceMode: "CITY_RIDE",
    baseFare: 25.0,
    ratePerKm: 9.0,
    ratePerMin: 1.5,
    totalFare: 65.0,
    etaMinutes: 2,
    capacity: 1,
    surgeMultiplier: 1.0,
    hasCNGCylinder: false,
    bootSpaceClearance: false,
    luggageNotice: "Small backpack only",
    icon: "Bike",
    specs: VEHICLE_SPEC_MAP.BIKE,
    breakdown: {
      baseAmount: 25.0,
      distanceAmount: 43.2,
      durationAmount: 0,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 5.0,
      discount: 8.2,
      payableAmount: 65.0,
    },
  },
  {
    id: "SCOOTY",
    name: "Namma EV Green Scooty",
    tagline: "Eco-friendly silent electric ride with zero emissions",
    serviceMode: "CITY_RIDE",
    baseFare: 30.0,
    ratePerKm: 10.0,
    ratePerMin: 1.8,
    totalFare: 78.0,
    etaMinutes: 3,
    capacity: 1,
    surgeMultiplier: 1.0,
    icon: "Scooter",
    specs: VEHICLE_SPEC_MAP.SCOOTY,
    breakdown: {
      baseAmount: 30.0,
      distanceAmount: 48.0,
      durationAmount: 20.0,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 5.0,
      discount: 25.0,
      payableAmount: 78.0,
    },
  },
  {
    id: "OUTSTATION",
    name: "Highway Cruiser SUV",
    tagline: "Intercity spacious 6-seater cruiser with luggage carrier & fastag",
    serviceMode: "OUTSTATION",
    baseFare: 450.0,
    ratePerKm: 14.0,
    ratePerMin: 0.5,
    totalFare: 1850.0,
    etaMinutes: 6,
    capacity: 6,
    surgeMultiplier: 1.0,
    icon: "Compass",
    specs: VEHICLE_SPEC_MAP.OUTSTATION,
    breakdown: {
      baseAmount: 450.0,
      distanceAmount: 1200.0,
      durationAmount: 100.0,
      tollsAndStateTaxes: 150.0,
      parcelWeightSurcharge: 0,
      gstAndPlatformFee: 50.0,
      discount: 100.0,
      payableAmount: 1850.0,
    },
  },
  {
    id: "PARCEL",
    name: "Namma Express Courier",
    tagline: "Same-day on-demand secure doorstep parcel delivery with Dual OTP",
    serviceMode: "PARCEL",
    baseFare: 40.0,
    ratePerKm: 11.0,
    ratePerMin: 1.0,
    totalFare: 95.0,
    etaMinutes: 4,
    capacity: 1,
    surgeMultiplier: 1.0,
    icon: "Package",
    specs: VEHICLE_SPEC_MAP.PARCEL,
    breakdown: {
      baseAmount: 40.0,
      distanceAmount: 52.8,
      durationAmount: 12.2,
      tollsAndStateTaxes: 0,
      parcelWeightSurcharge: 15.0,
      gstAndPlatformFee: 10.0,
      discount: 35.0,
      payableAmount: 95.0,
    },
  },
];

export const DEFAULT_RIDER_HISTORY: RideHistoryItem[] = [
  {
    rideId: "RF-HIST-1092",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    serviceMode: "CITY_RIDE",
    vehicleType: "CAB",
    pickup: {
      address: "Indrapuri Sector C, Raisen Road, Bhopal",
      coords: { lat: 23.2517, lng: 77.4650 },
    },
    drop: {
      address: "DB City Mall & MP Nagar Zone-1, Bhopal",
      coords: { lat: 23.2332, lng: 77.4326 },
    },
    distanceKm: 5.2,
    durationMin: 18,
    estimatedFare: 165.0,
    payableAmount: 165.0,
    tipAmount: 25.0,
    totalPaid: 190.0,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    driver: {
      id: "DRV-101",
      name: "Ramesh Kumar",
      vehicleNumber: "MP-04-CB-4092",
      rating: 4.96,
    },
    rating: 5,
    feedbackComments: "Ramesh was polite and took the Raisen Road flyover smoothly. Clean AC sedan!",
    compliments: ["Smooth Driving", "Clean Car", "Fast Route"],
    ratedAt: Date.now() - 1000 * 60 * 60 * 23.5,
  },
  {
    rideId: "RF-HIST-1088",
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    serviceMode: "PARCEL",
    vehicleType: "PARCEL",
    pickup: {
      address: "Indrapuri Sector C Market, Bhopal",
      coords: { lat: 23.2517, lng: 77.4650 },
    },
    drop: {
      address: "Rani Kamlapati Railway Station (Habibganj), Bhopal",
      coords: { lat: 23.2064, lng: 77.4410 },
    },
    distanceKm: 6.4,
    durationMin: 22,
    estimatedFare: 130.0,
    payableAmount: 130.0,
    tipAmount: 20.0,
    totalPaid: 150.0,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    driver: {
      id: "DRV-204",
      name: "Suresh Meena",
      vehicleNumber: "MP-04-TR-5510",
      rating: 4.98,
    },
    rating: 5,
    feedbackComments: "Package delivered safely to station drop point with OTP verified.",
    compliments: ["Fast Delivery", "Handled With Care"],
    ratedAt: Date.now() - 1000 * 60 * 60 * 71.8,
  },
];

export const useRideStore = create<RideStoreState>((set, get) => ({
  viewMode: "DUAL_SPLIT",
  setViewMode: (mode) => set({ viewMode: mode }),

  theme: initialTheme,
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rideflow_theme", theme);
    }
    applyThemeToDOM(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") {
      localStorage.setItem("rideflow_theme", nextTheme);
    }
    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme });
  },

  brandName:
    typeof window !== "undefined"
      ? localStorage.getItem("yatrik_brand_name") || "Yatrik India"
      : "Yatrik India",
  setBrandName: (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("yatrik_brand_name", name);
      document.title = `${name} - Smart City Mobility`;
    }
    set({ brandName: name });
  },

  mapLayerMode: "DEFAULT",
  setMapLayerMode: (mode) => set({ mapLayerMode: mode }),

  serviceMode: "CITY_RIDE",
  setServiceMode: (mode) => {
    set({ serviceMode: mode });
    if (mode === "OUTSTATION") {
      set({ selectedVehicleType: "OUTSTATION" });
    } else if (mode === "PARCEL") {
      set({ selectedVehicleType: "PARCEL" });
    } else {
      set({ selectedVehicleType: "CAB" });
    }
  },

  parcelDetails: {
    category: "SMALL_BOX",
    categoryLabel: "Small Parcel (<3kg)",
    weightKg: 2.5,
    dimensions: {
      lengthCm: 25,
      widthCm: 18,
      heightCm: 12,
    },
    description: "Documents & Laptop Accessories",
    recipientName: "Deepak Sharma",
    recipientPhone: "+91 98450 67890",
    pickupOtp: "4821",
    deliveryOtp: "7914",
    isFragile: true,
    handlingInstructions: "Hand over at 4th floor security desk",
  },
  setParcelDetails: (details) =>
    set((state) => ({ parcelDetails: { ...state.parcelDetails, ...details } })),

  outstationDetails: {
    tripType: "ONE_WAY",
    destinationCity: "Sanchi Stupa / Bhimbetka Rock Shelters (48 km)",
    minDistanceKm: 48,
    tollEstimate: 80.0,
    stateTaxPermit: 0.0,
    driverAllowancePerDay: 350.0,
    departureDate: new Date().toISOString().split("T")[0],
  },
  setOutstationDetails: (details) =>
    set((state) => ({
      outstationDetails: { ...state.outstationDetails, ...details },
    })),

  paymentMethod: "UPI",
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  walletBalance: 850.0,
  topUpWallet: (amount) =>
    set((state) => ({ walletBalance: state.walletBalance + amount })),

  // Rider Auth
  riderAuth: {
    isLoggedIn: true,
    id: "RDR-8841",
    name: "Aakash Mehta",
    phone: "+91 98261 23456",
    rating: 4.98,
  },
  setRiderAuth: (auth) =>
    set((state) => ({ riderAuth: { ...state.riderAuth, ...auth } })),
  logoutRider: () =>
    set({
      riderAuth: {
        isLoggedIn: false,
        id: "",
        name: "",
        phone: "",
        rating: 5.0,
      },
      riderActiveRide: null,
    }),

  riderLocation: DEFAULT_RIDER_COORDS,
  setRiderLocation: (loc) => set({ riderLocation: loc }),

  pickupLocation: {
    id: "pickup-home",
    title: "Indrapuri Sector C",
    subtitle: "Near Raisen Road, BHEL Township, Bhopal, MP 462022",
    coords: { lat: 23.2517, lng: 77.4650 },
    category: "HOME",
  },
  dropLocation: INITIAL_DROP_LOCATION,
  setPickupLocation: (place) => {
    set({ pickupLocation: place });
    const drop = get().dropLocation;
    if (place && drop) {
      const points = generateRoutePoints(place.coords, drop.coords, 25);
      set({ activeRoutePoints: points, routeProgressIndex: 0 });
    }
  },
  setDropLocation: (place) => {
    set({ dropLocation: place });
    const pickup = get().pickupLocation;
    if (pickup && place) {
      const points = generateRoutePoints(pickup.coords, place.coords, 25);
      set({ activeRoutePoints: points, routeProgressIndex: 0 });
    }
  },

  selectedVehicleType: "CAB",
  setSelectedVehicleType: (v) => set({ selectedVehicleType: v }),

  fareTiers: DEFAULT_FARE_TIERS,
  setFareTiers: (tiers) => set({ fareTiers: tiers }),
  estimatedDistanceKm: 4.8,
  estimatedDurationMin: 16,

  riderActiveRide: null,
  currentRide: null,
  setRiderActiveRide: (ride) => set({ riderActiveRide: ride, currentRide: ride }),

  // In-Ride Comfort & AC Feedback
  updateAcFeedback: (rideId, feedback) => {
    set((state) => {
      const isTargetRider =
        state.riderActiveRide &&
        (state.riderActiveRide.rideId === rideId || (state.riderActiveRide as any).id === rideId);
      const isTargetDriver =
        state.driverActiveRide &&
        (state.driverActiveRide.rideId === rideId || (state.driverActiveRide as any).id === rideId);

      const updatedRider = isTargetRider
        ? { ...state.riderActiveRide!, acFeedback: feedback }
        : state.riderActiveRide;
      const updatedDriver = isTargetDriver
        ? { ...state.driverActiveRide!, acFeedback: feedback }
        : state.driverActiveRide;

      return {
        riderActiveRide: updatedRider,
        currentRide: updatedRider,
        driverActiveRide: updatedDriver,
      };
    });
  },

  // Rider Ride History & Feedback
  riderRideHistory: DEFAULT_RIDER_HISTORY,
  setRiderRideHistory: (history) => set({ riderRideHistory: history }),
  addRideToHistory: (ride, feedback) => {
    const tip = feedback?.tipAmount || 0;
    const fare = ride.payableAmount || ride.estimatedFare || 185.0;
    const newHistoryItem: RideHistoryItem = {
      rideId: ride.rideId || `RF-${Date.now().toString(36).toUpperCase()}`,
      timestamp: ride.completedAt || Date.now(),
      serviceMode: ride.serviceMode || "CITY_RIDE",
      vehicleType: ride.vehicleType || "CAB",
      pickup: ride.pickup,
      drop: ride.drop,
      distanceKm: ride.distanceKm || 4.8,
      durationMin: ride.durationMin || 16,
      estimatedFare: ride.estimatedFare || fare,
      payableAmount: fare,
      tipAmount: tip,
      totalPaid: Number((fare + tip).toFixed(2)),
      paymentMethod: ride.paymentMethod || "UPI",
      paymentStatus: "PAID",
      driver: {
        id: ride.driverId || ride.driverDetails?.driverId || "DRV-101",
        name: ride.driverDetails?.driverName || "Ramesh Kumar",
        vehicleNumber: ride.driverDetails?.vehicleNumber || "KA-01-MJ-4092",
        rating: ride.driverDetails?.rating || 4.95,
      },
      rating: feedback?.rating,
      feedbackComments: feedback?.feedbackComments,
      compliments: feedback?.compliments,
      acFeedback: feedback?.acFeedback,
      ratedAt: feedback?.rating ? Date.now() : undefined,
    };

    set((state) => ({
      riderRideHistory: [
        newHistoryItem,
        ...state.riderRideHistory.filter((h) => h.rideId !== newHistoryItem.rideId),
      ],
    }));
  },
  updateRideFeedback: (rideId, rating, feedbackComments, tipAmount, compliments) => {
    set((state) => {
      const updatedHistory = state.riderRideHistory.map((item) => {
        if (item.rideId === rideId) {
          const totalPaid = Number((item.payableAmount + tipAmount).toFixed(2));
          return {
            ...item,
            rating,
            feedbackComments,
            tipAmount,
            totalPaid,
            compliments: compliments || item.compliments,
            ratedAt: Date.now(),
          };
        }
        return item;
      });
      return { riderRideHistory: updatedHistory };
    });
  },

  nearbyDrivers: [],
  setNearbyDrivers: (drivers) => set({ nearbyDrivers: drivers }),

  // Driver Auth
  driverAuth: {
    isLoggedIn: true,
    id: "DRV-101",
    name: "Ramesh Kumar",
    phone: "+91 98455 45678",
    vehicleType: "CAB",
    vehicleNumber: "KA-01-MJ-4092",
    rating: 4.96,
    isOnline: true,
    earningsToday: 2450.0,
    completedTrips: 9,
    acceptanceRate: 96,
  },
  setDriverAuth: (auth) =>
    set((state) => ({ driverAuth: { ...state.driverAuth, ...auth } })),
  toggleDriverOnline: () => {
    const next = !get().driverAuth.isOnline;
    set((state) => ({
      driverAuth: { ...state.driverAuth, isOnline: next },
    }));
    const dLoc = get().driverLocation;
    socketService.updateDriverLocation({
      driverId: get().driverAuth.id,
      lat: dLoc.lat,
      lng: dLoc.lng,
      heading: dLoc.heading,
      speed: dLoc.speed,
      status: next ? "AVAILABLE" : "OFFLINE",
      vehicleType: get().driverAuth.vehicleType,
      driverName: get().driverAuth.name,
      vehicleNumber: get().driverAuth.vehicleNumber,
    });
  },
  logoutDriver: () =>
    set({
      driverAuth: {
        isLoggedIn: false,
        id: "",
        name: "",
        phone: "",
        vehicleType: "CAB",
        vehicleNumber: "",
        rating: 5.0,
        isOnline: false,
        earningsToday: 0,
        completedTrips: 0,
        acceptanceRate: 100,
      },
      driverActiveRide: null,
      incomingOffer: null,
    }),

  driverLocation: DEFAULT_DRIVER_COORDS,
  setDriverLocation: (loc) => set({ driverLocation: loc }),

  incomingOffer: null,
  setIncomingOffer: (offer) => set({ incomingOffer: offer }),

  driverActiveRide: null,
  setDriverActiveRide: (ride) => set({ driverActiveRide: ride }),

  // Navigation route & simulation
  activeRoutePoints: INITIAL_ROUTE_POINTS,
  setActiveRoutePoints: (points) => set({ activeRoutePoints: points }),
  routeProgressIndex: 0,
  setRouteProgressIndex: (index) => set({ routeProgressIndex: index }),

  // Safety & SOS
  safetyAlert: null,
  emergencyContacts: DEFAULT_EMERGENCY_CONTACTS,
  setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
  activeSOSBroadcast: null,
  triggerSOSAlert: async (reason) => {
    const ride = get().riderActiveRide || get().driverActiveRide;
    const rLoc = get().riderLocation;
    const riderAuth = get().riderAuth;
    const contacts = get().emergencyContacts;

    const broadcast = await emergencyAlertService.broadcastAlert({
      riderId: riderAuth.id || "rider-primary",
      riderName: riderAuth.name || "Aakash Mehta",
      riderPhone: riderAuth.phone || "+91 98451 23456",
      coordinates: { lat: rLoc.lat, lng: rLoc.lng },
      address: rLoc.address || "Koramangala 4th Block, 80ft Road, Bengaluru",
      reason: reason || "Emergency SOS Triggered via Hold-To-Activate",
      rideId: ride?.rideId || "RF-DIRECT",
      contacts,
    });

    const alert: SafetyAlert = {
      rideId: ride?.rideId || "RF-DIRECT",
      timestamp: Date.now(),
      currentCoords: { lat: rLoc.lat, lng: rLoc.lng },
      reason: reason || "Emergency SOS Triggered via Hold-To-Activate",
      isDeviation: false,
      emergencyContactsNotified: true,
      broadcastDetails: broadcast,
    };

    set({ safetyAlert: alert, activeSOSBroadcast: broadcast });
    socketService.triggerSOS(alert.rideId, alert.currentCoords, alert.reason);
  },
  dismissSafetyAlert: () => {
    emergencyAlertService.resolveAlert();
    set({ safetyAlert: null, activeSOSBroadcast: null });
  },

  // Logs
  packetLogs: [],
  addPacketLog: (log) =>
    set((state) => ({
      packetLogs: [log, ...state.packetLogs].slice(0, 100),
    })),
  clearPacketLogs: () => set({ packetLogs: [] }),

  // Simulation
  isSimulatingTrip: false,
  setIsSimulatingTrip: (simulating) => set({ isSimulatingTrip: simulating }),
  simulationStep: () => {
    const {
      activeRoutePoints,
      routeProgressIndex,
      driverActiveRide,
      riderActiveRide,
    } = get();
    if (!activeRoutePoints || activeRoutePoints.length === 0) return;

    if (routeProgressIndex < activeRoutePoints.length - 1) {
      const nextIndex = routeProgressIndex + 1;
      const targetPoint = activeRoutePoints[nextIndex];
      const prevPoint = activeRoutePoints[routeProgressIndex];

      const dLat = targetPoint.lat - prevPoint.lat;
      const dLng = targetPoint.lng - prevPoint.lng;
      let angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      set({
        routeProgressIndex: nextIndex,
        driverLocation: {
          lat: targetPoint.lat,
          lng: targetPoint.lng,
          heading: Math.round(angle),
          speed: 34,
        },
      });

      const deviation = checkGeofenceDeviation(
        targetPoint,
        activeRoutePoints,
        300
      );
      if (deviation.isDeviated && !get().safetyAlert) {
        set({
          safetyAlert: {
            rideId:
              (riderActiveRide || driverActiveRide)?.rideId || "RF-SAMPLE",
            timestamp: Date.now(),
            currentCoords: targetPoint,
            reason: `Route Deviation Detected (${deviation.minDistanceMeters}m off designated path)`,
            isDeviation: true,
            emergencyContactsNotified: true,
          },
        });
      }

      const dAuth = get().driverAuth;
      socketService.updateDriverLocation({
        driverId: dAuth.id,
        lat: targetPoint.lat,
        lng: targetPoint.lng,
        heading: Math.round(angle),
        speed: 34,
        status: "IN_TRIP",
      });
    } else {
      set({ isSimulatingTrip: false });
    }
  },
}));
