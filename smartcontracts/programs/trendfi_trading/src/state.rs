use anchor_lang::prelude::*;

#[account]
pub struct MarketVault {
    pub market: Pubkey,
    pub bump: u8,
}

impl MarketVault {
    pub const LEN: usize = 8 + 32 + 1;
}

#[account]
pub struct Position {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub shares: u64,
    pub collateral: u64,
    pub cost_basis: u128,
    pub last_price: u64,
    pub last_trade_ts: i64,
    pub bump: u8,
}

impl Position {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 16 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TradeSide {
    Buy,
    Sell,
}
