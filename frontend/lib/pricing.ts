type QuoteSide = "buy" | "sell";

export interface QuoteInput {
  momentum: number;
  rawScore: number;
  velocity: number;
  side: QuoteSide;
  quantity: number;
}

export interface QuoteOutput {
  unitPrice: number;
  subtotal: number;
  fee: number;
  total: number;
  feeRate: number;
}

const FEE_RATE = 0.005;

export function calculateQuote({
  momentum,
  rawScore,
  velocity,
  side,
  quantity,
}: QuoteInput): QuoteOutput {
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const basePrice = Math.max(0.05, rawScore / 100);
  const momentumMultiplier = 1 + Math.max(0, momentum) * 0.6;
  const velocityMultiplier = 1 + clamp(velocity * 0.03, -0.15, 0.15);
  const sideMultiplier = side === "buy" ? 1.01 : 0.99;

  const unitPrice = basePrice * momentumMultiplier * velocityMultiplier * sideMultiplier;
  const subtotal = unitPrice * safeQty;
  const fee = subtotal * FEE_RATE;
  const total = side === "buy" ? subtotal + fee : Math.max(0, subtotal - fee);

  return {
    unitPrice,
    subtotal,
    fee,
    total,
    feeRate: FEE_RATE,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
