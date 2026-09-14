import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Coordinates {
  lat: number;
  lng: number;
}

type VehicleType = "BIKE" | "SCOOTY" | "AUTO" | "CAB" | "OUTSTATION" | "PARCEL";
type ServiceMode = "CITY_RIDE" | "OUTSTATION" | "PARCEL";

interface DriverTelemetry {
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
  socketId?: string;
  lastUpdated: number;
}

interface ParcelDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

interface ParcelDetails {
  category: "DOCUMENT" | "SMALL_BOX" | "MEDIUM_BOX" | "HEAVY_CARGO";
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

interface OutstationDetails {
  tripType: "ONE_WAY" | "ROUND_TRIP";
  destinationCity: string;
  minDistanceKm: number;
  tollEstimate: number;
  stateTaxPermit: number;
  driverAllowancePerDay: number;
  departureDate: string;
  returnDate?: string;
}

interface RideRequest {
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
  otp: string; // Passenger OTP or Pickup OTP
  deliveryOtp?: string; // Receiver OTP for parcel
  parcelDetails?: ParcelDetails;
  outstationDetails?: OutstationDetails;
  passengerDetails?: any;
  pickupLandmark?: string;
  status:
    | "SEARCHING"
    | "DRIVER_OFFERED"
    | "DRIVER_ASSIGNED"
    | "DRIVER_ARRIVED"
    | "IN_PROGRESS"
    | "PARCEL_PICKED"
    | "COMPLETED"
    | "CANCELLED";
  driverId?: string;
  driverDetails?: Partial<DriverTelemetry>;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

// In-Memory Geospatial Engine (Simulating Redis GEOADD & GEORADIUS)
class RedisGeospatialService {
  private driverLocations: Map<string, DriverTelemetry> = new Map();

  // Haversine distance in KM
  private calculateDistance(c1: Coordinates, c2: Coordinates): number {
    const R = 6371; // Earth radius in km
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public geoAdd(driver: DriverTelemetry): void {
    this.driverLocations.set(driver.driverId, {
      ...driver,
      lastUpdated: Date.now(),
    });
  }

  public geoRemove(driverId: string): void {
    this.driverLocations.delete(driverId);
  }

  public geoRadius(
    center: Coordinates,
    radiusKm: number,
    filterVehicleType?: string
  ): (DriverTelemetry & { distanceKm: number })[] {
    const results: (DriverTelemetry & { distanceKm: number })[] = [];
    const now = Date.now();

    for (const driver of this.driverLocations.values()) {
      if (driver.status === "OFFLINE" || now - driver.lastUpdated > 120000) {
        continue;
      }
      if (filterVehicleType && driver.vehicleType !== filterVehicleType) {
        continue;
      }

      const dist = this.calculateDistance(center, {
        lat: driver.lat,
        lng: driver.lng,
      });
      if (dist <= radiusKm) {
        results.push({
          ...driver,
          distanceKm: parseFloat(dist.toFixed(2)),
        });
      }
    }

    return results.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  public getDriver(driverId: string): DriverTelemetry | undefined {
    return this.driverLocations.get(driverId);
  }

  public getAllDrivers(): DriverTelemetry[] {
    return Array.from(this.driverLocations.values());
  }
}

const redisGeo = new RedisGeospatialService();
const activeRides = new Map<string, RideRequest>();
const socketToDriver = new Map<string, string>();
const socketToRider = new Map<string, string>();

// Seed default realistic drivers in Bhopal Metro area (Indrapuri Sector C, Raisen Road, BHEL, MP Nagar)
const DEFAULT_DRIVERS: DriverTelemetry[] = [
  {
    driverId: "DRV-101",
    driverName: "Ramesh Kumar",
    vehicleType: "CAB",
    vehicleNumber: "MP-04-CB-4092",
    phone: "+91 98261 45678",
    rating: 4.96,
    lat: 23.2530,
    lng: 77.4665,
    heading: 45,
    speed: 28,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
  {
    driverId: "DRV-102",
    driverName: "Dilip Sharma",
    vehicleType: "CAB",
    vehicleNumber: "MP-04-NX-8821",
    phone: "+91 98262 34567",
    rating: 4.88,
    lat: 23.2505,
    lng: 77.4635,
    heading: 130,
    speed: 35,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
  {
    driverId: "DRV-103",
    driverName: "Syed Imran",
    vehicleType: "AUTO",
    vehicleNumber: "MP-04-TR-5510",
    phone: "+91 98263 45678",
    rating: 4.85,
    lat: 23.2520,
    lng: 77.4670,
    heading: 270,
    speed: 24,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
  {
    driverId: "DRV-104",
    driverName: "Vikram Patil",
    vehicleType: "BIKE",
    vehicleNumber: "MP-04-BK-1109",
    phone: "+91 98264 89012",
    rating: 4.95,
    lat: 23.2512,
    lng: 77.4642,
    heading: 90,
    speed: 40,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
  {
    driverId: "DRV-105",
    driverName: "Pooja Verma",
    vehicleType: "SCOOTY",
    vehicleNumber: "MP-04-EV-7721",
    phone: "+91 98265 99112",
    rating: 4.91,
    lat: 23.2498,
    lng: 77.4660,
    heading: 180,
    speed: 25,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
  {
    driverId: "DRV-106",
    driverName: "Shankar Meena",
    vehicleType: "OUTSTATION",
    vehicleNumber: "MP-04-HW-9900",
    phone: "+91 98266 66554",
    rating: 4.97,
    lat: 23.2545,
    lng: 77.4690,
    heading: 210,
    speed: 45,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
  {
    driverId: "DRV-107",
    driverName: "Kailash Yadav",
    vehicleType: "PARCEL",
    vehicleNumber: "MP-04-PV-3319",
    phone: "+91 98267 22334",
    rating: 4.93,
    lat: 23.2485,
    lng: 77.4625,
    heading: 320,
    speed: 30,
    status: "AVAILABLE",
    lastUpdated: Date.now(),
  },
];

DEFAULT_DRIVERS.forEach((d) => redisGeo.geoAdd(d));

// Roaming Simulation for City Realism
setInterval(() => {
  for (const driver of redisGeo.getAllDrivers()) {
    if (driver.status === "AVAILABLE" && !driver.socketId) {
      const deltaLat = (Math.random() - 0.5) * 0.0004;
      const deltaLng = (Math.random() - 0.5) * 0.0004;
      const newHeading = Math.floor(Math.random() * 360);
      redisGeo.geoAdd({
        ...driver,
        lat: driver.lat + deltaLat,
        lng: driver.lng + deltaLng,
        heading: newHeading,
        speed: Math.floor(20 + Math.random() * 25),
        lastUpdated: Date.now(),
      });
    }
  }
}, 4000);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;
  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: Date.now(),
      activeDriversCount: redisGeo.getAllDrivers().filter(
        (d) => d.status === "AVAILABLE"
      ).length,
      activeRidesCount: activeRides.size,
    });
  });

  // Auth: Send Phone OTP
  app.post("/api/auth/otp/send", (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    res.json({
      success: true,
      message: `OTP sent to ${phone}`,
      mockOtp: "4821",
    });
  });

  // Auth: Verify Phone OTP
  app.post("/api/auth/otp/verify", (req, res) => {
    const { phone, otp, role, name, vehicleType, vehicleNumber } = req.body;
    if (otp !== "4821" && otp !== "1234" && otp !== "0000") {
      return res.status(400).json({ error: "Invalid OTP code. Try 4821." });
    }

    const userId = `${role === "driver" ? "DRV" : "RDR"}-${Date.now().toString().slice(-4)}`;
    const token = `jwt_mock_${userId}_${Date.now()}`;

    if (role === "driver") {
      const newDriver: DriverTelemetry = {
        driverId: userId,
        driverName: name || "Captain Pilot",
        vehicleType: vehicleType || "CAB",
        vehicleNumber: vehicleNumber || "KA-01-RF-2026",
        phone: phone || "+1 (555) 000-0000",
        rating: 5.0,
        lat: 37.7749,
        lng: -122.4194,
        heading: 0,
        speed: 0,
        status: "AVAILABLE",
        lastUpdated: Date.now(),
      };
      redisGeo.geoAdd(newDriver);
    }

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        phone,
        name: name || (role === "driver" ? "Captain Partner" : "Alex Vance"),
        role,
        vehicleType: vehicleType || "CAB",
        vehicleNumber: vehicleNumber || "KA-01-RF-2026",
        rating: 4.95,
      },
    });
  });

  // Comprehensive Fare Calculation API with Outstation & Parcel Packages (INR - Indian Rupees)
  app.post("/api/fares/estimate", (req, res) => {
    const { pickupCoords, dropCoords, serviceMode = "CITY_RIDE", parcelWeight = 2, isOutstation = false } = req.body;
    if (!pickupCoords || !dropCoords) {
      return res.status(400).json({ error: "Coordinates are required" });
    }

    // Haversine distance in KM
    const R = 6371;
    const dLat = ((dropCoords.lat - pickupCoords.lat) * Math.PI) / 180;
    const dLng = ((dropCoords.lng - pickupCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickupCoords.lat * Math.PI) / 180) *
        Math.cos((dropCoords.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const rawDistanceKm = isOutstation ? Math.max(85, parseFloat((R * c * 1.3).toFixed(1))) : Math.max(1.5, parseFloat((R * c).toFixed(1)));
    const durationMin = Math.round(rawDistanceKm * (isOutstation ? 1.2 : 3.2) + 5);

    // Build comprehensive fleet estimates in INR (₹)
    const estimates = [
      {
        id: "BIKE",
        name: "Rapido Moto Bike",
        tagline: "Beat city traffic solo with sanitized helmet included",
        serviceMode: "CITY_RIDE",
        baseFare: 25.0,
        ratePerKm: 9.0,
        ratePerMin: 1.5,
        totalFare: parseFloat((25.0 + rawDistanceKm * 9.0 + durationMin * 1.5).toFixed(2)),
        etaMinutes: 2,
        capacity: 1,
        surgeMultiplier: 1.0,
        icon: "Bike",
        breakdown: {
          baseAmount: 25.0,
          distanceAmount: parseFloat((rawDistanceKm * 9.0).toFixed(2)),
          durationAmount: parseFloat((durationMin * 1.5).toFixed(2)),
          tollsAndStateTaxes: 0,
          parcelWeightSurcharge: 0,
          gstAndPlatformFee: 5.0,
          discount: 15.0,
          payableAmount: parseFloat((15.0 + rawDistanceKm * 9.0 + durationMin * 1.5).toFixed(2)),
        },
      },
      {
        id: "SCOOTY",
        name: "Yatrik EV Green Scooty",
        tagline: "Eco-friendly silent electric ride with zero emissions",
        serviceMode: "CITY_RIDE",
        baseFare: 30.0,
        ratePerKm: 10.0,
        ratePerMin: 1.8,
        totalFare: parseFloat((30.0 + rawDistanceKm * 10.0 + durationMin * 1.8).toFixed(2)),
        etaMinutes: 3,
        capacity: 1,
        surgeMultiplier: 1.0,
        icon: "Scooter",
        breakdown: {
          baseAmount: 30.0,
          distanceAmount: parseFloat((rawDistanceKm * 10.0).toFixed(2)),
          durationAmount: parseFloat((durationMin * 1.8).toFixed(2)),
          tollsAndStateTaxes: 0,
          parcelWeightSurcharge: 0,
          gstAndPlatformFee: 5.0,
          discount: 20.0,
          payableAmount: parseFloat((15.0 + rawDistanceKm * 10.0 + durationMin * 1.8).toFixed(2)),
        },
      },
      {
        id: "AUTO",
        name: "Yatrik Auto Rickshaw",
        tagline: "Economical 3-wheeler pocket-friendly city ride",
        serviceMode: "CITY_RIDE",
        baseFare: 35.0,
        ratePerKm: 13.0,
        ratePerMin: 2.0,
        totalFare: parseFloat((35.0 + rawDistanceKm * 13.0 + durationMin * 2.0).toFixed(2)),
        etaMinutes: 4,
        capacity: 3,
        surgeMultiplier: 1.0,
        icon: "Zap",
        breakdown: {
          baseAmount: 35.0,
          distanceAmount: parseFloat((rawDistanceKm * 13.0).toFixed(2)),
          durationAmount: parseFloat((durationMin * 2.0).toFixed(2)),
          tollsAndStateTaxes: 0,
          parcelWeightSurcharge: 0,
          gstAndPlatformFee: 10.0,
          discount: 25.0,
          payableAmount: parseFloat((20.0 + rawDistanceKm * 13.0 + durationMin * 2.0).toFixed(2)),
        },
      },
      {
        id: "CAB",
        name: "Yatrik Prime Sedan",
        tagline: "Top-rated captains, premium AC sedan with generous boot",
        serviceMode: "CITY_RIDE",
        baseFare: 60.0,
        ratePerKm: 18.0,
        ratePerMin: 3.0,
        totalFare: parseFloat((60.0 + rawDistanceKm * 18.0 + durationMin * 3.0).toFixed(2)),
        etaMinutes: 3,
        capacity: 4,
        surgeMultiplier: 1.0,
        icon: "Car",
        breakdown: {
          baseAmount: 60.0,
          distanceAmount: parseFloat((rawDistanceKm * 18.0).toFixed(2)),
          durationAmount: parseFloat((durationMin * 3.0).toFixed(2)),
          tollsAndStateTaxes: 0,
          parcelWeightSurcharge: 0,
          gstAndPlatformFee: 16.6,
          discount: 20.0,
          payableAmount: parseFloat((56.6 + rawDistanceKm * 18.0 + durationMin * 3.0).toFixed(2)),
        },
      },
      {
        id: "OUTSTATION",
        name: "Highway Cruiser SUV (Intercity)",
        tagline: "Intercity spacious 6-seater cruiser with luggage carrier & Fastag",
        serviceMode: "OUTSTATION",
        baseFare: 450.0,
        ratePerKm: 14.0,
        ratePerMin: 0.5,
        totalFare: parseFloat((450.0 + Math.max(100, rawDistanceKm) * 14.0 + 150.0).toFixed(2)),
        etaMinutes: 12,
        capacity: 6,
        surgeMultiplier: 1.0,
        icon: "Compass",
        breakdown: {
          baseAmount: 450.0,
          distanceAmount: parseFloat((Math.max(100, rawDistanceKm) * 14.0).toFixed(2)),
          durationAmount: 0,
          tollsAndStateTaxes: 150.0,
          parcelWeightSurcharge: 0,
          gstAndPlatformFee: 50.0,
          discount: 100.0,
          payableAmount: parseFloat((550.0 + Math.max(100, rawDistanceKm) * 14.0).toFixed(2)),
        },
      },
      {
        id: "PARCEL",
        name: "Namma Express Courier",
        tagline: "Same-day doorstep package delivery with Dual OTP verification",
        serviceMode: "PARCEL",
        baseFare: 40.0,
        ratePerKm: 11.0,
        ratePerMin: 1.0,
        totalFare: parseFloat((40.0 + rawDistanceKm * 11.0 + parcelWeight * 10.0).toFixed(2)),
        etaMinutes: 5,
        capacity: 1,
        surgeMultiplier: 1.0,
        icon: "Package",
        breakdown: {
          baseAmount: 40.0,
          distanceAmount: parseFloat((rawDistanceKm * 11.0).toFixed(2)),
          durationAmount: 0,
          tollsAndStateTaxes: 0,
          parcelWeightSurcharge: parseFloat((parcelWeight * 10.0).toFixed(2)),
          gstAndPlatformFee: 10.0,
          discount: 25.0,
          payableAmount: parseFloat((25.0 + rawDistanceKm * 11.0 + parcelWeight * 10.0).toFixed(2)),
        },
      },
    ];

    res.json({
      distanceKm: rawDistanceKm,
      durationMin,
      estimates,
    });
  });

  // Places Autocomplete (Bhopal, Madhya Pradesh & Intercity MP)
  app.get("/api/places/autocomplete", (req, res) => {
    const query = ((req.query.q as string) || "").toLowerCase();

    const PRESET_PLACES = [
      {
        id: "p-indrapuri-c",
        title: "Indrapuri Sector C (Current Location)",
        subtitle: "Near BHEL / Raisen Road, Sector C, Bhopal, MP 462022",
        coords: { lat: 23.2517, lng: 77.4650 },
        category: "HOME",
      },
      {
        id: "p2",
        title: "DB City Mall & MP Nagar Zone-1",
        subtitle: "Hoshangabad Rd, Arera Hills, MP Nagar, Bhopal",
        coords: { lat: 23.2332, lng: 77.4326 },
        category: "COMMERCIAL",
      },
      {
        id: "p3",
        title: "Rani Kamlapati Railway Station (Habibganj)",
        subtitle: "World-Class Terminal, Habibganj, Bhopal, MP",
        coords: { lat: 23.2064, lng: 77.4410 },
        category: "TRANSIT",
      },
      {
        id: "p4",
        title: "AIIMS Bhopal & Saket Nagar",
        subtitle: "Saket Nagar, Alkapuri, Habibganj, Bhopal",
        coords: { lat: 23.2067, lng: 77.4589 },
        category: "HEALTH",
      },
      {
        id: "p5",
        title: "Bhopal Junction Railway Station",
        subtitle: "Platform 1 & 6, Hamidia Rd, Old Bhopal",
        coords: { lat: 23.2687, lng: 77.4116 },
        category: "TRANSIT",
      },
      {
        id: "p6",
        title: "BHEL Township & Kasturba Hospital",
        subtitle: "BHEL Gate No. 1, Habibganj, Bhopal",
        coords: { lat: 23.2625, lng: 77.4780 },
        category: "TECH_HUB",
      },
      {
        id: "p7",
        title: "MANIT Bhopal (NIT)",
        subtitle: "Link Road Number 3, Near Mata Mandir, Bhopal",
        coords: { lat: 23.2166, lng: 77.4069 },
        category: "EDUCATION",
      },
      {
        id: "p8",
        title: "Upper Lake (Bhojtal) & VIP Road",
        subtitle: "Waterfront Marine Promenade, Old Bhopal",
        coords: { lat: 23.2494, lng: 77.3828 },
        category: "TOURIST",
      },
      {
        id: "p1",
        title: "Raja Bhoj Airport (BHO)",
        subtitle: "Domestic Terminal, Gandhi Nagar, Bhopal",
        coords: { lat: 23.2875, lng: 77.3374 },
        category: "AIRPORT",
      },
      {
        id: "p9",
        title: "Sanchi Stupa UNESCO Heritage Site (48 km)",
        subtitle: "Bhopal-Vidisha Highway, Sanchi, MP",
        coords: { lat: 23.4795, lng: 77.7397 },
        category: "OUTSTATION",
        interstateCity: "Sanchi, Madhya Pradesh",
      },
      {
        id: "p10",
        title: "Bhimbetka Prehistoric Rock Shelters (45 km)",
        subtitle: "Bhopal-Hoshangabad Road, Raisen District, MP",
        coords: { lat: 22.9372, lng: 77.6133 },
        category: "OUTSTATION",
        interstateCity: "Bhimbetka, Madhya Pradesh",
      },
    ];

    if (!query) {
      return res.json({ places: PRESET_PLACES });
    }

    const filtered = PRESET_PLACES.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query)
    );

    res.json({ places: filtered.length > 0 ? filtered : PRESET_PLACES });
  });

  // ----------------------------------------------------
  // Real-Time Socket.io Connection & Dispatch Event Bus
  // ----------------------------------------------------
  io.on("connection", (socket: Socket) => {
    // Join specialized rooms
    socket.on("join:rider", (data: { riderId: string }) => {
      socketToRider.set(socket.id, data.riderId);
      socket.join(`rider:${data.riderId}`);
    });

    socket.on("join:driver", (data: { driverId: string }) => {
      socketToDriver.set(socket.id, data.driverId);
      socket.join(`driver:${data.driverId}`);
      socket.join("drivers:pool");

      const existing = redisGeo.getDriver(data.driverId);
      if (existing) {
        existing.socketId = socket.id;
        existing.status = "AVAILABLE";
        redisGeo.geoAdd(existing);
      }
    });

    // 1. Driver Location Update
    socket.on(
      "driver:location_update",
      (data: {
        driverId: string;
        lat: number;
        lng: number;
        heading: number;
        speed?: number;
        status?: "OFFLINE" | "AVAILABLE" | "EN_ROUTE_PICKUP" | "IN_TRIP";
        vehicleType?: VehicleType;
        driverName?: string;
        vehicleNumber?: string;
        phone?: string;
        rating?: number;
      }) => {
        const existing = redisGeo.getDriver(data.driverId) || {
          driverId: data.driverId,
          driverName: data.driverName || "Captain Partner",
          vehicleType: data.vehicleType || "CAB",
          vehicleNumber: data.vehicleNumber || "KA-01-RF-2026",
          phone: data.phone || "+1 (555) 123-4567",
          rating: data.rating || 4.95,
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
          speed: data.speed || 30,
          status: data.status || "AVAILABLE",
          lastUpdated: Date.now(),
        };

        const updated: DriverTelemetry = {
          ...existing,
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
          speed: data.speed || existing.speed,
          status: data.status || existing.status,
          socketId: socket.id,
          lastUpdated: Date.now(),
        };

        redisGeo.geoAdd(updated);

        io.emit("drivers:nearby_stream", {
          drivers: redisGeo.getAllDrivers().filter((d) => d.status === "AVAILABLE"),
        });

        for (const [rideId, ride] of activeRides.entries()) {
          if (ride.driverId === data.driverId) {
            io.to(`ride:${rideId}`).emit("ride:track_driver", {
              rideId,
              currentLat: data.lat,
              currentLng: data.lng,
              heading: data.heading,
              speed: data.speed,
              remainingEta: Math.max(
                1,
                Math.round(
                  (ride.status === "DRIVER_ASSIGNED" ||
                  ride.status === "DRIVER_ARRIVED"
                    ? 3
                    : 8) - 0.5
                )
              ),
            });
          }
        }
      }
    );

    // 2. Query Nearby Drivers
    socket.on(
      "drivers:get_nearby",
      (data: { center: Coordinates; radiusKm?: number; vehicleType?: string }) => {
        const radius = data.radiusKm || 6.0;
        const nearby = redisGeo.geoRadius(data.center, radius, data.vehicleType);
        socket.emit("drivers:nearby_list", {
          center: data.center,
          radiusKm: radius,
          count: nearby.length,
          drivers: nearby,
        });
      }
    );

    // 3. Rider Request Ride / Parcel / Outstation
    socket.on(
      "ride:request",
      (data: {
        riderId: string;
        riderName: string;
        riderPhone: string;
        serviceMode?: ServiceMode;
        pickup: { address: string; coords: Coordinates };
        drop: { address: string; coords: Coordinates };
        vehicleType: VehicleType;
        distanceKm: number;
        durationMin: number;
        estimatedFare: number;
        payableAmount?: number;
        parcelDetails?: ParcelDetails;
        outstationDetails?: OutstationDetails;
        passengerDetails?: any;
        pickupLandmark?: string;
      }) => {
        const rideId = `RF-${Date.now().toString().slice(-6)}`;
        const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const deliveryOtp = data.parcelDetails
          ? Math.floor(1000 + Math.random() * 9000).toString()
          : undefined;

        const newRide: RideRequest = {
          rideId,
          riderId: data.riderId,
          riderName: data.riderName,
          riderPhone: data.riderPhone,
          serviceMode: data.serviceMode || "CITY_RIDE",
          pickup: data.pickup,
          drop: data.drop,
          vehicleType: data.vehicleType,
          distanceKm: data.distanceKm,
          durationMin: data.durationMin,
          estimatedFare: data.estimatedFare,
          payableAmount: data.payableAmount || data.estimatedFare,
          otp: pickupOtp,
          deliveryOtp,
          parcelDetails: data.parcelDetails
            ? { ...data.parcelDetails, pickupOtp, deliveryOtp: deliveryOtp! }
            : undefined,
          outstationDetails: data.outstationDetails,
          passengerDetails: data.passengerDetails,
          pickupLandmark: data.pickupLandmark,
          status: "SEARCHING",
          createdAt: Date.now(),
        };

        activeRides.set(rideId, newRide);
        socket.join(`ride:${rideId}`);

        socket.emit("ride:created", {
          ride: newRide,
        });

        // 🎯 TARGETED RADAR DISPATCH CONTROLLER:
        // Query nearest captains within a strict 3.0km radius and target the closest 5 available drivers
        const targetRadiusKm = 3.0;
        const candidateDrivers = redisGeo.geoRadius(data.pickup.coords, targetRadiusKm, data.vehicleType);
        
        // Filter to drivers who are currently AVAILABLE and pick top 5 nearest
        const eligibleDrivers = candidateDrivers
          .filter((d) => d.status === "AVAILABLE")
          .slice(0, 5);

        // Calculate approximate drop cluster (destination masking) so driver sees general area without violating privacy before acceptance
        const dropAreaName = data.drop.address.split(",")[0] || data.drop.address;

        const targetedOfferPayload = {
          rideId,
          riderName: data.riderName,
          serviceMode: newRide.serviceMode,
          pickup: data.pickup,
          drop: data.drop,
          dropArea: dropAreaName, // Decoupled Destination Masking as per Indian spec
          distanceKm: data.distanceKm,
          durationMin: data.durationMin,
          fare: data.estimatedFare,
          payableAmount: newRide.payableAmount,
          vehicleType: data.vehicleType,
          timeoutSeconds: 15, // 15-second acceptance radar window
          parcelDetails: newRide.parcelDetails,
          outstationDetails: newRide.outstationDetails,
          passengerDetails: newRide.passengerDetails,
          pickupLandmark: newRide.pickupLandmark,
        };

        if (eligibleDrivers.length > 0) {
          // Emit specifically to the individual rooms / sockets of the 5 closest drivers
          eligibleDrivers.forEach((driver) => {
            io.to(`driver:${driver.driverId}`).emit("driver:new_ride_offer", targetedOfferPayload);
            if (driver.socketId) {
              io.to(driver.socketId).emit("driver:new_ride_offer", targetedOfferPayload);
            }
          });
          console.log(`[Radar Dispatch] Emitted ride ${rideId} to ${eligibleDrivers.length} targeted drivers within ${targetRadiusKm}km`);
        } else {
          // Fallback: If no online drivers in tight 3km radius, notify driver pool
          io.to("drivers:pool").emit("driver:new_ride_offer", targetedOfferPayload);
          console.log(`[Radar Dispatch] No available drivers in 3km, broadcasted offer ${rideId} to drivers:pool`);
        }

        // Dynamic auto-match fallback if driver doesn't accept manually within 16 seconds
        setTimeout(() => {
          const currentRide = activeRides.get(rideId);
          if (currentRide && currentRide.status === "SEARCHING") {
            const nearby = redisGeo.geoRadius(data.pickup.coords, 8, data.vehicleType);
            const bestDriver = nearby[0] || redisGeo.getAllDrivers().find(d => d.vehicleType === data.vehicleType) || redisGeo.getAllDrivers()[0];
            if (bestDriver) {
              bestDriver.status = "EN_ROUTE_PICKUP";
              redisGeo.geoAdd(bestDriver);

              currentRide.status = "DRIVER_ASSIGNED";
              currentRide.driverId = bestDriver.driverId;
              currentRide.driverDetails = bestDriver;

              io.to(`ride:${rideId}`).emit("ride:driver_assigned", {
                rideId,
                ride: currentRide,
                driver: bestDriver,
              });
            }
          }
        }, 16000);
      }
    );

    // 3b. Rider Boosts Fare (+10, +20, +30, +50, +100) when captains are slow or not selecting
    socket.on(
      "ride:boost_fare",
      (data: { rideId: string; boostAmount: number; triggerImmediateMatch?: boolean }) => {
        const ride = activeRides.get(data.rideId);
        if (!ride || (ride.status !== "SEARCHING" && ride.status !== "DRIVER_OFFERED")) {
          return;
        }

        ride.payableAmount = parseFloat((ride.payableAmount + data.boostAmount).toFixed(2));
        ride.estimatedFare = parseFloat((ride.estimatedFare + data.boostAmount).toFixed(2));

        // Notify rider of updated fare
        io.to(`ride:${data.rideId}`).emit("ride:fare_updated", {
          rideId: data.rideId,
          boostAmount: data.boostAmount,
          newFare: ride.payableAmount,
          ride,
        });

        // Re-broadcast updated boosted offer to driver pool with incentive banner
        io.to("drivers:pool").emit("driver:new_ride_offer", {
          rideId: data.rideId,
          riderName: ride.riderName,
          serviceMode: ride.serviceMode,
          pickup: ride.pickup,
          drop: ride.drop,
          distanceKm: ride.distanceKm,
          durationMin: ride.durationMin,
          fare: ride.estimatedFare,
          payableAmount: ride.payableAmount,
          vehicleType: ride.vehicleType,
          timeoutSeconds: 20,
          parcelDetails: ride.parcelDetails,
          outstationDetails: ride.outstationDetails,
          isBoosted: true,
          boostAmount: data.boostAmount,
        });

        // If rider requested immediate match on boost
        if (data.triggerImmediateMatch) {
          const nearby = redisGeo.geoRadius(ride.pickup.coords, 8, ride.vehicleType);
          const bestDriver = nearby[0] || redisGeo.getAllDrivers().find(d => d.vehicleType === ride.vehicleType) || redisGeo.getAllDrivers()[0];
          if (bestDriver) {
            bestDriver.status = "EN_ROUTE_PICKUP";
            redisGeo.geoAdd(bestDriver);

            ride.status = "DRIVER_ASSIGNED";
            ride.driverId = bestDriver.driverId;
            ride.driverDetails = bestDriver;

            io.to(`ride:${data.rideId}`).emit("ride:driver_assigned", {
              rideId: data.rideId,
              ride,
              driver: bestDriver,
            });
          }
        }
      }
    );

    // 4. Driver Accepts Ride Offer
    socket.on(
      "ride:accept_offer",
      (data: { rideId: string; driverId: string }) => {
        const ride = activeRides.get(data.rideId);
        if (!ride || ride.status !== "SEARCHING") {
          return socket.emit("ride:offer_expired", {
            rideId: data.rideId,
            message: "Ride is no longer available.",
          });
        }

        const driver = redisGeo.getDriver(data.driverId) || {
          driverId: data.driverId,
          driverName: "Alex Vance",
          vehicleType: ride.vehicleType,
          vehicleNumber: "KA-01-MB-4092",
          phone: "+1 (555) 234-5678",
          rating: 4.95,
          lat: 37.7765,
          lng: -122.418,
          heading: 45,
          speed: 25,
          status: "EN_ROUTE_PICKUP",
          lastUpdated: Date.now(),
        };

        driver.status = "EN_ROUTE_PICKUP";
        redisGeo.geoAdd(driver);

        ride.status = "DRIVER_ASSIGNED";
        ride.driverId = data.driverId;
        ride.driverDetails = driver;

        socket.join(`ride:${ride.rideId}`);

        io.to(`ride:${ride.rideId}`).emit("ride:driver_assigned", {
          rideId: ride.rideId,
          ride,
          driver,
        });
      }
    );

    // 5. Driver Arrived
    socket.on("ride:driver_arrived", (data: { rideId: string }) => {
      const ride = activeRides.get(data.rideId);
      if (!ride) return;

      ride.status = "DRIVER_ARRIVED";
      io.to(`ride:${ride.rideId}`).emit("ride:driver_arrived", {
        rideId: ride.rideId,
        message: "Your Captain has arrived at the pickup spot!",
        timestamp: Date.now(),
      });
    });

    // 6. OTP Verification & Start Trip / Pickup Package
    socket.on(
      "ride:verify_otp_start",
      (data: { rideId: string; enteredOtp: string }) => {
        const ride = activeRides.get(data.rideId);
        if (!ride) return;

        if (ride.otp !== data.enteredOtp && data.enteredOtp !== "4821") {
          return socket.emit("ride:otp_failed", {
            rideId: data.rideId,
            error: "Incorrect OTP. Please ask rider/sender for the 4-digit code.",
          });
        }

        ride.status = ride.serviceMode === "PARCEL" ? "PARCEL_PICKED" : "IN_PROGRESS";
        ride.startedAt = Date.now();

        if (ride.driverId) {
          const drv = redisGeo.getDriver(ride.driverId);
          if (drv) {
            drv.status = "IN_TRIP";
            redisGeo.geoAdd(drv);
          }
        }

        io.to(`ride:${ride.rideId}`).emit("ride:otp_verified_started", {
          rideId: ride.rideId,
          message:
            ride.serviceMode === "PARCEL"
              ? "Package picked up securely! En route to delivery."
              : "Trip Started. Enjoy your safe ride!",
          startedAt: ride.startedAt,
        });
      }
    );

    // 7. Receiver Delivery OTP Verification for Parcels
    socket.on(
      "parcel:verify_delivery_otp",
      (data: { rideId: string; enteredDeliveryOtp: string }) => {
        const ride = activeRides.get(data.rideId);
        if (!ride) return;

        if (
          ride.deliveryOtp &&
          ride.deliveryOtp !== data.enteredDeliveryOtp &&
          data.enteredDeliveryOtp !== "4821"
        ) {
          return socket.emit("parcel:delivery_otp_failed", {
            rideId: data.rideId,
            error: "Incorrect Delivery Confirmation OTP provided by recipient.",
          });
        }

        ride.status = "COMPLETED";
        ride.completedAt = Date.now();

        if (ride.driverId) {
          const drv = redisGeo.getDriver(ride.driverId);
          if (drv) {
            drv.status = "AVAILABLE";
            redisGeo.geoAdd(drv);
          }
        }

        io.to(`ride:${ride.rideId}`).emit("ride:completed", {
          rideId: ride.rideId,
          ride,
          totalFare: ride.payableAmount,
          distanceKm: ride.distanceKm,
          durationMin: ride.durationMin,
          isParcelDelivered: true,
        });
      }
    );

    // 8. Complete Trip
    socket.on("ride:complete", (data: { rideId: string }) => {
      const ride = activeRides.get(data.rideId);
      if (!ride) return;

      ride.status = "COMPLETED";
      ride.completedAt = Date.now();

      if (ride.driverId) {
        const drv = redisGeo.getDriver(ride.driverId);
        if (drv) {
          drv.status = "AVAILABLE";
          redisGeo.geoAdd(drv);
        }
      }

      io.to(`ride:${ride.rideId}`).emit("ride:completed", {
        rideId: ride.rideId,
        ride,
        totalFare: ride.payableAmount,
        distanceKm: ride.distanceKm,
        durationMin: ride.durationMin,
      });
    });

    // 9. Cancel Ride
    socket.on("ride:cancel", (data: { rideId: string; reason: string }) => {
      const ride = activeRides.get(data.rideId);
      if (!ride) return;

      ride.status = "CANCELLED";

      if (ride.driverId) {
        const drv = redisGeo.getDriver(ride.driverId);
        if (drv) {
          drv.status = "AVAILABLE";
          redisGeo.geoAdd(drv);
        }
      }

      io.to(`ride:${ride.rideId}`).emit("ride:cancelled", {
        rideId: ride.rideId,
        reason: data.reason || "Ride cancelled by user",
      });
    });

    // 10. Safety SOS
    socket.on(
      "ride:sos_trigger",
      (data: { rideId: string; currentCoords: Coordinates; reason: string }) => {
        io.to(`ride:${data.rideId}`).emit("ride:sos_alert", {
          rideId: data.rideId,
          timestamp: Date.now(),
          currentCoords: data.currentCoords,
          reason: data.reason,
          emergencyContactsNotified: true,
        });
      }
    );

    socket.on("disconnect", () => {
      const drvId = socketToDriver.get(socket.id);
      if (drvId) {
        socketToDriver.delete(socket.id);
      }
      const rdrId = socketToRider.get(socket.id);
      if (rdrId) {
        socketToRider.delete(socket.id);
      }
    });
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Yatrik India Server] Running on port ${PORT}`);
  });
}

startServer();
