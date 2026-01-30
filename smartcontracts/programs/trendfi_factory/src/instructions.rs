use anchor_lang::prelude::*;
use trendfi_shared::state::{MarketFactory, TrendMarket};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateMarketArgs {
    pub topic: String,
    pub base_price: u64,
    pub expires_at: i64,
    pub momentum: i64,
    pub velocity: i64,
    pub raw_score: u64,
}

#[derive(Accounts)]
pub struct InitializeFactory<'info> {
    #[account(init, payer = authority, space = MarketFactory::LEN, seeds = [b"factory"], bump)]
    pub factory: Account<'info, MarketFactory>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMarket<'info> {
    #[account(mut, seeds = [b"factory"], bump = factory.bump)]
    pub factory: Account<'info, MarketFactory>,
    #[account(
        init,
        payer = creator,
        space = TrendMarket::LEN,
        seeds = [
            b"market",
            factory.key().as_ref(),
            factory.market_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub market: Account<'info, TrendMarket>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct SettleMarket<'info> {
    #[account(mut, seeds = [b"factory"], bump = factory.bump)]
    pub factory: Account<'info, MarketFactory>,
    #[account(
        mut,
        seeds = [
            b"market",
            factory.key().as_ref(),
            market.index.to_le_bytes().as_ref()
        ],
        bump = market.bump
    )]
    pub market: Account<'info, TrendMarket>,
    pub oracle_feed: AccountInfo<'info>,
    /// CHECK: validated against oracle_feed.owner at runtime
    pub oracle_program: UncheckedAccount<'info>,
    pub clock: Sysvar<'info, Clock>,
}
