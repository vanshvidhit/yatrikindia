import { useEffect, useRef } from "react";
import { socketService } from "../services/socketService";
import { useRideStore } from "../store/useRideStore";
import { calculateBearing } from "../services/geoService";

/**
 * Hook to manage foreground/background GPS pings with 3-5s throttling
 */
export function useLocationTracker() {
  const { driverAuth, driverLocation, setDriverLocation, isSimulatingTrip, simulationStep } =
    useRideStore();

  const lastSentRef = useRef<number>(0);
  const prevCoordRef = useRef<{ lat: number; lng: number }>(driverLocation);

  // Throttled Ping Emitter (3 seconds interval)
  useEffect(() => {
    if (!driverAuth.isLoggedIn || !driverAuth.isOnline) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSentRef.current >= 3000) {
        lastSentRef.current = now;

        socketService.updateDriverLocation({
          driverId: driverAuth.id,
          lat: driverLocation.lat,
          lng: driverLocation.lng,
          heading: driverLocation.heading,
          speed: driverLocation.speed,
          status: driverAuth.isOnline ? "AVAILABLE" : "OFFLINE",
          vehicleType: driverAuth.vehicleType,
          driverName: driverAuth.name,
          vehicleNumber: driverAuth.vehicleNumber,
          rating: driverAuth.rating,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [
    driverAuth.isLoggedIn,
    driverAuth.isOnline,
    driverAuth.id,
    driverLocation.lat,
    driverLocation.lng,
    driverLocation.heading,
  ]);

  // Simulation step timer when active trip simulation is running
  useEffect(() => {
    if (!isSimulatingTrip) return;

    const simInterval = setInterval(() => {
      simulationStep();
    }, 1200);

    return () => clearInterval(simInterval);
  }, [isSimulatingTrip, simulationStep]);

  // Helper to manual update location
  const updateCurrentPosition = (lat: number, lng: number) => {
    const bearing = calculateBearing(prevCoordRef.current, { lat, lng });
    prevCoordRef.current = { lat, lng };

    setDriverLocation({
      lat,
      lng,
      heading: bearing,
      speed: 32,
    });

    if (driverAuth.isOnline) {
      socketService.updateDriverLocation({
        driverId: driverAuth.id,
        lat,
        lng,
        heading: bearing,
        speed: 32,
        status: "AVAILABLE",
        vehicleType: driverAuth.vehicleType,
      });
    }
  };

  return {
    driverLocation,
    updateCurrentPosition,
  };
}
