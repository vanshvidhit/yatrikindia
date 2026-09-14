import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Phone,
  Radio,
  Send,
  Check,
  X,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Copy,
  Clock,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";
import { emergencyAlertService } from "../../services/emergencyAlertService";
import { EmergencyAlertBroadcast } from "../../types";

interface SOSTriggerButtonProps {
  className?: string;
  variant?: "floating-badge" | "full-card" | "compact-icon";
}

const HOLD_DURATION_MS = 3000;

export const SOSTriggerButton: React.FC<SOSTriggerButtonProps> = ({
  className = "",
  variant = "floating-badge",
}) => {
  const {
    riderLocation,
    riderAuth,
    emergencyContacts,
    safetyAlert,
    activeSOSBroadcast,
    triggerSOSAlert,
    dismissSafetyAlert,
  } = useRideStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveBroadcast, setLiveBroadcast] = useState<EmergencyAlertBroadcast | null>(
    activeSOSBroadcast
  );

  const holdStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isTriggeredRef = useRef(false);

  // Subscribe to real-time broadcast updates
  useEffect(() => {
    const unsub = emergencyAlertService.subscribe((broadcast) => {
      setLiveBroadcast(broadcast);
    });
    return unsub;
  }, []);

  const primaryContact =
    emergencyContacts.find((c) => c.isPrimary) || emergencyContacts[0];

  // Cancel hold helper
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

  // Execute actual SOS trigger
  const executeSOSTrigger = useCallback(async () => {
    isTriggeredRef.current = true;
    setIsHolding(false);
    setHoldProgress(100);

    // Haptic feedback if available
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch (e) {
        // ignore
      }
    }

    await triggerSOSAlert("Emergency SOS Triggered via 3-Second Hold");
    setIsModalOpen(true);

    setTimeout(() => {
      isTriggeredRef.current = false;
    }, 1000);
  }, [triggerSOSAlert]);

  // Hold loop handler
  const startHold = useCallback(() => {
    if (safetyAlert || activeSOSBroadcast) {
      setIsModalOpen(true);
      return;
    }

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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleCopyMapLink = () => {
    const link =
      liveBroadcast?.googleMapsUrl ||
      `https://www.google.com/maps?q=${riderLocation.lat.toFixed(6)},${riderLocation.lng.toFixed(6)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleResolveAlert = () => {
    dismissSafetyAlert();
    setIsModalOpen(false);
    setHoldProgress(0);
  };

  const secondsRemaining = Math.max(
    0,
    (HOLD_DURATION_MS * (100 - holdProgress)) / 100 / 1000
  ).toFixed(1);

  // SVG Circular calculation for 3s hold ring
  const circleRadius = 22;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  const isAlertActive = !!(safetyAlert || activeSOSBroadcast || liveBroadcast);

  return (
    <div className={`relative ${className}`}>
      {/* 1. Header Trigger Pill */}
      {variant === "floating-badge" && (
        <div className="relative flex items-center">
          <button
            type="button"
            id="sos-trigger-button"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
              // If already active or quick tap, open modal to allow hold or view status
              setIsModalOpen(true);
            }}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border transition-all duration-200 shadow-xl select-none touch-none ${
              isAlertActive
                ? "bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/50 animate-pulse"
                : isHolding
                ? "bg-rose-950 border-rose-500 text-white scale-105 shadow-rose-600/50"
                : "bg-slate-900/90 hover:bg-slate-850 border-slate-700/80 hover:border-rose-500/50 text-slate-300"
            }`}
            title="Emergency SOS (Hold 3s to broadcast live coordinates)"
          >
            {/* SVG Hold Ring Overlay on trigger */}
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              {isHolding && (
                <svg
                  className="absolute inset-0 -rotate-90 w-5 h-5"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r={circleRadius}
                    fill="none"
                    stroke="rgba(244, 63, 94, 0.3)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={circleRadius}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isAlertActive
                    ? "bg-rose-600 text-white"
                    : isHolding
                    ? "bg-rose-500 text-white"
                    : "bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white"
                } transition-colors`}
              >
                <ShieldAlert className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span
                  className={`text-[11px] font-black tracking-wider ${
                    isAlertActive || isHolding ? "text-rose-400" : "text-white"
                  }`}
                >
                  {isAlertActive ? "SOS ACTIVE" : isHolding ? `HOLD ${secondsRemaining}s` : "SOS"}
                </span>
                {!isAlertActive && !isHolding && (
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono hidden sm:inline">
                    Safety
                  </span>
                )}
              </div>
            </div>

            {/* Small active pulse dot */}
            {isAlertActive && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* 2. Full Emergency Safety Modal & Live Broadcast Monitor */}
      {isModalOpen && (
        <div
          id="sos-emergency-modal"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                    isAlertActive
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    Emergency Safety SOS
                    {isAlertActive && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-400 font-mono font-bold uppercase">
                        Active Alert
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live Telemetry & Contact Dispatch
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Alert is NOT Active yet: Interactive 3-Second Hold Trigger Zone */}
            {!isAlertActive ? (
              <div className="space-y-3.5 py-1">
                {/* Hold to Activate Big Button */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                  {/* Background Progress Fill Bar */}
                  {isHolding && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-rose-900/40 via-red-800/40 to-rose-600/30 transition-all duration-75 pointer-events-none"
                      style={{ width: `${holdProgress}%` }}
                    />
                  )}

                  <div className="relative z-10 space-y-2.5 flex flex-col items-center">
                    <button
                      type="button"
                      id="sos-hold-trigger-large"
                      onPointerDown={startHold}
                      onPointerUp={cancelHold}
                      onPointerLeave={cancelHold}
                      onContextMenu={(e) => e.preventDefault()}
                      className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none touch-none shadow-2xl cursor-pointer ${
                        isHolding
                          ? "bg-gradient-to-tr from-rose-600 to-red-500 scale-105 shadow-rose-600/70 ring-4 ring-rose-400/50"
                          : "bg-gradient-to-tr from-rose-700 to-red-600 hover:scale-102 shadow-rose-900/60 ring-2 ring-rose-500/30"
                      }`}
                    >
                      {/* SVG Circle Progress */}
                      <svg
                        className="absolute inset-0 -rotate-90 w-24 h-24 pointer-events-none"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="44"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.15)"
                          strokeWidth="6"
                        />
                        {isHolding && (
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 44}
                            strokeDashoffset={
                              2 * Math.PI * 44 * (1 - holdProgress / 100)
                            }
                            strokeLinecap="round"
                          />
                        )}
                      </svg>

                      <ShieldAlert className="w-8 h-8 text-white stroke-[2.2]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider mt-0.5">
                        {isHolding ? `${secondsRemaining}s` : "SOS"}
                      </span>
                    </button>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">
                        {isHolding
                          ? "Keep Holding for Emergency Broadcast..."
                          : "Hold 3 Seconds to Activate"}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Prevents accidental triggers • Release to cancel
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pre-defined Emergency Contact Preview */}
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Pre-defined Emergency Contact:
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono">
                      Automated SMS
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {primaryContact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">
                          {primaryContact.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {primaryContact.relationship} • {primaryContact.phone}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  {/* Location to be broadcasted */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      Live GPS: {riderLocation.lat.toFixed(5)},{" "}
                      {riderLocation.lng.toFixed(5)}
                    </span>
                    <span className="font-mono text-emerald-400">GPS Locked</span>
                  </div>
                </div>
              </div>
            ) : (
              /* 3. ACTIVE LIVE BROADCAST MONITOR */
              <div className="space-y-3 py-1">
                {/* Active Status Banner */}
                <div className="p-3.5 bg-rose-950/60 border border-rose-600/50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                      </span>
                      <span className="text-xs font-black text-rose-300 uppercase tracking-wider">
                        Live Emergency Broadcast Active
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">
                      ID: {liveBroadcast?.alertId || "SOS-ACTIVE"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-200 leading-snug">
                    Your real-time GPS telemetry and incident packet have been
                    broadcasted via the background alert service to your
                    emergency contacts.
                  </p>
                </div>

                {/* Live Coordinates Card with Copy Link */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      Broadcasted Coordinates
                    </span>
                    <button
                      onClick={handleCopyMapLink}
                      className="px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-blue-400 border border-slate-700 text-[10px] flex items-center gap-1 transition-colors"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Map Link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-white">
                    <span>
                      {riderLocation.lat.toFixed(6)}, {riderLocation.lng.toFixed(6)}
                    </span>
                    <a
                      href={
                        liveBroadcast?.googleMapsUrl ||
                        `https://www.google.com/maps?q=${riderLocation.lat},${riderLocation.lng}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 text-[10px]"
                    >
                      <span>Open Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Background Service Alert Logs Stream */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    Background Alert Service Feed
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 max-h-32 overflow-y-auto space-y-1.5 font-mono text-[10px]">
                    {liveBroadcast?.logs && liveBroadcast.logs.length > 0 ? (
                      liveBroadcast.logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-1.5 text-slate-300 pb-1 border-b border-slate-900 last:border-0 last:pb-0"
                        >
                          <span
                            className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                              log.channel === "SMS"
                                ? "bg-blue-500/20 text-blue-300"
                                : log.channel === "GPS_BEACON"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-purple-500/20 text-purple-300"
                            }`}
                          >
                            {log.channel}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-slate-400 font-semibold">
                              {log.recipient}:
                            </span>{" "}
                            <span className="text-slate-200">{log.message}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-center py-1">
                        Dispatching background telemetry packets...
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Action Buttons (Call 911 / Call Contact / Resolve) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      window.open(`tel:${primaryContact.phone.replace(/[^0-9+]/g, "")}`)
                    }
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Call {primaryContact.name.split(" ")[0]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open("tel:911")}
                    className="p-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors shadow-lg shadow-rose-900/40"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Police (911)</span>
                  </button>
                </div>

                {/* Resolve Alert / False Alarm */}
                <button
                  type="button"
                  id="sos-resolve-btn"
                  onClick={handleResolveAlert}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>I Am Safe • Cancel SOS Alarm</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
