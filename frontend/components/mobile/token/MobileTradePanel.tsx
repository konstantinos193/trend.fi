"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendSnapshot } from "@/lib/trends";
import { calculateQuote } from "@/lib/pricing";
import PaperTrades, { PaperTradeEntry } from "@/components/trade/PaperTrades";

interface MobileTradePanelProps {
  trend: TrendSnapshot;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

const storageKey = "trendfi.paperTrades";

export default function MobileTradePanel({ trend }: MobileTradePanelProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(3);
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
    <section id="trade" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Trade {trend.topic}</h2>
          <p className="mobile-section__subtitle">Paper trades saved locally</p>
        </div>
        <span className="mobile-pill">{side === "buy" ? "Buy" : "Sell"}</span>
      </div>

      <div className="mobile-card">
        <div className="mobile-toggle">
          <button
            type="button"
            className={`mobile-toggle__btn ${side === "buy" ? "is-active" : ""}`}
            onClick={() => setSide("buy")}
          >
            Buy
          </button>
          <button
            type="button"
            className={`mobile-toggle__btn ${side === "sell" ? "is-active" : ""}`}
            onClick={() => setSide("sell")}
          >
            Sell
          </button>
        </div>

        <label className="mobile-field">
          <span className="mobile-field__label">Quantity</span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            className="mobile-input"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>

        <div className="mobile-metric-stack">
          <span className="mobile-metric">{currencyFormatter.format(quote.unitPrice)}</span>
          <span className="mobile-delta up">
            Fee {currencyFormatter.format(quote.fee)}
          </span>
          <span className="mobile-delta">
            {side === "buy" ? "Total" : "Proceeds"} {currencyFormatter.format(quote.total)}
          </span>
        </div>

        <button type="button" className="mobile-cta" onClick={handleSubmit}>
          Place paper {side}
        </button>
      </div>

      <div className="mobile-card mt-4">
        <h3 className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
          Recent paper trades
        </h3>
        <PaperTrades trades={trades.filter((trade) => trade.topic === trend.topic)} />
      </div>
    </section>
  );
}
