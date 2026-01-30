'use client';

import {
  useAccounts,
  useConnect,
  useDisconnect,
  useIsExtensionInstalled,
  usePhantom,
} from "@phantom/react-sdk";

export default function WalletPanel() {
  const accounts = useAccounts();
  const { isConnected, isLoading } = usePhantom();
  const { connect, isConnecting, isLoading: connectLoading, error: connectError } = useConnect();
  const { disconnect, isDisconnecting } = useDisconnect();
  const { isInstalled, isLoading: extensionLoading } = useIsExtensionInstalled();

  const primaryAddress = accounts?.[0]?.address;

  return (
    <div className="wallet-panel">
      {/* Status Indicator */}
      <div className="wallet-panel__status">
        <span className={`wallet-panel__status-dot ${isConnected ? "on" : "off"}`} />
        <span className="wallet-panel__status-text">
          {isLoading ? "Initializing..." : isConnected ? "Connected" : "Not connected"}
        </span>
      </div>
      <div className="wallet-panel__chain">
        <img src="/solana-mark.svg" alt="Solana" className="wallet-panel__chain-logo" />
        <span>Solana</span>
      </div>

      {/* Connect Button */}
      {!isConnected && (
        <div className="wallet-panel__actions">
          <button
            type="button"
            className="wallet-panel__connect-btn"
            onClick={async () => {
              try {
                await connect({ provider: "injected" });
              } catch (error) {
                console.error("Phantom connect failed", error);
              }
            }}
            disabled={connectLoading || isConnecting || !isInstalled}
          >
            {connectLoading
              ? "Loading..."
              : isConnecting
                ? "Connecting..."
                : "Connect Phantom"}
          </button>
        </div>
      )}

      {/* Connection Info */}
      {isConnected ? (
        <div className="wallet-panel__details">
          <div className="wallet-panel__address-card">
            <p className="wallet-panel__label">Primary Address</p>
            <p className="wallet-panel__address">{formatAddress(primaryAddress)}</p>
          </div>
          
          {accounts && accounts.length > 1 && (
            <div className="wallet-panel__secondary">
              {accounts.slice(1).map((account) => (
                <div 
                  key={`${account.addressType}-${account.address}`} 
                  className="wallet-panel__secondary-card"
                >
                  <p className="wallet-panel__secondary-label">{account.addressType}</p>
                  <p className="wallet-panel__secondary-address">{formatAddress(account.address)}</p>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="wallet-panel__disconnect"
            onClick={disconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          {extensionLoading
            ? "Detecting Phantom..."
            : isInstalled 
              ? "Click connect to link your wallet" 
              : (
                <>
                  Phantom not found.{" "}
                  <a
                    className="text-cyan underline"
                    href="https://phantom.app/download"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Install
                  </a>
                </>
              )}
        </p>
      )}
      {!isConnected && connectError && (
        <p className="wallet-panel__error">
          {connectError.message || "Unable to connect to Phantom right now."}
        </p>
      )}
    </div>
  );
}

function formatAddress(address?: string) {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
