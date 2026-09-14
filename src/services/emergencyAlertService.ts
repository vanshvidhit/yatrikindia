import { Coordinates, EmergencyContact, EmergencyAlertBroadcast, EmergencyAlertLog } from "../types";

export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "ec-1",
    name: "Sunita Sharma",
    relationship: "Mother / Family",
    phone: "+91 98450 12345",
    isPrimary: true,
    notifyOnSOS: true,
  },
  {
    id: "ec-2",
    name: "Rohan Verma",
    relationship: "Partner / Emergency Contact",
    phone: "+91 98860 67890",
    isPrimary: false,
    notifyOnSOS: true,
  },
  {
    id: "ec-3",
    name: "National Emergency Helpline (112 India)",
    relationship: "Police & Safety Dispatch",
    phone: "112",
    isPrimary: false,
    notifyOnSOS: true,
  },
];

class EmergencyAlertService {
  private activeBroadcast: EmergencyAlertBroadcast | null = null;
  private beaconInterval: any = null;
  private listeners: Array<(broadcast: EmergencyAlertBroadcast | null) => void> = [];

  public subscribe(callback: (broadcast: EmergencyAlertBroadcast | null) => void) {
    this.listeners.push(callback);
    callback(this.activeBroadcast);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.activeBroadcast));
  }

  public getActiveBroadcast(): EmergencyAlertBroadcast | null {
    return this.activeBroadcast;
  }

  /**
   * Broadcasts the emergency alert with live GPS coordinates to predefined contacts
   */
  public async broadcastAlert(params: {
    riderId: string;
    riderName: string;
    riderPhone: string;
    coordinates: Coordinates;
    address?: string;
    reason?: string;
    rideId?: string;
    contacts?: EmergencyContact[];
  }): Promise<EmergencyAlertBroadcast> {
    const {
      riderId,
      riderName,
      riderPhone,
      coordinates,
      address = "Market St & 4th St, Financial District, SF",
      reason = "Emergency SOS Button Activated by Rider",
      rideId,
      contacts = DEFAULT_EMERGENCY_CONTACTS,
    } = params;

    const alertId = `SOS-${Date.now().toString(36).toUpperCase()}`;
    const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
    const activeContacts = contacts.filter((c) => c.notifyOnSOS);

    const initialLogs: EmergencyAlertLog[] = [
      {
        id: `log-${Date.now()}-1`,
        timestamp: Date.now(),
        channel: "GPS_BEACON",
        recipient: "GPS Sat-Lock",
        status: "DELIVERED",
        message: `High-precision GPS coordinates locked at ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)} (Accuracy < 4m)`,
      },
    ];

    const broadcast: EmergencyAlertBroadcast = {
      alertId,
      riderId,
      riderName,
      riderPhone,
      coordinates,
      address,
      timestamp: Date.now(),
      googleMapsUrl,
      contactsNotified: activeContacts,
      logs: initialLogs,
      status: "TRIGGERED",
      rideId,
    };

    this.activeBroadcast = broadcast;
    this.notify();

    // Simulate multi-channel background dispatch timeline
    // 1. Dispatch SMS to primary contacts (300ms)
    setTimeout(() => {
      if (!this.activeBroadcast || this.activeBroadcast.alertId !== alertId) return;

      activeContacts.forEach((contact) => {
        const smsText = `🚨 EMERGENCY ALERT: ${riderName} triggered an SOS alert near ${address}. Live GPS Tracking: ${googleMapsUrl}`;
        const newLog: EmergencyAlertLog = {
          id: `log-${Date.now()}-${contact.id}`,
          timestamp: Date.now(),
          channel: "SMS",
          recipient: `${contact.name} (${contact.phone})`,
          status: "DELIVERED",
          message: `SMS Sent: "${smsText}"`,
        };
        this.activeBroadcast?.logs.unshift(newLog);
      });
      this.activeBroadcast.status = "BROADCASTING";
      this.notify();
    }, 400);

    // 2. Dispatch Incident Webhook to Safety Command Room (800ms)
    setTimeout(() => {
      if (!this.activeBroadcast || this.activeBroadcast.alertId !== alertId) return;

      const newLog: EmergencyAlertLog = {
        id: `log-${Date.now()}-cmd`,
        timestamp: Date.now(),
        channel: "DISPATCH",
        recipient: "Yatrik 24x7 Safety Command Desk",
        status: "DELIVERED",
        message: `Incident ticket #${alertId} escalated to Priority 1 Safety Queue. Telemetry monitoring active.`,
      };
      this.activeBroadcast?.logs.unshift(newLog);
      this.notify();
    }, 900);

    // 3. Keep background GPS beacon running (every 4s)
    if (this.beaconInterval) clearInterval(this.beaconInterval);
    this.beaconInterval = setInterval(() => {
      if (!this.activeBroadcast) {
        clearInterval(this.beaconInterval);
        return;
      }

      const beaconLog: EmergencyAlertLog = {
        id: `log-${Date.now()}-beacon`,
        timestamp: Date.now(),
        channel: "GPS_BEACON",
        recipient: "Emergency Broadcast Relay",
        status: "DELIVERED",
        message: `Live coordinate heartbeat relayed: ${this.activeBroadcast.coordinates.lat.toFixed(5)}, ${this.activeBroadcast.coordinates.lng.toFixed(5)}`,
      };

      // Keep maximum 30 logs
      this.activeBroadcast.logs = [beaconLog, ...this.activeBroadcast.logs.slice(0, 25)];
      this.notify();
    }, 4000);

    return broadcast;
  }

  /**
   * Updates live coordinates for the active beacon
   */
  public updateLiveCoordinates(coordinates: Coordinates, address?: string) {
    if (!this.activeBroadcast) return;
    this.activeBroadcast.coordinates = coordinates;
    this.activeBroadcast.googleMapsUrl = `https://www.google.com/maps?q=${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
    if (address) this.activeBroadcast.address = address;
    this.notify();
  }

  /**
   * Resolves / Cancels active emergency broadcast
   */
  public resolveAlert() {
    if (this.beaconInterval) {
      clearInterval(this.beaconInterval);
      this.beaconInterval = null;
    }
    if (this.activeBroadcast) {
      this.activeBroadcast.status = "RESOLVED";
      const resolvedLog: EmergencyAlertLog = {
        id: `log-${Date.now()}-resolved`,
        timestamp: Date.now(),
        channel: "DISPATCH",
        recipient: "Safety Command Center",
        status: "DELIVERED",
        message: "Alert marked as RESOLVED / SAFE by user.",
      };
      this.activeBroadcast.logs.unshift(resolvedLog);
      this.notify();
    }
    setTimeout(() => {
      this.activeBroadcast = null;
      this.notify();
    }, 2000);
  }
}

export const emergencyAlertService = new EmergencyAlertService();
