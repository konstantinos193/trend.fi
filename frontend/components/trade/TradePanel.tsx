"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendSnapshot } from "@/lib/trends";
import { calculateQuote } from "@/lib/pricing";
import PaperTrades, { PaperTradeEntry } from "./PaperTrades";

interface TradePanelProps {
  trend: TrendSnapshot;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

const storageKey = "trendfi.paperTrades";

export default function TradePanel({ trend }: TradePanelProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(5);
  const [trades, setTrades] = useState<PaperTradeEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PaperTradeEntry[];
      setTrades(parsed ?? []);
    } catch {
      setTrades([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(trades));
  }, [trades]);

  const quote = useMemo(
    () =>
      calculateQuote({
        momentum: trend.momentum,
        rawScore: trend.raw_score,
        velocity: trend.velocity,
        side,
        quantity,
      }),
    [trend.momentum, trend.raw_score, trend.velocity, side, quantity],
  );

  const handleSubmit = () => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    const newTrade: PaperTradeEntry = {
      id: `${trend.topic}-${Date.now()}`,
      topic: trend.topic,
      side,
      quantity,
      unitPrice: quote.unitPrice,
      total: quote.total,
      timestamp: Date.now(),
    };

    setTrades((prev) => [newTrade, ...prev].slice(0, 20));
  };

  return (
    <div className="trade-panel">
      <div className="trade-panel__top">
        <div>
          <h3 className="text-lg font-semibold">Trade {trend.topic}</h3>
          <p className="text-sm text-slate-400">Paper trades stored locally.</p>
        </div>
        <div className="trade-toggle">
          <button
            type="button"
            className={`trade-toggle__btn ${side === "buy" ? "is-active" : ""}`}
            onClick={() => setSide("buy")}
          >
            Buy
          </button>
          <button
            type="button"
            className={`trade-toggle__btn ${side === "sell" ? "is-active" : ""}`}
            onClick={() => setSide("sell")}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="trade-panel__body">
        <label className="trade-field">
          <span className="trade-field__label">Quantity</span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            className="trade-input"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>

        <div className="trade-summary">
          <div>
            <p className="trade-summary__label">Unit price</p>
            <p className="trade-summary__value">{currencyFormatter.format(quote.unitPrice)}</p>
          </div>
          <div>
            <p className="trade-summary__label">Fee ({(quote.feeRate * 100).toFixed(2)}%)</p>
            <p className="trade-summary__value">{currencyFormatter.format(quote.fee)}</p>
          </div>
          <div>
            <p className="trade-summary__label">{side === "buy" ? "Total cost" : "Total proceeds"}</p>
            <p className="trade-summary__value">{currencyFormatter.format(quote.total)}</p>
          </div>
        </div>

        <button type="button" className="trade-submit" onClick={handleSubmit}>
          Place paper {side}
        </button>
      </div>

      <div className="trade-panel__log">
        <div className="trade-panel__log-header">
          <h4 className="text-sm font-mono uppercase tracking-wide text-slate-500">
            Recent paper trades
          </h4>
        </div>
        <PaperTrades trades={trades.filter((trade) => trade.topic === trend.topic)} />
      </div>
    </div>
  );
}
