import React, { useState } from "react";
import { MapPin, Check, X, Compass, Building, Train, Plane, ShoppingBag, Coffee } from "lucide-react";

interface PickupLandmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLandmark?: string;
  onSaveLandmark: (landmark: string) => void;
}

const INDIAN_POPULAR_LANDMARKS = [
  { label: "Metro Gate 1 / Exit A", icon: "🚇", category: "Transit" },
  { label: "Metro Gate 2 / Exit B", icon: "🚇", category: "Transit" },
  { label: "Main Society Security Gate", icon: "🏢", category: "Residential" },
  { label: "Tech Park Visitor Gate", icon: "💼", category: "Office" },
  { label: "Airport Terminal Pillar 4", icon: "✈️", category: "Airport" },
  { label: "Airport App Cab Pickup Zone", icon: "🚖", category: "Airport" },
  { label: "Hospital Porch / Emergency", icon: "🏥", category: "Hospital" },
  { label: "Mall Main Entrance Gate", icon: "🛍️", category: "Mall" },
  { label: "Near Auto Rickshaw Stand", icon: "🛺", category: "Street" },
  { label: "Opposite Chai Point / Tea Stall", icon: "☕", category: "Landmark" },
  { label: "Beside Main Road Bus Stop", icon: "🚏", category: "Transit" },
  { label: "Near SBI / HDFC ATM Corner", icon: "🏧", category: "Commercial" },
];

export const PickupLandmarkModal: React.FC<PickupLandmarkModalProps> = ({
  isOpen,
  onClose,
  currentLandmark,
  onSaveLandmark,
}) => {
  const [selectedTag, setSelectedTag] = useState(currentLandmark || "");
  const [customNote, setCustomNote] = useState(
    INDIAN_POPULAR_LANDMARKS.some((l) => l.label === currentLandmark) ? "" : currentLandmark || ""
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const finalLandmark = customNote.trim() || selectedTag;
    onSaveLandmark(finalLandmark);
    onClose();
  };

  const handleClear = () => {
    setSelectedTag("");
    setCustomNote("");
    onSaveLandmark("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Specify Exact Pickup Landmark</h3>
              <p className="text-[11px] text-slate-400">Helps Captain spot you without phone calls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1">
            Custom Landmark or Gate Note
          </label>
          <div className="relative">
            <input
              type="text"
              value={customNote}
              onChange={(e) => {
                setCustomNote(e.target.value);
                if (e.target.value) setSelectedTag("");
              }}
              placeholder="e.g. Near Indrapuri BHEL Gate, wearing blue jacket"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Quick Indian Landmark Chips */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
            Or choose a common meeting spot:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {INDIAN_POPULAR_LANDMARKS.map((item) => {
              const isChosen = selectedTag === item.label && !customNote;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedTag(item.label);
                    setCustomNote("");
                  }}
                  className={`py-2 px-2.5 rounded-xl text-left border text-xs flex items-center gap-2 transition-all ${
                    isChosen
                      ? "bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md shadow-amber-400/20"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <span className="text-[11px] truncate leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver HUD preview notice */}
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>This landmark will be highlighted on the Captain's GPS screen upon arrival.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          {currentLandmark && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/20"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Confirm Landmark</span>
          </button>
        </div>
      </div>
    </div>
  );
};
