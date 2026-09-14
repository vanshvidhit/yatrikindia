import React from "react";
import { VehicleType } from "../../types";

interface PremiumVehicleIconProps {
  type: VehicleType;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  selected?: boolean;
}

export const PremiumVehicleIcon: React.FC<PremiumVehicleIconProps> = ({
  type,
  size = "md",
  className = "",
  selected = false,
}) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const containerSize = sizeMap[size] || sizeMap.md;

  if (type === "BIKE") {
    // Rapido-style Sports Moto Bike
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="bike-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE033" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="bike-tire" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="bike-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Speed streaks */}
          <path d="M4 28 L14 28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M2 34 L10 34" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

          {/* Rear Wheel */}
          <circle cx="15" cy="42" r="10" fill="url(#bike-tire)" stroke="#475569" strokeWidth="1.5" />
          <circle cx="15" cy="42" r="6" fill="#1E293B" />
          <circle cx="15" cy="42" r="3" fill="url(#bike-rim)" />
          {/* Spokes */}
          <line x1="15" y1="36" x2="15" y2="48" stroke="#64748B" strokeWidth="1" />
          <line x1="9" y1="42" x2="21" y2="42" stroke="#64748B" strokeWidth="1" />

          {/* Front Wheel */}
          <circle cx="49" cy="42" r="10" fill="url(#bike-tire)" stroke="#475569" strokeWidth="1.5" />
          <circle cx="49" cy="42" r="6" fill="#1E293B" />
          <circle cx="49" cy="42" r="3" fill="url(#bike-rim)" />
          {/* Spokes */}
          <line x1="49" y1="36" x2="49" y2="48" stroke="#64748B" strokeWidth="1" />
          <line x1="43" y1="42" x2="55" y2="42" stroke="#64748B" strokeWidth="1" />

          {/* Chassis Frame & Swingarm */}
          <path
            d="M15 42 L26 36 L38 36 L49 42"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Engine block */}
          <rect x="25" y="35" width="12" height="9" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
          <line x1="28" y1="38" x2="34" y2="38" stroke="#94A3B8" strokeWidth="1" />
          <line x1="28" y1="41" x2="34" y2="41" stroke="#94A3B8" strokeWidth="1" />

          {/* Exhaust Pipe */}
          <path
            d="M32 42 L22 43 L12 45"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Fuel Tank & Sport Seat Bodywork */}
          <path
            d="M20 30 C20 30 24 24 33 24 C40 24 43 28 45 32 L36 33 L24 33 Z"
            fill="url(#bike-gold)"
          />
          {/* Seat Cushion */}
          <path
            d="M18 31 C20 29 27 29 30 31 L28 34 L18 33 Z"
            fill="#0F172A"
          />

          {/* Front Fork & Handlebar */}
          <line x1="49" y1="42" x2="43" y2="23" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          {/* Handlebar Grips */}
          <path d="M40 21 L45 22 L46 25" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Headlamp Windshield & LED */}
          <path d="M44 24 L48 26 L46 30 Z" fill="#F8FAFC" />
          {/* Headlight beam */}
          <polygon points="48,27 58,22 58,34" fill="#FEF08A" opacity="0.35" />

          {/* Rider Helmet Silhouette */}
          <circle cx="31" cy="18" r="4.5" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.2" />
          <path d="M33 18 L36 19" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (type === "AUTO") {
    // Signature Indian Auto Rickshaw (Yellow Canopy, Green/Black Lower Chassis)
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="auto-hood-yellow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="auto-chassis-green" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <linearGradient id="auto-glass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Rear Wheel */}
          <circle cx="17" cy="45" r="8" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <circle cx="17" cy="45" r="4" fill="#E2E8F0" />

          {/* Front Single Wheel */}
          <circle cx="51" cy="45" r="8" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <circle cx="51" cy="45" r="4" fill="#E2E8F0" />

          {/* Lower Body Shell / Chassis (Traditional Auto Green/Black) */}
          <path
            d="M12 40 L12 34 C12 32 14 31 17 31 L45 31 C49 31 52 34 54 38 L54 44 L46 44 L44 40 L22 40 L20 44 L14 44 Z"
            fill="url(#auto-chassis-green)"
            stroke="#0F172A"
            strokeWidth="1.2"
          />

          {/* Yellow Curved Roof / Hood */}
          <path
            d="M11 32 C11 20 18 16 30 16 L42 16 C48 16 52 20 53 27 L51 31 L14 31 Z"
            fill="url(#auto-hood-yellow)"
            stroke="#A16207"
            strokeWidth="1.2"
          />

          {/* Roof Ridge highlight */}
          <path d="M16 18 C24 17 38 17 46 19" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" />

          {/* Windshield */}
          <path
            d="M44 19 L51 27 L43 27 L40 19 Z"
            fill="url(#auto-glass)"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />
          {/* Wiper */}
          <line x1="47" y1="26" x2="43" y2="21" stroke="#334155" strokeWidth="1" strokeLinecap="round" />

          {/* Passenger Cabin Opening / Doorway */}
          <rect x="18" y="24" width="18" height="12" rx="2" fill="#0F172A" />
          {/* Passenger Seat Leather */}
          <path d="M20 31 L32 31 L31 35 L20 35 Z" fill="#92400E" />

          {/* Front Single Headlamp */}
          <circle cx="54" cy="38" r="3" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1" />
          <polygon points="56,38 63,33 63,43" fill="#FEF08A" opacity="0.3" />

          {/* Handlebar & Meter Box */}
          <circle cx="44" cy="30" r="1.5" fill="#EF4444" />
          <path d="M43 29 L47 29" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Tail-light */}
          <rect x="10" y="34" width="2" height="4" rx="1" fill="#EF4444" />
        </svg>
      </div>
    );
  }

  if (type === "CAB" || type === "SEDAN" || type === "GO") {
    // Prime AC Sedan / Hatchback (Executive 4-Wheeler Car)
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="cab-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="cab-glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="cab-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Wheels */}
          {/* Rear Wheel */}
          <circle cx="16" cy="44" r="8" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
          <circle cx="16" cy="44" r="4.5" fill="url(#cab-rim)" />
          <circle cx="16" cy="44" r="2" fill="#0F172A" />

          {/* Front Wheel */}
          <circle cx="48" cy="44" r="8" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
          <circle cx="48" cy="44" r="4.5" fill="url(#cab-rim)" />
          <circle cx="48" cy="44" r="2" fill="#0F172A" />

          {/* Car Body Shell - Aerodynamic Sedan */}
          <path
            d="M6 38 C6 35 9 34 13 34 L18 34 L23 23 C24 21 27 20 31 20 L42 20 C45 20 48 22 50 25 L56 34 L58 35 C60 36 61 38 61 40 L60 43 C60 44 59 44 57 44 L54 44 C53 40 49 37 45 37 C41 37 38 40 37 44 L25 44 C24 40 20 37 16 37 C12 37 9 40 8 44 L6 44 C5 44 4 43 4 41 Z"
            fill="url(#cab-body)"
            stroke="#0284C7"
            strokeWidth="1.2"
          />

          {/* Sedan Roof Line & Window Pillars */}
          {/* Rear Window */}
          <path
            d="M20 32 L24 23 C25 22 27 22 28 22 L33 22 L33 32 Z"
            fill="url(#cab-glass)"
            stroke="#075985"
            strokeWidth="0.8"
          />
          {/* Front Window */}
          <path
            d="M36 22 L42 22 C44 22 46 23 47 25 L52 32 L36 32 Z"
            fill="url(#cab-glass)"
            stroke="#075985"
            strokeWidth="0.8"
          />

          {/* Door divider */}
          <line x1="34" y1="21" x2="34" y2="43" stroke="#0369A1" strokeWidth="1.2" />

          {/* Door Handles */}
          <rect x="27" y="35" width="4" height="1.5" rx="0.7" fill="#E2E8F0" />
          <rect x="37" y="35" width="4" height="1.5" rx="0.7" fill="#E2E8F0" />

          {/* Headlight beam */}
          <path d="M58 37 L61 38 L60 41 L57 40 Z" fill="#FEF08A" />
          <polygon points="61,39 64,36 64,43" fill="#FEF08A" opacity="0.4" />

          {/* Tail Light */}
          <path d="M5 36 L8 36 L7 40 L4 40 Z" fill="#EF4444" />

          {/* Chrome Trim Accent */}
          <path d="M12 38 L54 38" stroke="#E0F2FE" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (type === "SCOOTY") {
    // Green EV Electric Scooter with Eco Leaf & Battery Glow
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="scooty-teal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Wheels */}
          <circle cx="16" cy="44" r="8" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <circle cx="16" cy="44" r="4" fill="#6EE7B7" />

          <circle cx="48" cy="44" r="8" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <circle cx="48" cy="44" r="4" fill="#6EE7B7" />

          {/* Footboard Deck */}
          <rect x="20" y="41" width="20" height="4" rx="2" fill="#0F172A" />

          {/* Rear Fairing & Seat */}
          <path
            d="M12 40 C12 34 16 30 24 30 L32 30 L29 41 L14 41 Z"
            fill="url(#scooty-teal)"
            stroke="#047857"
            strokeWidth="1"
          />
          {/* Black Seat */}
          <path d="M18 29 C20 27 28 27 33 29 L31 32 L19 32 Z" fill="#0F172A" />

          {/* Steering Column & Front Apron */}
          <path
            d="M32 41 L43 23 L47 23 L44 41 Z"
            fill="url(#scooty-teal)"
            stroke="#047857"
            strokeWidth="1"
          />

          {/* Handlebars */}
          <line x1="42" y1="21" x2="48" y2="21" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />

          {/* LED Headlamp */}
          <circle cx="46" cy="24" r="2.5" fill="#A7F3D0" />
          <polygon points="48,24 58,19 58,29" fill="#A7F3D0" opacity="0.3" />

          {/* Electric Bolt / Eco Leaf Emblem */}
          <path
            d="M24 35 L26 33 L25 35 L28 33 L25 38 L26 36 Z"
            fill="#FEF08A"
          />
        </svg>
      </div>
    );
  }

  if (type === "OUTSTATION" || type === "XL") {
    // Highway Cruiser SUV (Spacious 6-Passenger Intercity / XL Vehicle)
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="suv-purple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6B21A8" />
            </linearGradient>
            <linearGradient id="suv-glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          {/* Roof Luggage Carrier Rack */}
          <line x1="20" y1="16" x2="44" y2="16" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="23" y1="16" x2="23" y2="19" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="41" y1="16" x2="41" y2="19" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Luggage Box */}
          <rect x="25" y="14" width="14" height="4" rx="1.5" fill="#334155" />

          {/* Big SUV Wheels */}
          <circle cx="16" cy="44" r="8.5" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <circle cx="16" cy="44" r="4.5" fill="#CBD5E1" />

          <circle cx="48" cy="44" r="8.5" fill="#0F172A" stroke="#475569" strokeWidth="2" />
          <circle cx="48" cy="44" r="4.5" fill="#CBD5E1" />

          {/* High-Ground Clearance SUV Body */}
          <path
            d="M6 36 L12 36 L17 19 C18 18 20 18 22 18 L46 18 C48 18 51 20 53 24 L58 35 L60 37 C61 38 61 40 61 42 L56 42 C54 38 50 36 46 36 C42 36 38 38 37 42 L25 42 C24 38 20 36 16 36 C12 36 8 38 7 42 L5 42 C4 42 3 41 3 39 Z"
            fill="url(#suv-purple)"
            stroke="#581C87"
            strokeWidth="1.2"
          />

          {/* Windows Trio (3 rows for 6 passengers) */}
          <rect x="19" y="21" width="8" height="9" rx="1" fill="url(#suv-glass)" />
          <rect x="29" y="21" width="9" height="9" rx="1" fill="url(#suv-glass)" />
          <path d="M40 21 L47 21 C49 21 51 23 52 26 L54 30 L40 30 Z" fill="url(#suv-glass)" />

          {/* Headlamp LED */}
          <rect x="58" y="35" width="3" height="4" rx="1" fill="#FEF08A" />
          {/* Tail light */}
          <rect x="4" y="34" width="2.5" height="5" rx="1" fill="#EF4444" />
        </svg>
      </div>
    );
  }

  // Default: PARCEL / Express Courier
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${containerSize} ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="box-cardboard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="box-top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Isometric 3D Courier Package */}
        <polygon points="32,12 52,22 32,32 12,22" fill="url(#box-top)" stroke="#92400E" strokeWidth="1.2" />
        <polygon points="12,22 32,32 32,52 12,42" fill="url(#box-cardboard)" stroke="#92400E" strokeWidth="1.2" />
        <polygon points="32,32 52,22 52,42 32,52" fill="#92400E" stroke="#78350F" strokeWidth="1.2" />

        {/* Security Seal Tape */}
        <line x1="32" y1="12" x2="32" y2="52" stroke="#EF4444" strokeWidth="2.5" opacity="0.85" />
        <line x1="12" y1="22" x2="52" y2="22" stroke="#EF4444" strokeWidth="2.5" opacity="0.85" />

        {/* Express Lightning / Fast delivery stamp */}
        <path
          d="M20 28 L23 26 L22 28 L25 26 L22 31 L23 29 Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};
