use anchor_lang::prelude::*;

#[error_code]
pub enum TradingError {
    #[msg("Trader does not own this position.")]
    UnauthorizedTrader,
    #[msg("Market account is not owned by the factory program.")]
    InvalidMarketOwner,
    #[msg("Oracle feed account is not owned by the oracle program.")]
    InvalidOracleOwner,
    #[msg("Oracle feed does not match the supplied market.")]
    OracleMarketMismatch,
    #[msg("Market has already been settled.")]
    MarketSettled,
    #[msg("Insufficient collateral for buy.")]
    InsufficientCollateral,
    #[msg("Insufficient shares for sell.")]
    InsufficientShares,
    #[msg("Math overflow while computing trade amounts.")]
    MathOverflow,
    #[msg("Vault does not have enough lamports.")]
    VaultInsufficientFunds,
}
