'use client';

import { useEffect, useState, useRef } from 'react';

interface ConsoleError {
  message: string;
  source: string;
  timestamp: number;
  stack?: string;
}

export function ConsoleErrorLogger() {
  const [errors, setErrors] = useState<ConsoleError[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Capture console errors
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorMsg = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        if (isMountedRef.current) {
          setErrors(prev => [...prev, {
            message: errorMsg,
            source: 'console.error',
            timestamp: Date.now(),
          }]);
        }
      }, 0);
      
      originalError.apply(console, args);
    };

    // Capture console warnings
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const warnMsg = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        if (isMountedRef.current) {
          setLogs(prev => [...prev, `WARN: ${warnMsg}`]);
        }
      }, 0);
      
      originalWarn.apply(console, args);
    };

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      setTimeout(() => {
        if (isMountedRef.current) {
          setErrors(prev => [...prev, {
            message: event.message,
            source: event.filename || 'unknown',
            timestamp: Date.now(),
            stack: event.error?.stack,
          }]);
        }
      }, 0);
    };

    // Capture unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      setTimeout(() => {
        if (isMountedRef.current) {
          setErrors(prev => [...prev, {
            message: `Unhandled Promise Rejection: ${event.reason}`,
            source: 'promise',
            timestamp: Date.now(),
            stack: event.reason?.stack,
          }]);
        }
      }, 0);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      isMountedRef.current = false;
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Only show in development and if there are errors
  if (process.env.NODE_ENV !== 'development' || (errors.length === 0 && logs.length === 0)) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground rounded-lg p-4 text-xs max-w-lg max-h-96 overflow-auto z-50 shadow-lg border border-destructive/50">
      <h3 className="font-bold mb-2 text-sm">Console Errors & Warnings</h3>
      {errors.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-1">Errors ({errors.length}):</div>
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div key={idx} className="bg-destructive/20 p-2 rounded text-xs">
                <div className="font-mono break-words">{error.message}</div>
                {error.source && (
                  <div className="text-destructive/70 mt-1">Source: {error.source}</div>
                )}
                {error.stack && (
                  <details className="mt-1">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <pre className="mt-1 text-xs overflow-auto">{error.stack}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {logs.length > 0 && (
        <div>
          <div className="font-semibold mb-1">Warnings ({logs.length}):</div>
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="bg-yellow-500/20 p-2 rounded text-xs break-words">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => {
          setErrors([]);
          setLogs([]);
        }}
        className="mt-2 text-xs underline"
      >
        Clear
      </button>
    </div>
  );
}

