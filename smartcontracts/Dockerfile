FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system deps
RUN apt update && apt install -y \
  curl \
  build-essential \
  pkg-config \
  libssl-dev \
  git \
  ca-certificates \
  clang \
  cmake \
  llvm \
  protobuf-compiler \
  libudev-dev

# Install Rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Solana CLI (Anchor-compatible)
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
RUN cargo install --git https://github.com/solana-labs/solana --tag v1.18.4 cargo-build-sbf

WORKDIR /workspace
