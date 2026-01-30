use anchor_lang::prelude::*;
use anchor_lang::AccountDeserialize;
use trendfi_shared::{
    compute_momentum_multiplier, OracleFeed, TrendMarket, MIN_EXPIRY_SECONDS,
    MIN_MOMENTUM_THRESHOLD, MIN_VELOCITY_THRESHOLD,
};

mod error;
mod instructions;
mod utils;

use error::FactoryError;
use instructions::{CreateMarket, CreateMarketArgs, InitializeFactory, SettleMarket};
use trendfi_shared::MarketFactory;
use utils::normalize_topic;

declare_id!("GoPZh3S6q3K4XqEZPBSKo3qJ5PWYcdHiR4wrMX6si4kn");

#[program]
pub mod trendfi_factory {
    use super::*;

    pub fn initialize_factory(ctx: Context<InitializeFactory>) -> Result<()> {
        let factory = &mut ctx.accounts.factory;
        factory.authority = ctx.accounts.authority.key();
        factory.bump = *ctx.bumps.get("factory").unwrap();
        factory.market_count = 0;
        Ok(())
    }

    pub fn create_market(ctx: Context<CreateMarket>, args: CreateMarketArgs) -> Result<()> {
        require!(
            args.momentum >= MIN_MOMENTUM_THRESHOLD,
            FactoryError::MomentumTooLow
        );
        require!(
            args.velocity >= MIN_VELOCITY_THRESHOLD,
            FactoryError::VelocityTooLow
        );

        let clock = &ctx.accounts.clock;
        require!(
            args.expires_at >= clock.unix_timestamp + MIN_EXPIRY_SECONDS,
            FactoryError::ExpirationTooSoon
        );

        let topic = normalize_topic(args.topic)?;

        let factory = &mut ctx.accounts.factory;
        let market = &mut ctx.accounts.market;

        market.factory = factory.key();
        market.creator = ctx.accounts.creator.key();
        market.bump = *ctx.bumps.get("market").unwrap();
        market.index = factory.market_count;
        market.topic = topic;
        market.base_price = args.base_price;
        market.expiry_ts = args.expires_at;
        market.momentum = args.momentum;
        market.velocity = args.velocity;
        market.raw_score = args.raw_score;
        market.last_updated = clock.unix_timestamp;
        market.settled = false;
        market.settlement_price = 0;

        factory.market_count = factory
            .market_count
            .checked_add(1)
            .ok_or(FactoryError::MathOverflow)?;

        Ok(())
    }

    pub fn settle_market(ctx: Context<SettleMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let clock = &ctx.accounts.clock;

        require!(
            clock.unix_timestamp >= market.expiry_ts,
            FactoryError::MarketNotExpired
        );
        require!(!market.settled, FactoryError::MarketAlreadySettled);

        require_keys_eq!(
            ctx.accounts.oracle_feed.owner,
            ctx.accounts.oracle_program.key(),
            FactoryError::InvalidOracleOwner
        );

        let feed = OracleFeed::try_deserialize(&mut &ctx.accounts.oracle_feed.data.borrow()[..])?;
        require_keys_eq!(
            feed.market,
            market.key(),
            FactoryError::OracleMarketMismatch
        );
        require!(
            feed.last_updated >= market.last_updated,
            FactoryError::StaleSnapshot
        );

        market.momentum = feed.momentum;
        market.velocity = feed.velocity;
        market.raw_score = feed.raw_score;
        market.last_updated = feed.last_updated;

        let multiplier = compute_momentum_multiplier(feed.momentum);
        let settlement_price = (market.base_price as u128)
            .checked_mul(multiplier)
            .ok_or(FactoryError::MathOverflow)?
            .checked_div(1000)
            .ok_or(FactoryError::MathOverflow)? as u64;

        market.settlement_price = settlement_price;
        market.settled = true;

        Ok(())
    }
}
