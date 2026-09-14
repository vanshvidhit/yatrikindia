import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ShieldAlert,
  PhoneCall,
  Share2,
  AlertTriangle,
  X,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Users,
  Copy,
  Check,
  Activity,
  Phone,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";
import { emergencyAlertService } from "../../services/emergencyAlertService";
import { EmergencyAlertBroadcast } from "../../types";

interface SafetySOSSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOLD_DURATION_MS = 3000;

export const SafetySOSSheet: React.FC<SafetySOSSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    safetyAlert,
    riderLocation,
    emergencyContacts,
    activeSOSBroadcast,
    triggerSOSAlert,
    dismissSafetyAlert,
    brandName,
  } = useRideStore();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [sharedContacts, setSharedContacts] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveBroadcast, setLiveBroadcast] =
    useState<EmergencyAlertBroadcast | null>(activeSOSBroadcast);

  const holdStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isTriggeredRef = useRef(false);

  useEffect(() => {
    const unsub = emergencyAlertService.subscribe((broadcast) => {
      setLiveBroadcast(broadcast);
    });
    return unsub;
  }, []);

  const primaryContact =
    emergencyContacts.find((c) => c.isPrimary) || emergencyContacts[0];

  const cancelHold = useCallback(() => {
    if (isTriggeredRef.current) return;
    setIsHolding(false);
    holdStartRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  const executeSOSTrigger = useCallback(async () => {
    isTriggeredRef.current = true;
    setIsHolding(false);
    setHoldProgress(100);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch (e) {
        // ignore
      }
    }

    await triggerSOSAlert("Emergency SOS Triggered via Hold Action");
    setTimeout(() => {
      isTriggeredRef.current = false;
    }, 1000);
  }, [triggerSOSAlert]);

  const startHold = useCallback(() => {
    if (safetyAlert || activeSOSBroadcast) return;
    isTriggeredRef.current = false;
    setIsHolding(true);
    holdStartRef.current = Date.now();

    const tick = () => {
      if (!holdStartRef.current) return;
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);

      if (elapsed >= HOLD_DURATION_MS) {
        executeSOSTrigger();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [safetyAlert, activeSOSBroadcast, executeSOSTrigger]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isOpen && !safetyAlert) return null;

  const handleShareTrip = () => {
    const link =
      liveBroadcast?.googleMapsUrl ||
      `https://www.google.com/maps?q=${riderLocation.lat.toFixed(6)},${riderLocation.lng.toFixed(6)}`;
    navigator.clipboard.writeText(link);
    setSharedContacts(true);
    setTimeout(() => setSharedContacts(false), 3000);
  };

  const handleCopyLink = () => {
    const link =
      liveBroadcast?.googleMapsUrl ||
      `https://www.google.com/maps?q=${riderLocation.lat.toFixed(6)},${riderLocation.lng.toFixed(6)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const secondsRemaining = Math.max(
    0,
    (HOLD_DURATION_MS * (100 - holdProgress)) / 100 / 1000
  ).toFixed(1);

  const isAlertActive = !!(safetyAlert || activeSOSBroadcast || liveBroadcast);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{brandName} Safety Toolkit</h2>
              <p className="text-[11px] text-slate-400">24/7 Monitored Safety Protocol</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isAlertActive) {
                dismissSafetyAlert();
              }
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Deviation Warning */}
        {safetyAlert?.isDeviation && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Route Deviation Detected: </span>
              {safetyAlert.reason}. Safety team alerted.
            </div>
          </div>
        )}

        {/* SOS Button or Active Broadcast */}
        {isAlertActive ? (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl space-y-2.5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-rose-600/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-rose-200 uppercase tracking-wider">
              EMERGENCY SOS ACTIVE
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Live GPS telemetry, Google Maps tracking link & incident dispatch broadcasted to emergency contacts.
            </p>

            {/* Broadcast Coordinates */}
            <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-white">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {riderLocation.lat.toFixed(5)}, {riderLocation.lng.toFixed(5)}
              </span>
              <button
                onClick={handleCopyLink}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>

            {/* Broadcast Logs */}
            {liveBroadcast?.logs && (
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-24 overflow-y-auto text-left space-y-1 font-mono text-[9px]">
                {liveBroadcast.logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-slate-300 flex items-start gap-1">
                    <span className="text-emerald-400 font-bold">[{log.channel}]</span>
                    <span className="truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => dismissSafetyAlert()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel SOS (I Am Safe)
            </button>
          </div>
        ) : (
          <div className="text-center py-2 space-y-2">
            {/* 3-Second Hold Button */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-3">
              {isHolding && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-rose-900/50 via-red-800/40 to-rose-600/30 transition-all duration-75 pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
              )}
              <button
                type="button"
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative z-10 w-full py-3.5 rounded-xl font-black tracking-wider text-white flex items-center justify-center gap-2 text-xs uppercase transition-all select-none touch-none ${
                  isHolding
                    ? "bg-rose-600 shadow-xl shadow-rose-600/50 scale-98"
                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/30"
                }`}
              >
                <ShieldAlert className={`w-4 h-4 ${isHolding ? "animate-spin" : "animate-pulse"}`} />
                <span>{isHolding ? `HOLD FOR ${secondsRemaining}s...` : "HOLD 3S FOR EMERGENCY SOS"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-400" />
                Contact: {primaryContact.name} ({primaryContact.phone})
              </span>
              <span className="text-emerald-400">GPS Locked</span>
            </div>
          </div>
        )}

        {/* Quick Safety Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleShareTrip}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl flex flex-col items-center text-center gap-1 border border-slate-700 transition-colors"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-white">Share Live Trip</span>
            <span className="text-[10px] text-slate-400">
              {sharedContacts ? "Map Link Copied! ✓" : "Send link to family"}
            </span>
          </button>

          <button
            onClick={() => window.open("tel:911")}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl flex flex-col items-center text-center gap-1 border border-slate-700 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">Call 911 / Police</span>
            <span className="text-[10px] text-slate-400">Direct emergency helpline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
