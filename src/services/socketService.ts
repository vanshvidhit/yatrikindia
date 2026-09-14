import { io, Socket } from "socket.io-client";
import {
  DriverTelemetry,
  IncomingRideOffer,
  ActiveRide,
  Coordinates,
  SocketPacketLog,
  VehicleType,
  ServiceMode,
  ParcelDetails,
  OutstationDetails,
} from "../types";

type PacketListener = (log: SocketPacketLog) => void;

class SocketClientService {
  private socket: Socket | null = null;
  private packetListeners: Set<PacketListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnected = false;

  public init(): Socket {
    if (this.socket) {
      return this.socket;
    }

    // Connect to current host
    this.socket = io({
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logPacket("INBOUND", "connect", { socketId: this.socket?.id });
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      this.logPacket("INBOUND", "disconnect", { reason });
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      this.logPacket("INBOUND", "connect_error", {
        message: error.message,
        attempt: this.reconnectAttempts,
      });
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.init();
    }
    return this.socket;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public subscribeToPackets(listener: PacketListener): () => void {
    this.packetListeners.add(listener);
    return () => {
      this.packetListeners.delete(listener);
    };
  }

  public logPacket(
    direction: "INBOUND" | "OUTBOUND",
    eventName: string,
    payload: any,
    latencyMs?: number
  ) {
    const log: SocketPacketLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      direction,
      eventName,
      payload,
      latencyMs,
    };
    this.packetListeners.forEach((l) => l(log));
  }

  public emit(eventName: string, data: any) {
    const s = this.getSocket();
    if (s) {
      this.logPacket("OUTBOUND", eventName, data);
      s.emit(eventName, data);
    }
  }

  public joinRider(riderId: string) {
    this.emit("join:rider", { riderId });
  }

  public joinDriver(driverId: string) {
    this.emit("join:driver", { driverId });
  }

  public updateDriverLocation(
    telemetry: Partial<DriverTelemetry> & {
      driverId: string;
      lat: number;
      lng: number;
      heading: number;
    }
  ) {
    this.emit("driver:location_update", telemetry);
  }

  public requestRide(payload: {
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
    passengerDetails?: import("../types").PassengerBookingDetails;
    pickupLandmark?: string;
    driverTip?: number;
    ridePreferences?: import("../types").RidePreferences;
  }) {
    this.emit("ride:request", payload);
  }

  public acceptOffer(rideId: string, driverId: string) {
    this.emit("ride:accept_offer", { rideId, driverId });
  }

  public notifyDriverArrived(rideId: string) {
    this.emit("ride:driver_arrived", { rideId });
  }

  public verifyOtpAndStart(rideId: string, enteredOtp: string) {
    this.emit("ride:verify_otp_start", { rideId, enteredOtp });
  }

  public completeRide(rideId: string) {
    this.emit("ride:complete", { rideId });
  }

  public cancelRide(rideId: string, reason: string) {
    this.emit("ride:cancel", { rideId, reason });
  }

  public boostFare(rideId: string, boostAmount: number, triggerImmediateMatch?: boolean) {
    this.emit("ride:boost_fare", { rideId, boostAmount, triggerImmediateMatch });
  }

  public triggerSOS(
    rideId: string,
    currentCoords: Coordinates,
    reason: string
  ) {
    this.emit("ride:sos_trigger", { rideId, currentCoords, reason });
  }
}

export const socketService = new SocketClientService();
