/**
 * Brand Identity & Configuration for Yatrik India
 * (यात्रिक – हर सफर, सही कदर)
 */

export interface BrandConfig {
  name: string;
  hindiName: string;
  legalName: string;
  tagline: string;
  bilingualTagline: string;
  mission: string;
  supportEmail: string;
  website: string;
  appUrl: string;
  helpline: string;
  domains: {
    domain: string;
    viability: string;
    role: string;
  }[];
  theme: {
    primary: string; // Yellow-board amber / taxi gold
    dark: string;    // Slate asphalt
    accent: string;  // Verified / Green EV
    ochre: string;   // Deep gradient edge
  };
  usps: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export const BRAND_CONFIG: BrandConfig = {
  name: "Yatrik India",
  hindiName: "यात्रिक",
  legalName: "Yatrik Mobility India",
  tagline: "India's Smart City Mobility",
  bilingualTagline: "यात्रिक – हर सफर, सही कदर",
  mission: "Open, transparent, zero-surge city transit network with direct UPI payouts to Captains.",
  supportEmail: "support@yatrikindia.com",
  website: "https://yatrikindia.com",
  appUrl: "https://yatrik.app/download",
  helpline: "1800-YATRIK (1800-928-745)",
  domains: [
    { domain: "yatrikindia.com", viability: "High Probability / Clean", role: "Official corporate & web presence" },
    { domain: "yatrik.app", viability: "Standard TLD Available", role: "Mobile PWA & Play Store app download" },
    { domain: "goyatrik.in", viability: "Highly Likely Available", role: "Consumer-facing, action-oriented booking portal" },
    { domain: "yatrik.in / yatrik.co.in", viability: "Registry / Broker", role: "Short brand domain for India" },
    { domain: "@yatrikindia", viability: "Consistent Handle", role: "Instagram, X (Twitter), & GitHub" },
  ],
  theme: {
    primary: "#FFB800", // Yellow-board amber / iconic Indian taxi yellow
    dark: "#121826",    // Slate asphalt
    accent: "#00D284",   // Verified / Green EV
    ochre: "#D97706",   // Deep warm edge
  },
  usps: [
    {
      title: "Direct UPI to Captains",
      description: "100% fare sent directly to Captain's UPI account with zero middleman holding.",
      icon: "⚡",
    },
    {
      title: "Zero Surge Gouging",
      description: "Transparent, kilometer-grounded rates regulated for commuters, even in peak rain.",
      icon: "🛡️",
    },
    {
      title: "Bilingual & Native Trust",
      description: "Accessible for everyday riders across Hindi belt & multilingual Indian cities.",
      icon: "🇮🇳",
    },
    {
      title: "Open Community Mobility",
      description: "Empowering auto-rickshaw, cab, and delivery partners as proud stakeholders.",
      icon: "🤝",
    },
  ],
};
