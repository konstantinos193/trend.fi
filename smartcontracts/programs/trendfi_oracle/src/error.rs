use anchor_lang::prelude::*;

#[error_code]
pub enum OracleError {
    #[msg("Only the registered oracle authority can sign updates.")]
    UnauthorizedOracle,
    #[msg("Oracle timestamp must advance for fresh data.")]
    StaleSnapshot,
    #[msg("Oracle feed market does not match the expected market.")]
    MarketMismatch,
}
