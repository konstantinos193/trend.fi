use anchor_lang::prelude::*;
use trendfi_shared::{OracleFeed, OracleSnapshot};

use crate::state::OracleConfig;

#[derive(Accounts)]
pub struct InitializeOracle<'info> {
    #[account(init, payer = authority, space = OracleConfig::LEN, seeds = [b"oracle"], bump)]
    pub oracle: Account<'info, OracleConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateFeed<'info> {
    #[account(seeds = [b"oracle"], bump = oracle.bump)]
    pub oracle: Account<'info, OracleConfig>,
    #[account(
        init,
        payer = authority,
        space = OracleFeed::LEN,
        seeds = [b"feed", market.key().as_ref()],
        bump
    )]
    pub feed: Account<'info, OracleFeed>,
    /// CHECK: used only for seed derivation + feed.market
    pub market: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFeed<'info> {
    #[account(seeds = [b"oracle"], bump = oracle.bump)]
    pub oracle: Account<'info, OracleConfig>,
    #[account(
        mut,
        seeds = [b"feed", feed.market.as_ref()],
        bump
    )]
    pub feed: Account<'info, OracleFeed>,
    pub authority: Signer<'info>,
}
