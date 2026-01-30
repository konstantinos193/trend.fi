use anchor_lang::prelude::*;
use trendfi_shared::MAX_TOPIC_LENGTH;

use crate::error::FactoryError;

pub fn normalize_topic(topic: String) -> Result<String> {
    let trimmed = topic.trim();
    require!(!trimmed.is_empty(), FactoryError::TopicEmpty);
    require!(
        trimmed.chars().count() <= MAX_TOPIC_LENGTH,
        FactoryError::TopicTooLong
    );
    Ok(trimmed.to_string())
}
