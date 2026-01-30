use anchor_lang::prelude::*;

#[account]
pub struct OracleConfig {
    pub authority: Pubkey,
    pub bump: u8,
}

impl OracleConfig {
    pub const LEN: usize = 8 + 32 + 1;
}
