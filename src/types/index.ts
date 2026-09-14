export interface Coordinates {
  lat: number;
  lng: number;
}

export type VehicleType =
  | "AUTO"
  | "GO"
  | "SEDAN"
  | "XL"
  | "BIKE"
  | "SCOOTY"
  | "CAB"
  | "OUTSTATION"
  | "PARCEL";

export type ServiceMode = "CITY_RIDE" | "OUTSTATION" | "PARCEL";

export type MapLayerMode =
  | "DEFAULT"
  | "STANDARD"
  | "SATELLITE"
  | "TERRAIN"
  | "TRAFFIC"
  | "TRAFFIC_FLOW"
  | "ISOMETRIC_3D"
  | "DARK_NIGHT"
  | "STREET_VIEW";

export type PaymentMethod = "WALLET" | "UPI" | "UPI_QR" | "CARD" | "CASH";

export type PackageCategory = "DOCUMENT" | "SMALL_BOX" | "MEDIUM_BOX" | "HEAVY_CARGO";

export type RideStatus =
  | "IDLE"
  | "SEARCHING"
  | "DRIVER_OFFERED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "ONGOING"
  | "PARCEL_PICKED"
  | "COMPLETED"
  | "CANCELLED";

export interface DriverTelemetry {
  driverId: string;
  driverName: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  phone: string;
  rating: number;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: "OFFLINE" | "AVAILABLE" | "EN_ROUTE_PICKUP" | "IN_TRIP";
  distanceKm?: number;
  socketId?: string;
  lastUpdated: number;
}

export interface PlaceItem {
  id: string;
  title: string;
  subtitle: string;
  coords: Coordinates;
  category?: "AIRPORT" | "TECH_HUB" | "TRANSIT" | "PARK" | "TOURIST" | "FOOD" | "HOME" | "WORK" | "OUTSTATION" | "COMMERCIAL" | "HEALTH" | "EDUCATION";
  interstateCity?: string;
}

export interface VehicleSpecs {
  type: VehicleType;
  displayName: string;
  categoryName: string;
  tagline: string;
  seatingCapacity: number;
  bootCapacity: string;
  hasCNGCylinder?: boolean;
  bootSpaceClearance?: boolean;
  engineType: string;
  topSpeed: string;
  colorHex: string;
  accentColor: string;
}

export interface FareTier {
  id: VehicleType;
  name: string;
  tagline: string;
  serviceMode: ServiceMode;
  baseFare: number;
  ratePerKm: number;
  ratePerMin: number;
  totalFare: number;
  etaMinutes: number;
  capacity: number;
  surgeMultiplier: number;
  hasCNGCylinder?: boolean;
  bootSpaceClearance?: boolean;
  luggageNotice?: string;
  icon: string;
  specs: VehicleSpecs;
  // Breakdown
  breakdown: {
    baseAmount: number;
    distanceAmount: number;
    durationAmount: number;
    tollsAndStateTaxes: number;
    parcelWeightSurcharge: number;
    gstAndPlatformFee: number;
    discount: number;
    payableAmount: number;
  };
}

export interface ParcelDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ParcelDetails {
  category: PackageCategory;
  categoryLabel: string;
  weightKg: number;
  dimensions?: ParcelDimensions;
  description: string;
  recipientName: string;
  recipientPhone: string;
  pickupOtp: string;
  deliveryOtp: string;
  isFragile: boolean;
  handlingInstructions?: string;
}

export interface OutstationDetails {
  tripType: "ONE_WAY" | "ROUND_TRIP";
  destinationCity: string;
  minDistanceKm: number;
  tollEstimate: number;
  stateTaxPermit: number;
  driverAllowancePerDay: number;
  departureDate: string;
  returnDate?: string;
}

export interface PassengerBookingDetails {
  isForOther: boolean;
  passengerName: string;
  passengerPhone: string;
  relationship?: "PARENT" | "FRIEND" | "SPOUSE" | "CHILD" | "COLLEAGUE" | "OTHER";
}

export interface RidePreferences {
  acMode: "COOL_MAX" | "COMFORT_24" | "FRESH_AIR";
  conversation: "QUIET" | "FRIENDLY" | "MUSIC";
  luggage: "NONE" | "LIGHT" | "HEAVY_BOOT";
  routePreference: "FASTEST_TOLLS" | "AVOID_TOLLS";
  driverLanguage?: "HINDI" | "ENGLISH" | "LOCAL" | "ANY";
}

export interface ActiveRide {
  rideId: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  serviceMode: ServiceMode;
  pickup: {
    address: string;
    coords: Coordinates;
  };
  drop: {
    address: string;
    coords: Coordinates;
  };
  vehicleType: VehicleType;
  distanceKm: number;
  durationMin: number;
  estimatedFare: number;
  payableAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDING" | "PAID";
  otp: string; // Passenger OTP or Pickup OTP
  deliveryOtp?: string; // Receiver OTP for parcels
  status: RideStatus;
  category?: string;
  acFeedback?: string;
  ridePreferences?: RidePreferences;
  driverId?: string;
  driverDetails?: Partial<DriverTelemetry>;
  parcelDetails?: ParcelDetails;
  outstationDetails?: OutstationDetails;
  passengerDetails?: PassengerBookingDetails;
  pickupLandmark?: string;
  driverTip?: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface IncomingRideOffer {
  rideId: string;
  riderName: string;
  serviceMode: ServiceMode;
  pickup: { address: string; coords: Coordinates };
  drop: { address: string; coords: Coordinates };
  dropArea?: string; // Decoupled Destination Masking as per Indian spec
  distanceKm: number;
  durationMin: number;
  fare: number;
  payableAmount: number;
  vehicleType: VehicleType;
  timeoutSeconds: number;
  parcelDetails?: ParcelDetails;
  outstationDetails?: OutstationDetails;
  passengerDetails?: PassengerBookingDetails;
  pickupLandmark?: string;
  driverTip?: number;
}

export interface SocketPacketLog {
  id: string;
  timestamp: string;
  direction: "INBOUND" | "OUTBOUND";
  eventName: string;
  payload: any;
  latencyMs?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  notifyOnSOS: boolean;
}

export interface EmergencyAlertLog {
  id: string;
  timestamp: number;
  channel: "SMS" | "DISPATCH" | "POLICE_API" | "GPS_BEACON";
  recipient: string;
  status: "QUEUED" | "SENT" | "DELIVERED";
  message: string;
}

export interface EmergencyAlertBroadcast {
  alertId: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  coordinates: Coordinates;
  address?: string;
  timestamp: number;
  googleMapsUrl: string;
  contactsNotified: EmergencyContact[];
  logs: EmergencyAlertLog[];
  status: "TRIGGERED" | "BROADCASTING" | "RESOLVED";
  rideId?: string;
}

export interface RideHistoryItem {
  rideId: string;
  timestamp: number;
  serviceMode: ServiceMode;
  vehicleType: VehicleType;
  pickup: {
    address: string;
    coords: Coordinates;
  };
  drop: {
    address: string;
    coords: Coordinates;
  };
  distanceKm: number;
  durationMin: number;
  estimatedFare: number;
  payableAmount: number;
  tipAmount: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "PAID";
  driver: {
    id: string;
    name: string;
    vehicleNumber: string;
    rating: number;
  };
  rating?: number; // 1 to 5 stars
  feedbackComments?: string; // written review comments
  compliments?: string[]; // e.g. ["Smooth Driving", "Clean Car"]
  acFeedback?: "CHILLED" | "COMFORTABLE" | "TOO_WARM" | "TOO_COLD" | "AC_OFF"; // Only for car rides
  ratedAt?: number;
}

export interface SafetyAlert {
  rideId: string;
  timestamp: number;
  currentCoords: Coordinates;
  reason: string;
  isDeviation: boolean;
  emergencyContactsNotified: boolean;
  broadcastDetails?: EmergencyAlertBroadcast;
}

export interface TrafficSegment {
  id: string;
  startPoint: Coordinates;
  endPoint: Coordinates;
  severity: "LOW" | "MODERATE" | "HEAVY" | "GRIDLOCK";
  color: string;
  delayMin: number;
  roadName: string;
}
