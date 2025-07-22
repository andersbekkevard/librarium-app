"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bug, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Wifi,
  Camera,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface DebugLog {
  id: string;
  timestamp: Date;
  type: 'scanner_raw' | 'isbn_extracted' | 'google_search' | 'error' | 'success';
  message: string;
  data?: any;
}

interface DebugOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * DebugOverlay Component
 * 
 * Real-time debugging interface for barcode scanning pipeline.
 * Shows scanner responses, ISBN extraction, and Google Books API calls.
 */
export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  isOpen,
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
  const addLog = (type: DebugLog['type'], message: string, data?: any) => {
    const newLog: DebugLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      data,
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalScans: type === 'scanner_raw' ? prev.totalScans + 1 : prev.totalScans,
      successfulExtractions: type === 'isbn_extracted' ? prev.successfulExtractions + 1 : prev.successfulExtractions,
      apiCalls: type === 'google_search' ? prev.apiCalls + 1 : prev.apiCalls,
      errors: type === 'error' ? prev.errors + 1 : prev.errors,
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
    if (typeof window !== 'undefined') {
      (window as any).debugScanner = {
        logRawScan: (data: any) => addLog('scanner_raw', `Raw scan result: ${JSON.stringify(data).substring(0, 100)}`, data),
        logISBNExtraction: (input: string, output: string | null) => 
          addLog('isbn_extracted', `ISBN extraction: "${input}" → ${output || 'null'}`, { input, output }),
        logGoogleSearch: (isbn: string, resultCount: number) => 
          addLog('google_search', `Google Books search for "${isbn}" returned ${resultCount} results`, { isbn, resultCount }),
        logError: (error: string, context?: any) => 
          addLog('error', error, context),
        logSuccess: (message: string, data?: any) => 
          addLog('success', message, data),
      };
    }
  }, []);

  if (!isOpen) return null;

  const getLogIcon = (type: DebugLog['type']) => {
    switch (type) {
      case 'scanner_raw': return <Camera className="h-3 w-3" />;
      case 'isbn_extracted': return <Hash className="h-3 w-3" />;
      case 'google_search': return <Wifi className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      case 'success': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getLogColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'scanner_raw': return 'text-blue-600';
      case 'isbn_extracted': return 'text-purple-600';
      case 'google_search': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'success': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
      className
    )}>
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              <CardTitle>Barcode Scanner Debug Console</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Camera className="h-3 w-3 text-blue-600" />
              <span>Scans: {stats.totalScans}</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-purple-600" />
              <span>ISBN: {stats.successfulExtractions}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-green-600" />
              <span>API: {stats.apiCalls}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              <span>Errors: {stats.errors}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-hidden p-0">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for scanner activity...</p>
                <p className="text-xs mt-1">Try scanning a barcode to see debug information</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4 space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 text-sm"
                >
                  <div className={cn("mt-0.5", getLogColor(log.type))}>
                    {getLogIcon(log.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {log.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()} 
                      </span>
                    </div>
                    
                    <p className="text-sm break-words">{log.message}</p>
                    
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Raw data
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {typeof log.data === 'string' 
                            ? log.data 
                            : JSON.stringify(log.data, null, 2)
                          }
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugOverlay;