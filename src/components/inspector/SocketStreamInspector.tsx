import React, { useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Radio,
  Server,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";
import { socketService } from "../../services/socketService";

export const SocketStreamInspector: React.FC = () => {
  const { packetLogs, clearPacketLogs, nearbyDrivers, riderActiveRide, driverActiveRide } =
    useRideStore();

  const [selectedLogId, setSelectedLogId] = useState<string | null>(
    packetLogs[0]?.id || null
  );
  const [filterDirection, setFilterDirection] = useState<"ALL" | "INBOUND" | "OUTBOUND">("ALL");
  const [copied, setCopied] = useState(false);

  const filteredLogs = packetLogs.filter((l) => {
    if (filterDirection === "ALL") return true;
    return l.direction === filterDirection;
  });

  const selectedLog = packetLogs.find((l) => l.id === selectedLogId) || packetLogs[0];

  const handleCopyJson = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-4 md:p-6 overflow-hidden max-w-7xl mx-auto w-full">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Socket Connection
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected (Port 3000)
            </div>
          </div>
          <Radio className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Redis GEO Pool
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {nearbyDrivers.length} Active Points
            </div>
          </div>
          <Database className="w-5 h-5 text-blue-400" />
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Active Ride Rooms
            </div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">
              {riderActiveRide || driverActiveRide ? "1 Active Room" : "0 Active"}
            </div>
          </div>
          <Server className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Total Packets Streamed
            </div>
            <div className="text-sm font-bold text-purple-400 mt-0.5">
              {packetLogs.length} Packets
            </div>
          </div>
          <Activity className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      {/* Main Split Inspector */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Stream Packet List */}
        <div className="md:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* List Header */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Live Event Stream</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800 p-0.5 rounded-lg text-[10px]">
                {(["ALL", "INBOUND", "OUTBOUND"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setFilterDirection(dir)}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      filterDirection === dir
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>

              <button
                onClick={clearPacketLogs}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable Packet Log List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Listening for real-time WebSocket frames...
              </div>
            )}

            {filteredLogs.map((log) => {
              const isSelected = log.id === selectedLog?.id;
              const isOut = log.direction === "OUTBOUND";

              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full p-2.5 text-left flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-blue-950/40 text-blue-200 border-l-2 border-blue-500"
                      : "hover:bg-slate-800/50 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`p-1 rounded text-[10px] font-bold shrink-0 ${
                        isOut
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {isOut ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3" />
                      )}
                    </span>
                    <span className="font-semibold truncate">{log.eventName}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    {log.timestamp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed JSON Payload Inspector */}
        <div className="md:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Payload Inspector</span>
              {selectedLog && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
                  {selectedLog.eventName}
                </span>
              )}
            </div>

            <button
              onClick={handleCopyJson}
              disabled={!selectedLog}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 p-4 bg-slate-950/60 overflow-y-auto font-mono text-xs text-emerald-300">
            {selectedLog ? (
              <pre className="whitespace-pre-wrap break-words leading-relaxed">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-500 text-center py-12 font-sans">
                Select an event from the stream to view full deserialized JSON packet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
