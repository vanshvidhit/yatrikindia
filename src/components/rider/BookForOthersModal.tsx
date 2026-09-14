import React, { useState } from "react";
import { User, Users, Phone, Check, X, Shield, Info, Heart } from "lucide-react";
import { PassengerBookingDetails } from "../../types";

interface BookForOthersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDetails?: PassengerBookingDetails;
  riderName: string;
  onSave: (details: PassengerBookingDetails | undefined) => void;
}

const PRESET_RELATIONS = [
  { id: "PARENT", label: "Father / Mother", icon: "👨‍👩‍👦" },
  { id: "SPOUSE", label: "Spouse", icon: "💍" },
  { id: "CHILD", label: "Son / Daughter", icon: "👶" },
  { id: "FRIEND", label: "Friend", icon: "🤝" },
  { id: "COLLEAGUE", label: "Colleague", icon: "💼" },
  { id: "OTHER", label: "Other", icon: "👤" },
] as const;

export const BookForOthersModal: React.FC<BookForOthersModalProps> = ({
  isOpen,
  onClose,
  currentDetails,
  riderName,
  onSave,
}) => {
  const [isForOther, setIsForOther] = useState(currentDetails?.isForOther || false);
  const [passengerName, setPassengerName] = useState(currentDetails?.passengerName || "");
  const [passengerPhone, setPassengerPhone] = useState(
    currentDetails?.passengerPhone ? currentDetails.passengerPhone.replace("+91 ", "") : ""
  );
  const [relationship, setRelationship] = useState<PassengerBookingDetails["relationship"]>(
    currentDetails?.relationship || "PARENT"
  );
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!isForOther) {
      onSave(undefined);
      onClose();
      return;
    }

    const cleanPhone = passengerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!passengerName.trim()) {
      setPhoneError("Please enter passenger's full name");
      return;
    }

    setPhoneError("");
    onSave({
      isForOther: true,
      passengerName: passengerName.trim(),
      passengerPhone: `+91 ${cleanPhone.slice(-10)}`,
      relationship,
    });
    onClose();
  };

  const handleResetToMyself = () => {
    setIsForOther(false);
    onSave(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Who is taking this ride?</h3>
              <p className="text-[11px] text-slate-400">Book for yourself or family & friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Pill */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setIsForOther(false)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              !isForOther
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Myself ({riderName.split(" ")[0]})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsForOther(true)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isForOther
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Someone Else</span>
          </button>
        </div>

        {/* If Booking for Someone Else */}
        {isForOther ? (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Relationship Chips */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                Who are you booking for?
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESET_RELATIONS.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => {
                      setRelationship(rel.id);
                      if (!passengerName) {
                        setPassengerName(rel.label);
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      relationship === rel.id
                        ? "bg-slate-800 text-amber-300 border-amber-400/60 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span>{rel.icon}</span>
                    <span className="truncate">{rel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Passenger Name Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Passenger Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Ramesh Mehta / Papa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Passenger Phone Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Passenger Mobile Number (for Driver SMS & OTP)
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-amber-400">
                <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1 border-r border-slate-700 pr-2">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
              {phoneError && (
                <div className="text-[10px] text-rose-400 mt-1 font-medium">{phoneError}</div>
              )}
            </div>

            {/* Verification & Trust Banner */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-2.5 text-slate-400 text-[11px] leading-relaxed">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-bold">Automatic SMS & OTP Routing:</span>
                {" "}The Captain will receive <span className="text-white font-semibold">{passengerName || "the passenger's"}</span> name. They will be sent driver contact info and OTP directly.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-white">Booking for {riderName}</div>
            <div className="text-[11px] text-slate-400">
              Trip updates, driver calls, and OTP will be routed to your phone.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          {currentDetails?.isForOther && (
            <button
              type="button"
              onClick={handleResetToMyself}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Reset to Myself
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/20"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isForOther ? "Confirm Passenger Details" : "Done"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
