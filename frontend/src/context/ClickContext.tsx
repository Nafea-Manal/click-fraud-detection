import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { ScoreResponse, ClickInput } from "../services/api";
import { fetchClicks } from "../services/api";

export interface ScoredClick extends ClickInput, ScoreResponse {
  id: string;
}

interface ClickContextType {
  clicks: ScoredClick[];
  dbLoaded: boolean;
  addClick: (click: ScoredClick) => void;
  addClicks: (clicks: ScoredClick[]) => void;
  clearClicks: () => void;
}

const ClickContext = createContext<ClickContextType | undefined>(undefined);

export const ClickProvider = ({ children }: { children: ReactNode }) => {
  const [clicks, setClicks] = useState<ScoredClick[]>([]);
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await fetchClicks();
        const dbClicks: ScoredClick[] = raw.map((item: any) => ({
          id: String(item.id),
          ip: item.ip,
          app: item.app,
          device: item.device,
          os: item.os,
          channel: item.channel,
          click_time: item.click_time,
          conversion_probability: item.conversion_probability,
          risk_score: item.risk_score,
          decision: item.decision,
          feature_importance: item.feature_importance,
        }));
        setClicks(dbClicks);
      } catch (error) {
        console.error("Failed to load click history from DB:", error);
      } finally {
        setDbLoaded(true);
      }
    };

    loadHistory();
  }, []);

  const addClick = (click: ScoredClick) => {
    setClicks((prev) => [click, ...prev]);
  };

  const addClicks = (newClicks: ScoredClick[]) => {
    setClicks((prev) => [...newClicks, ...prev]);
  };

  const clearClicks = () => {
    setClicks([]);
  };

  return (
    <ClickContext.Provider
      value={{ clicks, dbLoaded, addClick, addClicks, clearClicks }}
    >
      {children}
    </ClickContext.Provider>
  );
};

export const useClicks = () => {
  const context = useContext(ClickContext);
  if (context === undefined)
    throw new Error("useClicks must be used within a ClickProvider");
  return context;
};
