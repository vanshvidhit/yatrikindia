import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Car,
  Clock,
  Shield,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  LogOut,
  Package,
  Plane,
  Building,
  Zap,
  History,
  Maximize2,
  Minimize2,
  SplitSquareVertical,
  Smartphone,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";
import { MobilityMapView } from "../map/MobilityMapView";
import { SearchPlacesModal } from "./SearchPlacesModal";
import { FareSelectionSheet } from "./FareSelectionSheet";
import { ActiveRideTrackingView } from "./ActiveRideTrackingView";
import { SearchingCaptainRadar } from "./SearchingCaptainRadar";
import { TripSummary } from "./TripSummary";
import { RiderTripHistoryModal } from "./RiderTripHistoryModal";
import { RiderAuthView } from "./RiderAuthView";
import { MapLayerControl } from "./MapLayerControl";
import { SOSTriggerButton } from "./SOSTriggerButton";
import { UpiPaymentModal, UpiPaymentDetails } from "./UpiPaymentModal";
import { getFareEstimatesApi } from "../../services/api";
import { socketService } from "../../services/socketService";
import { PlaceItem, ActiveRide } from "../../types";

export const RiderHomeScreen: React.FC = () => {
  const {
    riderAuth,
    logoutRider,
    riderLocation,
    pickupLocation,
    dropLocation,
    setPickupLocation,
    setDropLocation,
    nearbyDrivers,
    fareTiers,
    setFareTiers,
    riderActiveRide,
    setRiderActiveRide,
    activeRoutePoints,
    serviceMode,
    setServiceMode,
    parcelDetails,
    setSelectedVehicleType,
    mapLayerMode,
    setMapLayerMode,
  } = useRideStore();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<"PICKUP" | "DROP">("DROP");
  const [splitMode, setSplitMode] = useState<"HALF" | "EXPAND_MAP" | "EXPAND_DETAILS">("HALF");
  const [showUpiPaymentModal, setShowUpiPaymentModal] = useState(false);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [completedRideData, setCompletedRideData] = useState<ActiveRide | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Automatic trigger when 'ride:completed' socket event is received
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleRideCompleted = (data: {
      rideId: string;
      ride?: ActiveRide;
      totalFare?: number;
      distanceKm?: number;
      durationMin?: number;
    }) => {
      console.log("[RiderHomeScreen] 'ride:completed' socket event caught:", data);
      const currentActive = useRideStore.getState().riderActiveRide;
      const rideToSummarize: ActiveRide = data.ride || (currentActive ? { ...currentActive } : {
        rideId: data.rideId,
        riderId: riderAuth.id || "rider-1",
        riderName: riderAuth.name || "Aakash Mehta",
        riderPhone: riderAuth.phone || "+91 98451 23456",
        serviceMode: serviceMode || "CITY_RIDE",
        pickup: {
          address: pickupLocation?.title || "Indrapuri Sector C, Raisen Road, Bhopal",
          coords: pickupLocation?.coords || riderLocation,
        },
        drop: {
          address: dropLocation?.title || "DB City Mall, MP Nagar Zone-1, Bhopal",
          coords: dropLocation?.coords || { lat: 23.2332, lng: 77.4326 },
        },
        vehicleType: "CAB",
        distanceKm: data.distanceKm || 5.2,
        durationMin: data.durationMin || 18,
        estimatedFare: data.totalFare || 165.0,
        payableAmount: data.totalFare || 165.0,
        paymentMethod: "UPI",
        paymentStatus: "PENDING",
        otp: "4821",
        status: "COMPLETED",
        createdAt: Date.now() - 900000,
        startedAt: Date.now() - 840000,
        completedAt: Date.now(),
        driverDetails: {
          driverId: "DRV-101",
          driverName: "Ramesh Kumar",
          vehicleType: "CAB",
          vehicleNumber: "MP-04-CB-4092",
          rating: 4.96,
          lat: 23.2332,
          lng: 77.4326,
        },
      });

      setCompletedRideData(rideToSummarize);
      // Seamlessly trigger Indian UPI Intent flow upon ride completion
      setShowUpiPaymentModal(true);
    };

    socket.on("ride:completed", handleRideCompleted);

    return () => {
      socket.off("ride:completed", handleRideCompleted);
    };
  }, [riderAuth, serviceMode, pickupLocation, dropLocation, riderLocation]);

  // Also sync when riderActiveRide status changes to COMPLETED
  useEffect(() => {
    if (riderActiveRide?.status === "COMPLETED") {
      setCompletedRideData(riderActiveRide);
      setShowUpiPaymentModal(true);
    }
  }, [riderActiveRide?.status, riderActiveRide]);

  // Handle successful UPI payment settlement
  const handlePaymentComplete = (details: UpiPaymentDetails) => {
    setShowUpiPaymentModal(false);

    const targetRide = completedRideData || riderActiveRide;
    if (targetRide) {
      const updatedRide: ActiveRide = {
        ...targetRide,
        paymentStatus: "PAID",
        paymentMethod: details.method === "CASH" ? "CASH" : "UPI",
      };
      setCompletedRideData(updatedRide);
    }

    // Smoothly transition to Trip Summary & Driver Rating screen
    setShowTripSummary(true);
  };

  // Demo helper: Allows testing the UPI Intent Payment flow on demand
  const handleSimulateCompletedRidePayment = () => {
    const demoRide: ActiveRide = riderActiveRide || {
      rideId: `RF-${Math.floor(100000 + Math.random() * 900000)}`,
      riderId: riderAuth.id || "rider-1",
      riderName: riderAuth.name || "Aakash Mehta",
      riderPhone: riderAuth.phone || "+91 98451 23456",
      serviceMode: "CITY_RIDE",
      pickup: {
        address: "Indrapuri Sector C, Raisen Road, Bhopal",
        coords: { lat: 23.2517, lng: 77.4650 },
      },
      drop: {
        address: "DB City Mall & MP Nagar Zone-1, Bhopal",
        coords: { lat: 23.2332, lng: 77.4326 },
      },
      vehicleType: "SEDAN",
      distanceKm: 5.2,
      durationMin: 18,
      estimatedFare: 165.0,
      payableAmount: 165.0,
      paymentMethod: "UPI",
      paymentStatus: "PENDING",
      otp: "5829",
      status: "COMPLETED",
      createdAt: Date.now() - 1200000,
      startedAt: Date.now() - 1080000,
      completedAt: Date.now(),
      driverDetails: {
        driverId: "DRV-101",
        driverName: "Ramesh Kumar",
        vehicleType: "SEDAN",
        vehicleNumber: "MP-04-CB-4092",
        rating: 4.96,
        lat: 23.2332,
        lng: 77.4326,
      },
    };

    setCompletedRideData(demoRide);
    setShowUpiPaymentModal(true);
  };

  // If not logged in, render auth screen
  if (!riderAuth.isLoggedIn) {
    return <RiderAuthView />;
  }

  // Trigger fare estimate when drop location is selected
  const handleSelectPlace = async (place: PlaceItem) => {
    if (searchTarget === "PICKUP") {
      setPickupLocation(place);
    } else {
      setDropLocation(place);
    }
    const currentPickup = searchTarget === "PICKUP" ? place : pickupLocation;
    const currentDrop = searchTarget === "DROP" ? place : dropLocation;
    if (currentPickup && currentDrop) {
      const fareData = await getFareEstimatesApi(
        currentPickup.coords,
        currentDrop.coords,
        serviceMode,
        parcelDetails.weightKg,
        serviceMode === "OUTSTATION"
      );
      setFareTiers(fareData.estimates);
    }
  };

  const handleToggleSplit = () => {
    setSplitMode((prev) => {
      if (prev === "HALF") return "EXPAND_DETAILS";
      if (prev === "EXPAND_DETAILS") return "EXPAND_MAP";
      return "HALF";
    });
  };

  const activeDriverCoord = riderActiveRide?.driverDetails?.lat
    ? {
        lat: riderActiveRide.driverDetails.lat,
        lng: riderActiveRide.driverDetails.lng || -122.418,
        heading: riderActiveRide.driverDetails.heading || 0,
        speed: riderActiveRide.driverDetails.speed || 30,
      }
    : undefined;

  // Split-screen heights
  const mapHeightClass =
    splitMode === "HALF"
      ? "h-[46%]"
      : splitMode === "EXPAND_MAP"
      ? "h-[74%]"
      : "h-[22%]";

  const detailsHeightClass =
    splitMode === "HALF"
      ? "h-[54%]"
      : splitMode === "EXPAND_MAP"
      ? "h-[26%]"
      : "h-[78%]";

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      {/* TOP HALF: Interactive Map View with Refined Curved Edges */}
      <div className={`relative ${mapHeightClass} w-full transition-all duration-300 ease-in-out shrink-0 p-2 pb-1 flex flex-col`}>
        <div className="relative w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-800/90 shadow-lg shadow-black/60 ring-1 ring-white/10 isolate">
          {/* Floating Top Glass Header */}
          <div className="absolute top-2 inset-x-2.5 z-30 flex items-center justify-between pointer-events-none">
            {!riderActiveRide ? (
              <div className="pointer-events-auto flex items-center gap-1.5">
                <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {riderAuth.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">
                    {riderAuth.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    ★ {riderAuth.rating}
                  </span>
                </div>

                {/* Ride History Modal Trigger */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  id="rider-history-trigger-btn"
                  className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold shadow-lg transition-colors"
                  title="View Ride & Activity History"
                >
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Trips</span>
                </button>

                {/* UPI Intent Demo Trigger for immediate inspection */}
                <button
                  onClick={handleSimulateCompletedRidePayment}
                  id="rider-upi-demo-trigger-btn"
                  className="flex items-center gap-1 bg-emerald-950/90 hover:bg-emerald-900 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-semibold shadow-lg transition-colors"
                  title="Simulate UPI Intent Payment (GPay, PhonePe, Paytm, CRED)"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">UPI Pay</span>
                </button>
              </div>
            ) : (
              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  onClick={handleSimulateCompletedRidePayment}
                  id="rider-active-upi-trigger-btn"
                  className="flex items-center gap-1 bg-emerald-950/90 hover:bg-emerald-900 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-semibold shadow-lg transition-colors"
                  title="Complete Trip & Pay with UPI"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs">End & Pay UPI</span>
                </button>
              </div>
            )}

            <div className="pointer-events-auto flex items-center gap-1.5 ml-auto">
              {/* Split Screen Control Button */}
              <button
                onClick={handleToggleSplit}
                className="w-8 h-8 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-lg"
                title={`View Mode: ${splitMode === "HALF" ? "50/50 Split" : splitMode === "EXPAND_MAP" ? "Expand Map" : "Expand Details"}`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {/* Emergency Safety SOS Trigger */}
              <SOSTriggerButton />

              {/* Map Layer Control */}
              <MapLayerControl onLayerChange={(mode) => setMapLayerMode(mode)} />

              {!riderActiveRide && (
                <button
                  onClick={logoutRider}
                  className="w-8 h-8 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors shadow-lg"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Map Canvas */}
          <MobilityMapView
            mapId="rider-map"
            center={
              activeDriverCoord
                ? { lat: activeDriverCoord.lat, lng: activeDriverCoord.lng }
                : riderLocation
            }
            zoom={riderActiveRide ? 15 : 14}
            riderLocation={riderLocation}
            driverLocation={activeDriverCoord}
            nearbyDrivers={riderActiveRide ? [] : nearbyDrivers}
            pickupPlace={pickupLocation}
            dropPlace={dropLocation}
            routePoints={activeRoutePoints}
            geofenceCorridor={!!riderActiveRide}
            layerMode={mapLayerMode}
            onLayerModeChange={setMapLayerMode}
            hideBuiltinLayerMenu={true}
          />
        </div>
      </div>

      {/* BOTTOM HALF: Ride Details & Vehicle Rates */}
      <div className={`relative ${detailsHeightClass} w-full flex flex-col bg-slate-900 rounded-t-[28px] border-t border-slate-700/80 shadow-[0_-12px_32px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out overflow-hidden z-20`}>
        {/* If Active Ride is in progress, show active tracking or searching HUD */}
        {riderActiveRide && riderActiveRide.status !== "COMPLETED" ? (
          riderActiveRide.status === "SEARCHING" ? (
            <SearchingCaptainRadar
              ride={riderActiveRide}
              onCancel={() => setRiderActiveRide(null)}
            />
          ) : (
            <ActiveRideTrackingView ride={riderActiveRide} />
          )
        ) : (
          /* Pre-Booking Mode: Complete Rapido-style Fare & Vehicle Selection Sheet */
          <FareSelectionSheet
            onCancel={() => {}}
            onOpenSearchPickup={() => {
              setSearchTarget("PICKUP");
              setSearchModalOpen(true);
            }}
            onOpenSearchDrop={() => {
              setSearchTarget("DROP");
              setSearchModalOpen(true);
            }}
            splitMode={splitMode}
            onToggleSplitMode={handleToggleSplit}
          />
        )}
      </div>

      {/* Search Places Autocomplete Sheet */}
      <SearchPlacesModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPlace={handleSelectPlace}
        title={searchTarget === "PICKUP" ? "Choose Pickup Spot" : "Where to?"}
      />

      {/* Mock UPI Intent Payment Flow (Triggered on ride completion or manual trigger) */}
      {showUpiPaymentModal && (completedRideData || riderActiveRide) && (
        <UpiPaymentModal
          ride={(completedRideData || riderActiveRide)!}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowUpiPaymentModal(false)}
        />
      )}

      {/* Trip Summary Component (Triggered automatically once UPI payment completes) */}
      {showTripSummary && (completedRideData || riderActiveRide) && (
        <TripSummary
          ride={(completedRideData || riderActiveRide)!}
          onClose={() => {
            setShowTripSummary(false);
            setCompletedRideData(null);
            setRiderActiveRide(null);
          }}
        />
      )}

      {/* Rider Trip History Modal Drawer */}
      <RiderTripHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};
