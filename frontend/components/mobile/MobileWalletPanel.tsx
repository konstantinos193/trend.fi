'use client';

import {
  useAccounts,
  useConnect,
  useDisconnect,
  useIsExtensionInstalled,
  usePhantom,
} from "@phantom/react-sdk";

export default function MobileWalletPanel() {
  const accounts = useAccounts();
  const { isConnected, isLoading } = usePhantom();
  const { connect, isConnecting, isLoading: connectLoading, error: connectError } = useConnect();
  const { disconnect, isDisconnecting } = useDisconnect();
  const { isInstalled, isLoading: extensionLoading } = useIsExtensionInstalled();
  const primaryAddress = accounts?.[0]?.address;

  return (
    <section id="wallet" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Wallet</h2>
          <p className="mobile-section__subtitle">Connect to trade</p>
        </div>
        <span className="mobile-pill">Phantom</span>
      </div>
      <div className="mobile-card">
        <div className="mobile-wallet__status">
          <span className={`mobile-status-dot ${isConnected ? "on" : "off"}`} />
          <span>
            {isLoading ? "Initializing..." : isConnected ? "Connected" : "Not connected"}
          </span>
        </div>
        <div className="mobile-wallet__chain">
          <img src="/solana-mark.svg" alt="Solana" className="mobile-wallet__chain-logo" />
          <span>Solana</span>
        </div>
        {!isConnected && (
          <button
            type="button"
            className="mobile-wallet__connect"
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
        )}
        {isConnected ? (
          <div className="mobile-wallet__details">
            <div>
              <span className="mobile-wallet__label">Primary Address</span>
              <p className="mobile-wallet__address">{formatAddress(primaryAddress)}</p>
            </div>
            <button
              type="button"
              className="mobile-wallet__disconnect"
              onClick={disconnect}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ) : (
          <p className="mobile-wallet__helper">
            {extensionLoading
              ? "Detecting Phantom..."
              : isInstalled
                ? "Tap connect to link your wallet"
                : (
                  <>
                    Phantom not found.{" "}
                    <a
                      className="mobile-wallet__link"
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
          <p className="mobile-wallet__error">
            {connectError.message || "Unable to connect to Phantom right now."}
          </p>
        )}
      </div>
    </section>
  );
}

function formatAddress(address?: string) {
  if (!address) return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
