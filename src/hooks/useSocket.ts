import { useEffect } from "react";
import { socketService } from "../services/socketService";
import { useRideStore } from "../store/useRideStore";
import { ActiveRide, DriverTelemetry, IncomingRideOffer } from "../types";

export function useSocket() {
  const {
    riderAuth,
    driverAuth,
    setNearbyDrivers,
    setIncomingOffer,
    setRiderActiveRide,
    setDriverActiveRide,
    addPacketLog,
    riderActiveRide,
    driverActiveRide,
  } = useRideStore();

  useEffect(() => {
    const socket = socketService.init();

    // Subscribe packet logging to real-time stream
    const unsubscribePackets = socketService.subscribeToPackets((log) => {
      addPacketLog(log);
    });

    // Join Rider Room if logged in
    if (riderAuth.isLoggedIn && riderAuth.id) {
      socketService.joinRider(riderAuth.id);
    }

    // Join Driver Room if logged in
    if (driverAuth.isLoggedIn && driverAuth.id) {
      socketService.joinDriver(driverAuth.id);
    }

    // Listeners

    // 1. Nearby Drivers Stream (Redis Geospatial GEORADIUS)
    const handleNearbyStream = (data: { drivers: DriverTelemetry[] }) => {
      if (data.drivers) {
        setNearbyDrivers(data.drivers);
      }
    };
    socket.on("drivers:nearby_stream", handleNearbyStream);

    // 2. Incoming Ride Offer (15s Countdown for Driver)
    const handleNewOffer = (offer: IncomingRideOffer) => {
      console.log("[Socket] Received driver:new_ride_offer", offer);
      // Only show if driver is online and not already in trip
      if (driverAuth.isOnline && !driverActiveRide) {
        setIncomingOffer(offer);
      }
    };
    socket.on("driver:new_ride_offer", handleNewOffer);

    // 3. Driver Assigned
    const handleDriverAssigned = (data: { rideId: string; ride: ActiveRide; driver: DriverTelemetry }) => {
      console.log("[Socket] ride:driver_assigned", data);
      setRiderActiveRide(data.ride);
      if (driverAuth.id === data.driver.driverId) {
        setDriverActiveRide(data.ride);
        setIncomingOffer(null);
      }
    };
    socket.on("ride:driver_assigned", handleDriverAssigned);

    // 4. Driver Arrived
    const handleDriverArrived = (data: { rideId: string }) => {
      console.log("[Socket] ride:driver_arrived", data);
      const current = useRideStore.getState().riderActiveRide;
      if (current && current.rideId === data.rideId) {
        setRiderActiveRide({ ...current, status: "DRIVER_ARRIVED" });
      }
    };
    socket.on("ride:driver_arrived", handleDriverArrived);

    // 5. OTP Verified & Trip Started
    const handleTripStarted = (data: { rideId: string; startedAt: number }) => {
      console.log("[Socket] ride:otp_verified_started", data);
      const currentR = useRideStore.getState().riderActiveRide;
      if (currentR && currentR.rideId === data.rideId) {
        setRiderActiveRide({ ...currentR, status: "IN_PROGRESS", startedAt: data.startedAt });
      }
      const currentD = useRideStore.getState().driverActiveRide;
      if (currentD && currentD.rideId === data.rideId) {
        setDriverActiveRide({ ...currentD, status: "IN_PROGRESS", startedAt: data.startedAt });
      }
    };
    socket.on("ride:otp_verified_started", handleTripStarted);

    // 6. Real-Time Tracking Driver Movement
    const handleTrackDriver = (data: {
      rideId: string;
      currentLat: number;
      currentLng: number;
      heading: number;
      speed?: number;
      remainingEta?: number;
    }) => {
      const current = useRideStore.getState().riderActiveRide;
      if (current && current.rideId === data.rideId) {
        // Update driver details on ride
        setRiderActiveRide({
          ...current,
          driverDetails: {
            ...current.driverDetails,
            lat: data.currentLat,
            lng: data.currentLng,
            heading: data.heading,
            speed: data.speed || 30,
          },
        });
      }
    };
    socket.on("ride:track_driver", handleTrackDriver);

    // 7. Trip Completed
    const handleTripCompleted = (data: { rideId: string; ride: ActiveRide; totalFare: number }) => {
      console.log("[Socket] ride:completed", data);
      const currentR = useRideStore.getState().riderActiveRide;
      if (currentR && currentR.rideId === data.rideId) {
        setRiderActiveRide({ ...currentR, status: "COMPLETED", completedAt: Date.now() });
      }
      const currentD = useRideStore.getState().driverActiveRide;
      if (currentD && currentD.rideId === data.rideId) {
        setDriverActiveRide({ ...currentD, status: "COMPLETED", completedAt: Date.now() });
        // Update earnings
        useRideStore.getState().setDriverAuth({
          earningsToday: Number((useRideStore.getState().driverAuth.earningsToday + data.totalFare * 0.82).toFixed(2)),
          completedTrips: useRideStore.getState().driverAuth.completedTrips + 1,
        });
      }
    };
    socket.on("ride:completed", handleTripCompleted);

    // 8. Trip Cancelled
    const handleTripCancelled = (data: { rideId: string; reason: string }) => {
      console.log("[Socket] ride:cancelled", data);
      setRiderActiveRide(null);
      setDriverActiveRide(null);
    };
    socket.on("ride:cancelled", handleTripCancelled);

    // Standalone fallback captains for Vercel/offline environments
    const FALLBACK_CAPTAINS: DriverTelemetry[] = [
      {
        driverId: "DRV-101",
        driverName: "Rajesh Sharma",
        vehicleType: "CAB",
        vehicleNumber: "MP-04-AB-1234",
        phone: "+91 98260 12345",
        rating: 4.96,
        lat: 23.2525,
        lng: 77.4645,
        heading: 45,
        speed: 28,
        status: "AVAILABLE",
        lastUpdated: Date.now(),
      },
      {
        driverId: "DRV-102",
        driverName: "Vikram Rathore",
        vehicleType: "AUTO",
        vehicleNumber: "MP-04-AT-5678",
        phone: "+91 98261 67890",
        rating: 4.88,
        lat: 23.2475,
        lng: 77.4610,
        heading: 120,
        speed: 22,
        status: "AVAILABLE",
        lastUpdated: Date.now(),
      },
      {
        driverId: "DRV-103",
        driverName: "Sunil Verma",
        vehicleType: "BIKE",
        vehicleNumber: "MP-04-BK-9012",
        phone: "+91 98262 11223",
        rating: 4.92,
        lat: 23.2550,
        lng: 77.4680,
        heading: 270,
        speed: 35,
        status: "AVAILABLE",
        lastUpdated: Date.now(),
      },
      {
        driverId: "DRV-104",
        driverName: "Deepak Chouhan",
        vehicleType: "SCOOTY",
        vehicleNumber: "MP-04-EV-4455",
        phone: "+91 98263 33445",
        rating: 4.94,
        lat: 23.2460,
        lng: 77.4655,
        heading: 90,
        speed: 20,
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
    ];

    // Seed fallback if socket is disconnected and drivers are empty
    const fallbackInitTimer = setTimeout(() => {
      if (!socket.connected && useRideStore.getState().nearbyDrivers.length === 0) {
        setNearbyDrivers(FALLBACK_CAPTAINS);
      }
    }, 1200);

    // Roaming interval for standalone realism
    const roamingInterval = setInterval(() => {
      if (!socket.connected) {
        const currentDrivers = useRideStore.getState().nearbyDrivers;
        if (currentDrivers.length > 0) {
          const updated = currentDrivers.map((d) => {
            const jitterLat = (Math.random() - 0.5) * 0.0004;
            const jitterLng = (Math.random() - 0.5) * 0.0004;
            return {
              ...d,
              lat: +(d.lat + jitterLat).toFixed(6),
              lng: +(d.lng + jitterLng).toFixed(6),
              heading: (d.heading + Math.floor(Math.random() * 20) - 10 + 360) % 360,
              lastUpdated: Date.now(),
            };
          });
          setNearbyDrivers(updated);
        }
      }
    }, 3500);

    return () => {
      clearTimeout(fallbackInitTimer);
      clearInterval(roamingInterval);
      socket.off("drivers:nearby_stream", handleNearbyStream);
      socket.off("driver:new_ride_offer", handleNewOffer);
      socket.off("ride:driver_assigned", handleDriverAssigned);
      socket.off("ride:driver_arrived", handleDriverArrived);
      socket.off("ride:otp_verified_started", handleTripStarted);
      socket.off("ride:track_driver", handleTrackDriver);
      socket.off("ride:completed", handleTripCompleted);
      socket.off("ride:cancelled", handleTripCancelled);
      unsubscribePackets();
    };
  }, [riderAuth.id, driverAuth.id, driverAuth.isOnline]);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.getIsConnected(),
  };
}
