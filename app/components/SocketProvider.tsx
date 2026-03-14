"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface MarketTick {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePct: number;
  timestamp: string;
  anomaly: {
    type: string;
    message: string;
    severity: string;
    zScore: number;
  } | null;
}

interface SimulationEvent {
  type: string;
  symbol: string;
  price: number;
  message: string;
}

interface SocketContextType {
  marketData: MarketTick[];
  alerts: Array<{ id: number; timestamp: string; message: string; severity: string; type: string }>;
  isConnected: boolean;
  latestTicks: Record<string, MarketTick>;
}

const SocketContext = createContext<SocketContextType>({
  marketData: [],
  alerts: [],
  isConnected: false,
  latestTicks: {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestTicks, setLatestTicks] = useState<Record<string, MarketTick>>({});
  const [marketData, setMarketData] = useState<MarketTick[]>([]);
  const [alerts, setAlerts] = useState<Array<{
    id: number; timestamp: string; message: string; severity: string; type: string;
  }>>([]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to market data server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("marketData", (ticks: MarketTick[]) => {
      // Update latest ticks for all symbols
      const newTicks: Record<string, MarketTick> = {};
      ticks.forEach((tick) => { newTicks[tick.symbol] = tick; });
      setLatestTicks((prev) => ({ ...prev, ...newTicks }));

      // Track ALL symbols in marketData (not just BTC)
      setMarketData((prev) => {
        const updated = [...prev, ...ticks];
        return updated.slice(-600);
      });

      // Handle anomaly alerts
      ticks.forEach((tick) => {
        if (tick.anomaly) {
          const time = new Date().toLocaleTimeString();
          setAlerts((prev) => [
            {
              id: Date.now() + Math.random(),
              timestamp: time,
              message: tick.anomaly!.message,
              severity: tick.anomaly!.severity,
              type: tick.anomaly!.type,
            },
            ...prev.slice(0, 49),
          ]);
        }
      });
    });

    socket.on("simulationEvent", (event: SimulationEvent) => {
      const time = new Date().toLocaleTimeString();
      setAlerts((prev) => [
        {
          id: Date.now() + Math.random(),
          timestamp: time,
          message: event.message,
          severity: "HIGH",
          type: event.type,
        },
        ...prev.slice(0, 49),
      ]);
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <SocketContext.Provider value={{ marketData, alerts, isConnected, latestTicks }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);