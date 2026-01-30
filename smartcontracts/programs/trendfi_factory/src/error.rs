use anchor_lang::prelude::*;

#[error_code]
pub enum FactoryError {
    #[msg("Momentum is too small to open a market.")]
    MomentumTooLow,
    #[msg("Velocity is too small to open a market.")]
    VelocityTooLow,
    #[msg("Topic name cannot be blank.")]
    TopicEmpty,
    #[msg("Topic name exceeds the maximum allowed length.")]
    TopicTooLong,
    #[msg("Trend market expiration must be far enough in the future.")]
    ExpirationTooSoon,
    #[msg("Oracle feed account is not owned by the oracle program.")]
    InvalidOracleOwner,
    #[msg("Oracle feed does not match the supplied market.")]
    OracleMarketMismatch,
    #[msg("Oracle timestamp must advance for fresh data.")]
    StaleSnapshot,
    #[msg("Market has not yet reached expiration.")]
    MarketNotExpired,
    #[msg("Market already settled.")]
    MarketAlreadySettled,
    #[msg("Integer overflow while computing settlement.")]
    MathOverflow,
}
