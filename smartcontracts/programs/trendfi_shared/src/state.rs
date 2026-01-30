use anchor_lang::prelude::*;

pub const MAX_TOPIC_LENGTH: usize = 64;
pub const MIN_MOMENTUM_THRESHOLD: i64 = 25;
pub const MIN_VELOCITY_THRESHOLD: i64 = 20;
pub const MIN_EXPIRY_SECONDS: i64 = 30 * 60; // 30 minutes.

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OracleSnapshot {
    pub momentum: i64,
    pub velocity: i64,
    pub raw_score: u64,
    pub timestamp: i64,
}

#[account]
pub struct MarketFactory {
    pub authority: Pubkey,
    pub bump: u8,
    pub market_count: u64,
}

impl MarketFactory {
    pub const LEN: usize = 8 + 32 + 1 + 8;
}

#[account]
pub struct TrendMarket {
    pub factory: Pubkey,
    pub creator: Pubkey,
    pub bump: u8,
    pub index: u64,
    pub topic: String,
    pub base_price: u64,
    pub expiry_ts: i64,
    pub momentum: i64,
    pub velocity: i64,
    pub raw_score: u64,
    pub last_updated: i64,
    pub settled: bool,
    pub settlement_price: u64,
}

impl TrendMarket {
    pub const LEN: usize = 8
        + 32
        + 32
        + 1
        + 8
        + 4
        + MAX_TOPIC_LENGTH
        + 8
        + 8
        + 8
        + 8
        + 8
        + 8
        + 1
        + 8;
}

#[account]
pub struct OracleFeed {
    pub market: Pubkey,
    pub momentum: i64,
    pub velocity: i64,
    pub raw_score: u64,
    pub last_updated: i64,
}

impl OracleFeed {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8;
}

pub fn compute_momentum_multiplier(momentum: i64) -> u128 {
    let base = 1000u128;
    let delta = (momentum.abs() as u128).min(500);
    if momentum >= 0 {
        base + (delta * 5)
    } else {
        base.saturating_sub(delta * 3)
    }
}
