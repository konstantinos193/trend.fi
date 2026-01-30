use anchor_lang::prelude::*;

pub mod state;

pub use state::{
    compute_momentum_multiplier, MarketFactory, OracleFeed, OracleSnapshot, TrendMarket,
    MAX_TOPIC_LENGTH, MIN_EXPIRY_SECONDS, MIN_MOMENTUM_THRESHOLD, MIN_VELOCITY_THRESHOLD,
};
