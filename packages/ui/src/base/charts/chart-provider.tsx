import { createContext, useContext, type ReactNode } from "react";
import type { ChartAdapter } from "./types";

const ChartContext = createContext<ChartAdapter | null>(null);

export interface ChartProviderProps {
  adapter: ChartAdapter;
  children: ReactNode;
}

export function ChartProvider({ adapter, children }: ChartProviderProps) {
  return <ChartContext value={adapter}>{children}</ChartContext>;
}

export function useChartAdapter(): ChartAdapter {
  const ctx = useContext(ChartContext);
  if (!ctx) throw new Error("useChartAdapter must be used within <ChartProvider>");
  return ctx;
}
