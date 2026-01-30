use anchor_lang::prelude::*;

use crate::state::{MarketVault, Position};

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = payer,
        space = MarketVault::LEN,
        seeds = [b"vault", market.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, MarketVault>,
    /// CHECK: used for PDA seed only
    pub market: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(
        init,
        payer = trader,
        space = Position::LEN,
        seeds = [b"position", market.key().as_ref(), trader.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    /// CHECK: used for PDA seed only
    pub market: UncheckedAccount<'info>,
    #[account(mut)]
    pub trader: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, MarketVault>,
    #[account(
        mut,
        seeds = [b"position", market.key().as_ref(), trader.key().as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, Position>,
    /// CHECK: used for PDA seed only
    pub market: UncheckedAccount<'info>,
    #[account(mut)]
    pub trader: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, MarketVault>,
    #[account(
        mut,
        seeds = [b"position", market.key().as_ref(), trader.key().as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, Position>,
    /// CHECK: used for PDA seed only
    pub market: UncheckedAccount<'info>,
    #[account(mut)]
    pub trader: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(
        mut,
        seeds = [b"vault", market.key().as_ref()],
        bump = vault.bump
    )]
    pub vault: Account<'info, MarketVault>,
    #[account(
        mut,
        seeds = [b"position", market.key().as_ref(), trader.key().as_ref()],
        bump = position.bump
    )]
    pub position: Account<'info, Position>,
    /// CHECK: deserialized manually
    pub market: AccountInfo<'info>,
    /// CHECK: deserialized manually
    pub oracle_feed: AccountInfo<'info>,
    /// CHECK: compared against market.owner
    pub factory_program: UncheckedAccount<'info>,
    /// CHECK: compared against oracle_feed.owner
    pub oracle_program: UncheckedAccount<'info>,
    pub trader: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}
