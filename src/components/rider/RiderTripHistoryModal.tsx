import React, { useState } from "react";
import {
  Clock,
  MapPin,
  Car,
  Package,
  Plane,
  Star,
  Receipt,
  MessageSquare,
  Award,
  ChevronRight,
  Search,
  Filter,
  X,
  ShieldCheck,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";
import { RideHistoryItem, ServiceMode } from "../../types";
import { VEHICLE_SPEC_MAP } from "../../data/vehicleSpecs";

interface RiderTripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderTripHistoryModal: React.FC<RiderTripHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { riderRideHistory, updateRideFeedback } = useRideStore();
  const [filterMode, setFilterMode] = useState<ServiceMode | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRide, setSelectedRide] = useState<RideHistoryItem | null>(null);

  // Quick in-history rating state
  const [editingFeedbackRideId, setEditingFeedbackRideId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  if (!isOpen) return null;

  const filteredHistory = riderRideHistory.filter((item) => {
    const matchesFilter = filterMode === "ALL" || item.serviceMode === filterMode;
    const matchesQuery =
      searchQuery.trim() === "" ||
      item.pickup.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.drop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rideId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleSaveFeedbackInHistory = (rideId: string) => {
    updateRideFeedback(rideId, editRating, editComment, 0);
    setEditingFeedbackRideId(null);
  };

  return (
    <div
      id="rider-trip-history-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Ride & Activity History</h2>
              <p className="text-[11px] text-slate-400">
                {riderRideHistory.length} total rides with ratings & driver feedback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-950/40">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, address or captain..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterMode === "ALL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All Rides
            </button>
            <button
              onClick={() => setFilterMode("CITY_RIDE")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterMode === "CITY_RIDE"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              City Cabs
            </button>
            <button
              onClick={() => setFilterMode("PARCEL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterMode === "PARCEL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Parcels
            </button>
            <button
              onClick={() => setFilterMode("OUTSTATION")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterMode === "OUTSTATION"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Outstation
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Car className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-xs">No rides found matching your criteria</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const isEditing = editingFeedbackRideId === item.rideId;

              return (
                <div
                  key={item.rideId}
                  className="bg-slate-850 border border-slate-700/70 hover:border-slate-600 rounded-2xl p-3.5 space-y-3 transition-colors shadow-sm"
                >
                  {/* Top Bar: Date, Vehicle, Total */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                        {item.serviceMode === "PARCEL" ? (
                          <Package className="w-3.5 h-3.5" />
                        ) : item.serviceMode === "OUTSTATION" ? (
                          <Plane className="w-3.5 h-3.5" />
                        ) : (
                          <Car className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs">{item.vehicleType}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-400 font-mono">
                        ₹{item.totalPaid.toFixed(2)}
                      </span>
                      {item.tipAmount > 0 && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          incl. ₹{item.tipAmount.toFixed(2)} tip
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Route Summary */}
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                      <div className="text-[11px] text-slate-300 truncate">
                        {item.pickup.address}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
                      <div className="text-[11px] text-slate-300 truncate">
                        {item.drop.address}
                      </div>
                    </div>
                  </div>

                  {/* Captain & Vehicle Details */}
                  <div className="p-2 bg-slate-900/80 rounded-xl flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                        {item.driver.name.charAt(0)}
                      </div>
                      <span className="text-slate-200 font-medium">{item.driver.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {item.driver.vehicleNumber}
                      </span>
                    </div>

                    <div className="text-slate-400 font-mono text-[10px]">
                      {item.distanceKm} km • {item.durationMin}m
                    </div>
                  </div>

                  {/* Rating & Written Comments Box */}
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-400">Rider Review:</span>
                        {item.rating ? (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= item.rating! ? "fill-amber-400" : "text-slate-700"
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-amber-300 ml-1 font-mono">
                              {item.rating}.0
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Not rated</span>
                        )}
                      </div>

                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingFeedbackRideId(item.rideId);
                            setEditRating(item.rating || 5);
                            setEditComment(item.feedbackComments || "");
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          {item.rating ? "Edit Feedback" : "Leave Review"}
                        </button>
                      )}
                    </div>

                    {/* Inline edit feedback mode */}
                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setEditRating(s)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  s <= editRating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Update your comments..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setEditingFeedbackRideId(null)}
                            className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveFeedbackInHistory(item.rideId)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Display Written Review Comments */}
                        {item.feedbackComments && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-300 pt-0.5">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="italic text-[11px] text-slate-200">
                              "{item.feedbackComments}"
                            </p>
                          </div>
                        )}

                        {/* Compliments tags */}
                        {item.compliments && item.compliments.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.compliments.map((comp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-medium"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* AC Feedback Tag (Car rides only) */}
                        {item.acFeedback && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-medium">
                              <span>❄️</span>
                              <span>AC: {item.acFeedback.replace("_", " ")}</span>
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
