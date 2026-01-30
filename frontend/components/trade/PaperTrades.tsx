"use client";

import { useMemo } from "react";

export interface PaperTradeEntry {
  id: string;
  topic: string;
  side: "buy" | "sell";
  quantity: number;
  unitPrice: number;
  total: number;
  timestamp: number;
}

interface PaperTradesProps {
  trades: PaperTradeEntry[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

export default function PaperTrades({ trades }: PaperTradesProps) {
  const sorted = useMemo(
    () => [...trades].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6),
    [trades],
  );

  if (!sorted.length) {
    return (
      <div className="trade-empty">
        <p className="text-sm text-slate-400">No paper trades yet.</p>
        <p className="text-xs text-slate-500 mt-1">Place a trade to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="trade-log">
      {sorted.map((trade) => (
        <div key={trade.id} className="trade-log__row">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
              {trade.side} · {new Date(trade.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="font-semibold text-sm">{trade.topic}</p>
            <p className="text-xs text-slate-500">
              {trade.quantity.toFixed(2)} tokens · {currencyFormatter.format(trade.unitPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono text-slate-200">
              {currencyFormatter.format(trade.total)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
