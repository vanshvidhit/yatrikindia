import React from "react";
import { useRideStore } from "../../store/useRideStore";

export const ActiveRideSheet: React.FC = () => {
  const { currentRide, updateAcFeedback } = useRideStore();

  if (!currentRide) return null;

  // Ensure AC control is completely unmounted before pickup
  const isCarPickedUp = currentRide?.status === "ONGOING" || currentRide?.status === "IN_PROGRESS";
  const category = (currentRide?.category || currentRide?.vehicleType || "").toLowerCase();
  const isFourWheeler = ["go", "sedan", "xl", "cab", "outstation"].includes(category);

  return (
    <div className="p-4 bg-slate-900 text-white rounded-t-2xl shadow-lg border border-slate-800">
      {/* AC / Temperature Feedback ONLY after pickup */}
      {isCarPickedUp && isFourWheeler && (
        <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center justify-between">
            <span>In-Ride Comfort & AC Feedback</span>
            {currentRide.acFeedback && (
              <span className="text-[10px] text-sky-300 font-normal">
                Active: {currentRide.acFeedback.replace("_", " ")}
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateAcFeedback(currentRide.rideId || (currentRide as any).id, "AC_ON")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-sm ${
                currentRide.acFeedback === "AC_ON"
                  ? "bg-sky-500/20 text-sky-300 border-sky-500 font-bold"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              ❄️ Request AC On
            </button>
            <button
              type="button"
              onClick={() => updateAcFeedback(currentRide.rideId || (currentRide as any).id, "AC_TOO_COLD")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-sm ${
                currentRide.acFeedback === "AC_TOO_COLD"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 font-bold"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              🌡️ Moderate Temp
            </button>
            <button
              type="button"
              onClick={() => updateAcFeedback(currentRide.rideId || (currentRide as any).id, "WINDOWS_DOWN")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-sm ${
                currentRide.acFeedback === "WINDOWS_DOWN"
                  ? "bg-teal-500/20 text-teal-300 border-teal-500 font-bold"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              💨 Windows Down
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
