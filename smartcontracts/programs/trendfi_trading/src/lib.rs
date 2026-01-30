use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::AccountDeserialize;
use trendfi_shared::{compute_momentum_multiplier, OracleFeed, TrendMarket};

mod error;
mod instructions;
mod state;

use error::TradingError;
use instructions::{Deposit, InitializeVault, OpenPosition, Trade, Withdraw};
use state::{MarketVault, Position, TradeSide};

declare_id!("8n4jg5QajLtAsAVVvZpKSuuMV7JNELpgQqz7oisWhXpt");

#[program]
pub mod trendfi_trading {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.market = ctx.accounts.market.key();
        vault.bump = *ctx.bumps.get("vault").unwrap();
        Ok(())
    }

    pub fn open_position(ctx: Context<OpenPosition>) -> Result<()> {
        let position = &mut ctx.accounts.position;
        position.owner = ctx.accounts.trader.key();
        position.market = ctx.accounts.market.key();
        position.shares = 0;
        position.collateral = 0;
        position.cost_basis = 0;
        position.last_price = 0;
        position.last_trade_ts = 0;
        position.bump = *ctx.bumps.get("position").unwrap();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, lamports: u64) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.position.owner,
            ctx.accounts.trader.key(),
            TradingError::UnauthorizedTrader
        );
        require_keys_eq!(
            ctx.accounts.position.market,
            ctx.accounts.market.key(),
            TradingError::OracleMarketMismatch
        );

        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.trader.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        system_program::transfer(cpi_ctx, lamports)?;

        let position = &mut ctx.accounts.position;
        position.collateral = position
            .collateral
            .checked_add(lamports)
            .ok_or(TradingError::MathOverflow)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, lamports: u64) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.position.owner,
            ctx.accounts.trader.key(),
            TradingError::UnauthorizedTrader
        );
        require_keys_eq!(
            ctx.accounts.position.market,
            ctx.accounts.market.key(),
            TradingError::OracleMarketMismatch
        );

        let position = &mut ctx.accounts.position;
        require!(
            position.collateral >= lamports,
            TradingError::InsufficientCollateral
        );

        let vault_info = ctx.accounts.vault.to_account_info();
        let vault_balance = **vault_info.lamports.borrow();
        require!(
            vault_balance >= lamports,
            TradingError::VaultInsufficientFunds
        );

        **vault_info.try_borrow_mut_lamports()? -= lamports;
        **ctx.accounts.trader.to_account_info().try_borrow_mut_lamports()? += lamports;

        position.collateral = position
            .collateral
            .checked_sub(lamports)
            .ok_or(TradingError::MathOverflow)?;
        Ok(())
    }

    pub fn trade(ctx: Context<Trade>, side: TradeSide, quantity: u64) -> Result<()> {
        let position = &mut ctx.accounts.position;
        require_keys_eq!(
            position.owner,
            ctx.accounts.trader.key(),
            TradingError::UnauthorizedTrader
        );
        require_keys_eq!(position.market, ctx.accounts.market.key(), TradingError::OracleMarketMismatch);
        require_keys_eq!(ctx.accounts.vault.market, ctx.accounts.market.key(), TradingError::OracleMarketMismatch);

        require_keys_eq!(
            ctx.accounts.market.owner,
            ctx.accounts.factory_program.key(),
            TradingError::InvalidMarketOwner
        );
        require_keys_eq!(
            ctx.accounts.oracle_feed.owner,
            ctx.accounts.oracle_program.key(),
            TradingError::InvalidOracleOwner
        );

        let market =
            TrendMarket::try_deserialize(&mut &ctx.accounts.market.data.borrow()[..])?;
        require!(!market.settled, TradingError::MarketSettled);

        let feed =
            OracleFeed::try_deserialize(&mut &ctx.accounts.oracle_feed.data.borrow()[..])?;
        require_keys_eq!(
            feed.market,
            ctx.accounts.market.key(),
            TradingError::OracleMarketMismatch
        );

        let multiplier = compute_momentum_multiplier(feed.momentum);
        let price = (market.base_price as u128)
            .checked_mul(multiplier)
            .ok_or(TradingError::MathOverflow)?
            .checked_div(1000)
            .ok_or(TradingError::MathOverflow)? as u64;

        let cost = (price as u128)
            .checked_mul(quantity as u128)
            .ok_or(TradingError::MathOverflow)?;

        match side {
            TradeSide::Buy => {
                require!(
                    position.collateral as u128 >= cost,
                    TradingError::InsufficientCollateral
                );
                position.collateral = position
                    .collateral
                    .checked_sub(cost as u64)
                    .ok_or(TradingError::MathOverflow)?;
                position.shares = position
                    .shares
                    .checked_add(quantity)
                    .ok_or(TradingError::MathOverflow)?;
                position.cost_basis = position
                    .cost_basis
                    .checked_add(cost)
                    .ok_or(TradingError::MathOverflow)?;
            }
            TradeSide::Sell => {
                require!(
                    position.shares >= quantity,
                    TradingError::InsufficientShares
                );
                let shares_before = position.shares;
                position.shares = position
                    .shares
                    .checked_sub(quantity)
                    .ok_or(TradingError::MathOverflow)?;
                position.collateral = position
                    .collateral
                    .checked_add(cost as u64)
                    .ok_or(TradingError::MathOverflow)?;

                if shares_before > 0 && position.cost_basis > 0 {
                    let avg_cost = position.cost_basis / shares_before as u128;
                    let cost_reduction = avg_cost
                        .checked_mul(quantity as u128)
                        .ok_or(TradingError::MathOverflow)?;
                    position.cost_basis = position
                        .cost_basis
                        .checked_sub(cost_reduction)
                        .ok_or(TradingError::MathOverflow)?;
                }
            }
        }

        position.last_price = price;
        position.last_trade_ts = ctx.accounts.clock.unix_timestamp;
        Ok(())
    }
}
