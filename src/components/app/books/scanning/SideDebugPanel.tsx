"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import {
  AlertTriangle,
  Bug,
  Camera,
  CheckCircle,
  Clock,
  Hash,
  Trash2,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DebugLog {
  id: string;
  timestamp: Date;
  type:
    | "scanner_raw"
    | "isbn_extracted"
    | "google_search"
    | "error"
    | "success";
  message: string;
  data?: any;
}

interface SideDebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * SideDebugPanel Component
 *
 * Side-mounted debug panel for real-time scanning data.
 * Displays alongside the camera view without blocking scanning.
 */
export const SideDebugPanel: React.FC<SideDebugPanelProps> = ({
  isVisible,
  onClose,
  className,
}) => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    successfulExtractions: 0,
    apiCalls: 0,
    errors: 0,
  });

  // Add log entry
  const addLog = (type: DebugLog["type"], message: string, data?: any) => {
    const newLog: DebugLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      data,
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalScans:
        type === "scanner_raw" ? prev.totalScans + 1 : prev.totalScans,
      successfulExtractions:
        type === "isbn_extracted"
          ? prev.successfulExtractions + 1
          : prev.successfulExtractions,
      apiCalls: type === "google_search" ? prev.apiCalls + 1 : prev.apiCalls,
      errors: type === "error" ? prev.errors + 1 : prev.errors,
    }));
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    setStats({
      totalScans: 0,
      successfulExtractions: 0,
      apiCalls: 0,
      errors: 0,
    });
  };

  // Expose debug functions globally for use by scanner components
  useEffect(() => {
    if (typeof window !== "undefined" && isVisible) {
      (window as any).debugScanner = {
        logRawScan: (data: any) =>
          addLog(
            "scanner_raw",
            `Raw scan: ${JSON.stringify(data).substring(0, 50)}...`,
            data
          ),
        logISBNExtraction: (input: string, output: string | null) =>
          addLog("isbn_extracted", `ISBN: "${input}" → ${output || "null"}`, {
            input,
            output,
          }),
        logGoogleSearch: (isbn: string, resultCount: number) =>
          addLog("google_search", `Search "${isbn}" → ${resultCount} results`, {
            isbn,
            resultCount,
          }),
        logError: (error: string, context?: any) =>
          addLog("error", error, context),
        logSuccess: (message: string, data?: any) =>
          addLog("success", message, data),
      };
    }

    // Cleanup when component unmounts or becomes invisible
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).debugScanner;
      }
    };
  }, [isVisible]);

  const getLogIcon = (type: DebugLog["type"]) => {
    switch (type) {
      case "scanner_raw":
        return <Camera className="h-3 w-3" />;
      case "isbn_extracted":
        return <Hash className="h-3 w-3" />;
      case "google_search":
        return <Wifi className="h-3 w-3" />;
      case "error":
        return <AlertTriangle className="h-3 w-3" />;
      case "success":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getLogColor = (type: DebugLog["type"]) => {
    switch (type) {
      case "scanner_raw":
        return "text-blue-400";
      case "isbn_extracted":
        return "text-purple-400";
      case "google_search":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "success":
        return "text-emerald-400";
      default:
        return "text-gray-400";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "w-80 bg-slate-900 text-white rounded-lg border border-slate-700 shadow-lg flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          <span className="text-sm font-medium">Debug Console</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            className="text-white hover:bg-slate-800 h-7 w-7 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-slate-800 h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-slate-700">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-400 border-blue-400/30 px-2 py-1 w-full"
            >
              {stats.totalScans}
            </Badge>
            <p className="text-slate-400 mt-1">Scans</p>
          </div>
          <div className="text-center">
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-400 border-purple-400/30 px-2 py-1 w-full"
            >
              {stats.successfulExtractions}
            </Badge>
            <p className="text-slate-400 mt-1">ISBNs</p>
          </div>
          <div className="text-center">
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-400 border-green-400/30 px-2 py-1 w-full"
            >
              {stats.apiCalls}
            </Badge>
            <p className="text-slate-400 mt-1">API</p>
          </div>
          <div className="text-center">
            <Badge
              variant="secondary"
              className="bg-red-500/20 text-red-400 border-red-400/30 px-2 py-1 w-full"
            >
              {stats.errors}
            </Badge>
            <p className="text-slate-400 mt-1">Errors</p>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm">
              Waiting for scanner activity...
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 p-2 rounded bg-slate-800/50 text-xs"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex-shrink-0",
                      getLogColor(log.type)
                    )}
                  >
                    {getLogIcon(log.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white break-words leading-tight">
                      {log.message}
                    </p>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
                          Show data
                        </summary>
                        <pre className="text-xs text-slate-300 mt-1 bg-slate-900 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Scanner active</span>
        </div>
      </div>
    </div>
  );
};

export default SideDebugPanel;