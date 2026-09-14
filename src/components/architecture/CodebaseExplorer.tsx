import React, { useState } from "react";
import {
  Folder,
  FileCode,
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  Smartphone,
  Server,
  Zap,
} from "lucide-react";

interface CodeFile {
  path: string;
  name: string;
  category: "MOBILE_REACT_NATIVE" | "HOOKS" | "SERVICES" | "BACKEND" | "STATE";
  language: string;
  content: string;
}

const CODE_FILES: CodeFile[] = [
  {
    path: "src/hooks/useAnimatedDriverMarker.ts",
    name: "useAnimatedDriverMarker.ts",
    category: "HOOKS",
    language: "typescript",
    content: `import { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { Marker } from 'react-native-maps';

interface Coordinates {
  latitude: number;
  longitude: number;
  heading: number;
}

/**
 * Principal Mobile Architect Hook:
 * Smooth marker coordinate interpolation using React Native Animated.Value
 * Ensures driver icon glides seamlessly on GPS updates without jarring jumps.
 */
export function useAnimatedDriverMarker(
  targetLat: number,
  targetLng: number,
  targetHeading: number,
  durationMs = 1500
) {
  const animatedCoordinate = useRef(
    new Animated.ValueXY({ x: targetLng, y: targetLat })
  ).current;
  const animatedHeading = useRef(new Animated.Value(targetHeading)).current;

  useEffect(() => {
    // 1. Smoothly interpolate 2D coordinate vector (Lat / Lng)
    Animated.timing(animatedCoordinate, {
      toValue: { x: targetLng, y: targetLat },
      duration: durationMs,
      useNativeDriver: false,
    }).start();

    // 2. Smoothly rotate marker heading angle (0-360)
    Animated.timing(animatedHeading, {
      toValue: targetHeading,
      duration: durationMs,
      useNativeDriver: false,
    }).start();
  }, [targetLat, targetLng, targetHeading, durationMs]);

  return {
    coordinate: animatedCoordinate,
    heading: animatedHeading,
  };
}`,
  },
  {
    path: "src/hooks/useLocationTracker.ts",
    name: "useLocationTracker.ts",
    category: "HOOKS",
    language: "typescript",
    content: `import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { socketService } from '../services/socketService';
import { useRideStore } from '../store/useRideStore';

/**
 * Throttled Driver Telemetry Emitter (3-5s intervals)
 * Supports foreground GPS precision & background battery optimization.
 */
export function useLocationTracker() {
  const { driverAuth, isOnline } = useRideStore();
  const lastEmitTimeRef = useRef<number>(0);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    async function startLocationWatch() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Foreground location permission denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          const now = Date.now();
          if (now - lastEmitTimeRef.current >= 3000 && isOnline) {
            lastEmitTimeRef.current = now;

            // Emit to Node.js backend Redis Geospatial index
            socketService.emit('driver:location_update', {
              driverId: driverAuth.id,
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              heading: location.coords.heading || 0,
              speed: location.coords.speed ? Math.round(location.coords.speed * 3.6) : 25,
              status: isOnline ? 'AVAILABLE' : 'OFFLINE',
            });
          }
        }
      );
    }

    if (isOnline) {
      startLocationWatch();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isOnline, driverAuth.id]);
}`,
  },
  {
    path: "src/services/socketService.ts",
    name: "socketService.ts",
    category: "SERVICES",
    language: "typescript",
    content: `import { io, Socket } from 'socket.io-client';
import { BACKEND_WS_URL } from '../config/env';

/**
 * Socket.io Client Wrapper with Exponential Reconnect Backoff & Offline Queue
 */
class SocketService {
  private socket: Socket | null = null;
  private offlineQueue: Array<{ event: string; data: any }> = [];

  public connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(BACKEND_WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    this.socket.on('connect', () => {
      console.log('[RideFlow Socket] Connected securely:', this.socket?.id);
      this.flushOfflineQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[RideFlow Socket] Disconnected:', reason);
    });
  }

  public emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      // Buffer payload during transient cellular tunnel drop
      this.offlineQueue.push({ event, data });
    }
  }

  public on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  public off(event: string) {
    this.socket?.off(event);
  }

  private flushOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const item = this.offlineQueue.shift();
      if (item && this.socket?.connected) {
        this.socket.emit(item.event, item.data);
      }
    }
  }
}

export const socketService = new SocketService();`,
  },
  {
    path: "src/screens/RiderHomeScreen.tsx",
    name: "RiderHomeScreen.tsx",
    category: "MOBILE_REACT_NATIVE",
    language: "tsx",
    content: `import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRideStore } from '../store/useRideStore';
import { useSocket } from '../hooks/useSocket';
import { FareSelectionSheet } from '../components/FareSelectionSheet';
import { ActiveRideTrackingCard } from '../components/ActiveRideTrackingCard';
import { AnimatedDriverMarker } from '../components/AnimatedDriverMarker';

export const RiderHomeScreen: React.FC = () => {
  useSocket();
  const {
    riderLocation,
    nearbyDrivers,
    activeRide,
    activeRouteCoords,
  } = useRideStore();

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* 1. Google Maps Vector Surface */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: riderLocation.latitude,
          longitude: riderLocation.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        {/* Rider Pulse Pin */}
        <Marker coordinate={riderLocation} title="Your Location" />

        {/* Nearby Drivers with Smooth Interpolation */}
        {nearbyDrivers.map((driver) => (
          <AnimatedDriverMarker
            key={driver.driverId}
            lat={driver.lat}
            lng={driver.lng}
            heading={driver.heading}
            vehicleType={driver.vehicleType}
          />
        ))}

        {/* Active Route Polyline */}
        {activeRouteCoords.length > 1 && (
          <Polyline
            coordinates={activeRouteCoords}
            strokeColor="#10b981"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* 2. Bottom Sheet Controller */}
      {activeRide ? (
        <ActiveRideTrackingCard ride={activeRide} />
      ) : (
        <FareSelectionSheet />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  map: { flex: 1 },
});`,
  },
  {
    path: "server/redisGeoService.ts",
    name: "redisGeoService.ts",
    category: "BACKEND",
    language: "typescript",
    content: `import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const DRIVER_GEO_KEY = 'rideflow:drivers:geo';

export class RedisGeospatialService {
  /**
   * GEOADD: Updates driver GPS location point
   */
  async addDriverLocation(driverId: string, lat: number, lng: number): Promise<void> {
    await redis.geoadd(DRIVER_GEO_KEY, lng, lat, driverId);
    // Expire key metadata after 45 seconds for auto-offline safety
    await redis.set(\`driver:meta:\${driverId}\`, JSON.stringify({ lat, lng, lastSeen: Date.now() }), 'EX', 45);
  }

  /**
   * GEORADIUS: High-speed O(N+log(M)) lookup of nearest captains within radius km
   */
  async findNearbyDrivers(centerLat: number, centerLng: number, radiusKm = 5): Promise<string[]> {
    const results = await redis.georadius(
      DRIVER_GEO_KEY,
      centerLng,
      centerLat,
      radiusKm,
      'km',
      'WITHDIST',
      'WITHCOORD',
      'ASC',
      'COUNT',
      10
    );
    return results.map((item: any) => item[0]);
  }
}`,
  },
];

export const CodebaseExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 md:p-6 overflow-hidden max-w-7xl mx-auto w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Expo SDK 52+ / TypeScript
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              React Native Maps + Zustand
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Mobile Architecture & Codebase Files
          </h1>
          <p className="text-xs text-slate-400">
            Clean, modular, production-ready source code for React Native client, custom hooks & distributed backend.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all self-start md:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy File Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Sidebar: File Tree */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">
            Project Workspace Structure
          </div>

          <div className="space-y-1">
            {CODE_FILES.map((file) => {
              const isSelected = file.path === selectedFile.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all text-xs ${
                    isSelected
                      ? "bg-blue-600/20 border border-blue-500/40 text-white font-semibold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileCode
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-blue-400" : "text-slate-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {file.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Expo Setup Guide Card */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Quick Expo Start:
              </div>
              <div className="font-mono text-[10px] bg-slate-950 p-2 rounded-lg text-emerald-300 overflow-x-auto">
                npx create-expo-app rideflow -t blank-typescript
                <br />
                npx expo install react-native-maps socket.io-client zustand
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">
                {selectedFile.path}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              {selectedFile.language}
            </span>
          </div>

          <div className="flex-1 p-4 bg-slate-950 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
