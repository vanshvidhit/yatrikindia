import React from "react";
import { X, Check, Wind, Volume2, VolumeX, Radio, Briefcase, Navigation, Languages, Sparkles } from "lucide-react";
import { RidePreferences } from "../../types";

interface RidePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: RidePreferences;
  onSave: (prefs: RidePreferences) => void;
  selectedVehicleType?: string;
  hasCNGCylinder?: boolean;
}

export const DEFAULT_RIDE_PREFERENCES: RidePreferences = {
  acMode: "COOL_MAX",
  conversation: "QUIET",
  luggage: "NONE",
  routePreference: "FASTEST_TOLLS",
  driverLanguage: "ANY",
};

export const RidePreferencesModal: React.FC<RidePreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave,
  selectedVehicleType,
  hasCNGCylinder,
}) => {
  const [draft, setDraft] = React.useState<RidePreferences>(preferences || DEFAULT_RIDE_PREFERENCES);

  React.useEffect(() => {
    if (isOpen) {
      setDraft(preferences || DEFAULT_RIDE_PREFERENCES);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const isACVehicle = selectedVehicleType !== "BIKE" && selectedVehicleType !== "SCOOTY";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">Cabin Ride Preferences</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  Premium Tier
                </span>
              </div>
              <p className="text-xs text-slate-400">Pre-set cabin atmosphere & comfort for your trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: AC Cooling (Vital for Indian commute) */}
        {isACVehicle && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cabin AC & Climate</span>
              </label>
              <span className="text-[11px] text-cyan-400 font-semibold">100% AC Guaranteed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, acMode: "COOL_MAX" }))}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  draft.acMode === "COOL_MAX"
                    ? "bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 text-white shadow-lg"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">❄️</span>
                  {draft.acMode === "COOL_MAX" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Chilled AC</div>
                  <div className="text-[10px] text-slate-400">Max cool (18°-20°C)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, acMode: "COMFORT_24" }))}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  draft.acMode === "COMFORT_24"
                    ? "bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 text-white shadow-lg"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">🍃</span>
                  {draft.acMode === "COMFORT_24" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Comfort 24°C</div>
                  <div className="text-[10px] text-slate-400">Gentle cooling</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, acMode: "FRESH_AIR" }))}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  draft.acMode === "FRESH_AIR"
                    ? "bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 text-white shadow-lg"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">💨</span>
                  {draft.acMode === "FRESH_AIR" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Fresh Air</div>
                  <div className="text-[10px] text-slate-400">Windows down</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Conversation & Noise Preference */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Conversation & Atmosphere</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, conversation: "QUIET" }))}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                draft.conversation === "QUIET"
                  ? "bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <VolumeX className="w-4 h-4 text-indigo-400" />
                {draft.conversation === "QUIET" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Quiet Commute</div>
                <div className="text-[10px] text-slate-400">Rest / Work in silence</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, conversation: "FRIENDLY" }))}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                draft.conversation === "FRIENDLY"
                  ? "bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                {draft.conversation === "FRIENDLY" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Friendly Chat</div>
                <div className="text-[10px] text-slate-400">Open to discussion</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, conversation: "MUSIC" }))}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                draft.conversation === "MUSIC"
                  ? "bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Radio className="w-4 h-4 text-amber-400" />
                {draft.conversation === "MUSIC" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Soft FM / Music</div>
                <div className="text-[10px] text-slate-400">Low-volume radio</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Luggage & Trunk Clearance (India Specific) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Luggage & Boot Trunk Needs</span>
            </label>
            {hasCNGCylinder && (
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                ⚠️ 60L CNG in Sedan
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, luggage: "NONE" }))}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                draft.luggage === "NONE"
                  ? "bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🎒</span>
                {draft.luggage === "NONE" && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Backpack Only</div>
                <div className="text-[10px] text-slate-400">No trunk needed</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, luggage: "LIGHT" }))}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                draft.luggage === "LIGHT"
                  ? "bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">🧳</span>
                {draft.luggage === "LIGHT" && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">1 Medium Bag</div>
                <div className="text-[10px] text-slate-400">Fits with CNG</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, luggage: "HEAVY_BOOT" }))}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                draft.luggage === "HEAVY_BOOT"
                  ? "bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-base">✈️</span>
                {draft.luggage === "HEAVY_BOOT" && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Heavy / Airport</div>
                <div className="text-[10px] text-slate-400">Full clear trunk</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 4: Route & Expressway Toll Preference */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Route & Expressway Preference</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, routePreference: "FASTEST_TOLLS" }))}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                draft.routePreference === "FASTEST_TOLLS"
                  ? "bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>⚡ Fastest via Tolls</span>
                </div>
                <div className="text-[10px] text-slate-400">Fastag enabled flyovers/expressway</div>
              </div>
              {draft.routePreference === "FASTEST_TOLLS" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setDraft((p) => ({ ...p, routePreference: "AVOID_TOLLS" }))}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                draft.routePreference === "AVOID_TOLLS"
                  ? "bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400/50 text-white shadow-lg"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🌿 Avoid Tolls</span>
                </div>
                <div className="text-[10px] text-slate-400">Main arterial city roads</div>
              </div>
              {draft.routePreference === "AVOID_TOLLS" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Section 5: Driver Communication Language */}
        <div className="space-y-2">
          <label className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Languages className="w-3.5 h-3.5 text-purple-400" />
            <span>Driver Language</span>
          </label>
          <div className="flex gap-2">
            {[
              { id: "ANY", label: "Any Language" },
              { id: "HINDI", label: "Hindi / Hinglish" },
              { id: "ENGLISH", label: "English" },
              { id: "LOCAL", label: "Regional Language" },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setDraft((p) => ({ ...p, driverLanguage: lang.id as any }))}
                className={`flex-1 py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  draft.driverLanguage === lang.id
                    ? "bg-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400/40"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 font-black text-slate-950 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Check className="w-4 h-4" />
          <span>Confirm Cabin Preferences</span>
        </button>
      </div>
    </div>
  );
};
