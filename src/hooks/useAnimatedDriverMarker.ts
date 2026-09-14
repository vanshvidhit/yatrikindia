import { useEffect, useRef, useState } from "react";
import { Coordinates } from "../types";

interface InterpolatedState {
  lat: number;
  lng: number;
  heading: number;
}

/**
 * Hook for smooth marker coordinate and heading interpolation.
 * Mimics React Native Animated.Value / Reanimated marker glide to prevent jitter.
 */
export function useAnimatedDriverMarker(
  targetLat: number,
  targetLng: number,
  targetHeading: number,
  durationMs = 1200
) {
  const [current, setCurrent] = useState<InterpolatedState>({
    lat: targetLat,
    lng: targetLng,
    heading: targetHeading,
  });

  const animRef = useRef<number | null>(null);
  const startStateRef = useRef<InterpolatedState>({
    lat: targetLat,
    lng: targetLng,
    heading: targetHeading,
  });
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check if change is trivial
    const dLat = Math.abs(targetLat - current.lat);
    const dLng = Math.abs(targetLng - current.lng);
    if (dLat < 0.000001 && dLng < 0.000001 && Math.abs(targetHeading - current.heading) < 1) {
      return;
    }

    startStateRef.current = {
      lat: current.lat,
      lng: current.lng,
      heading: current.heading,
    };
    startTimeRef.current = performance.now();

    // Shortest angular difference for heading (e.g. 350 deg to 10 deg)
    let headingDiff = targetHeading - current.heading;
    if (headingDiff > 180) headingDiff -= 360;
    if (headingDiff < -180) headingDiff += 360;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextLat =
        startStateRef.current.lat +
        (targetLat - startStateRef.current.lat) * ease;
      const nextLng =
        startStateRef.current.lng +
        (targetLng - startStateRef.current.lng) * ease;
      const nextHeading = (startStateRef.current.heading + headingDiff * ease + 360) % 360;

      setCurrent({
        lat: nextLat,
        lng: nextLng,
        heading: nextHeading,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [targetLat, targetLng, targetHeading, durationMs]);

  return current;
}
