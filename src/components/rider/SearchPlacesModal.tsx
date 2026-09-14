import React, { useState, useEffect } from "react";
import { Search, MapPin, X, Clock, Plane, Building, Navigation, ChevronRight } from "lucide-react";
import { searchPlacesApi } from "../../services/api";
import { PlaceItem } from "../../types";

interface SearchPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: PlaceItem) => void;
  title?: string;
}

export const SearchPlacesModal: React.FC<SearchPlacesModalProps> = ({
  isOpen,
  onClose,
  onSelectPlace,
  title = "Where to?",
}) => {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      const results = await searchPlacesApi(query);
      setPlaces(results);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 max-h-[85%] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative my-3">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Bhopal, Indrapuri, MP Nagar, Station..."
            className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Bhopal Destination Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => {
              onSelectPlace({
                id: "p-indrapuri-c",
                title: "Indrapuri Sector C (My Location)",
                subtitle: "Raisen Road, BHEL Township, Bhopal, MP 462022",
                coords: { lat: 23.2517, lng: 77.4650 },
                category: "HOME",
              });
              onClose();
            }}
            className="shrink-0 px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-medium"
          >
            <MapPin className="w-3 h-3 text-blue-400" />
            <span>Indrapuri Sec-C</span>
          </button>
          <button
            onClick={() => {
              onSelectPlace({
                id: "p2",
                title: "DB City Mall & MP Nagar Zone-1",
                subtitle: "Arera Hills, MP Nagar, Bhopal, MP",
                coords: { lat: 23.2332, lng: 77.4326 },
                category: "COMMERCIAL",
              });
              onClose();
            }}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium"
          >
            DB City Mall
          </button>
          <button
            onClick={() => {
              onSelectPlace({
                id: "p3",
                title: "Rani Kamlapati Railway Station",
                subtitle: "Habibganj, Bhopal, MP",
                coords: { lat: 23.2064, lng: 77.4410 },
                category: "TRANSIT",
              });
              onClose();
            }}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium"
          >
            Rani Kamlapati (RKMP)
          </button>
          <button
            onClick={() => {
              onSelectPlace({
                id: "p4",
                title: "AIIMS Bhopal & Saket Nagar",
                subtitle: "Saket Nagar, Habibganj, Bhopal, MP",
                coords: { lat: 23.2067, lng: 77.4589 },
                category: "HEALTH",
              });
              onClose();
            }}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium"
          >
            AIIMS Bhopal
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
          {loading && (
            <div className="text-center py-6 text-xs text-slate-500">
              Searching geospatial index...
            </div>
          )}

          {!loading && places.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching locations found.
            </div>
          )}

          {places.map((place, idx) => {
            let IconComponent = MapPin;
            if (place.category === "AIRPORT") IconComponent = Plane;
            if (place.category === "TECH_HUB") IconComponent = Building;
            if (place.category === "TRANSIT") IconComponent = Navigation;

            return (
              <button
                key={`place-${place.id}-${idx}`}
                onClick={() => {
                  onSelectPlace(place);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700/60 group-hover:bg-blue-600/20 text-slate-300 group-hover:text-blue-400 flex items-center justify-center transition-colors">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {place.title}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">
                      {place.subtitle}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
