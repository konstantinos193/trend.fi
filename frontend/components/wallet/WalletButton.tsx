'use client';

import { AddressType } from "@phantom/browser-sdk";
import {
  ConnectButton,
  useAccounts,
  useDisconnect,
  usePhantom,
} from "@phantom/react-sdk";

export default function WalletButton() {
  const accounts = useAccounts();
  const { isConnected, isLoading } = usePhantom();
  const { disconnect, isDisconnecting } = useDisconnect();

  const primaryAddress = accounts?.[0]?.address;

  if (isLoading) {
    return (
      <div className="wallet-btn wallet-btn--loading">
        <span className="wallet-btn__spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isConnected && primaryAddress) {
    return (
      <div className="wallet-btn wallet-btn--connected">
        <span className="wallet-btn__dot" />
        <span className="wallet-btn__address">
          {primaryAddress.slice(0, 4)}...{primaryAddress.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          disabled={isDisconnecting}
          className="wallet-btn__disconnect"
          aria-label="Disconnect wallet"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect-wrapper">
      <ConnectButton addressType={AddressType.solana} />
    </div>
  );
}
