use anchor_lang::prelude::*;
use trendfi_shared::{OracleFeed, OracleSnapshot};

mod error;
mod instructions;
mod state;

use error::OracleError;
use instructions::{CreateFeed, InitializeOracle, UpdateFeed};
use state::OracleConfig;

declare_id!("AoZnjiFNkMH2mGKUfqoF6PTaoUMK4H4GbwXva5Jg1RGz");

#[program]
pub mod trendfi_oracle {
    use super::*;

    pub fn initialize_oracle(ctx: Context<InitializeOracle>) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle;
        oracle.authority = ctx.accounts.authority.key();
        oracle.bump = *ctx.bumps.get("oracle").unwrap();
        Ok(())
    }

    pub fn create_feed(ctx: Context<CreateFeed>, snapshot: OracleSnapshot) -> Result<()> {
        let oracle = &ctx.accounts.oracle;
        require_keys_eq!(
            oracle.authority,
            ctx.accounts.authority.key(),
            OracleError::UnauthorizedOracle
        );

        let feed = &mut ctx.accounts.feed;
        feed.market = ctx.accounts.market.key();
        feed.momentum = snapshot.momentum;
        feed.velocity = snapshot.velocity;
        feed.raw_score = snapshot.raw_score;
        feed.last_updated = snapshot.timestamp;
        Ok(())
    }

    pub fn update_feed(ctx: Context<UpdateFeed>, snapshot: OracleSnapshot) -> Result<()> {
        let oracle = &ctx.accounts.oracle;
        require_keys_eq!(
            oracle.authority,
            ctx.accounts.authority.key(),
            OracleError::UnauthorizedOracle
        );

        let feed = &mut ctx.accounts.feed;
        require!(
            snapshot.timestamp > feed.last_updated,
            OracleError::StaleSnapshot
        );

        feed.momentum = snapshot.momentum;
        feed.velocity = snapshot.velocity;
        feed.raw_score = snapshot.raw_score;
        feed.last_updated = snapshot.timestamp;
        Ok(())
    }
}
