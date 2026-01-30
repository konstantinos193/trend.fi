import { useEffect, useState } from "react";
import { usePhantom, useSolana } from "@phantom/react-sdk";

type SolanaAddressState = {
  address?: string;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  isConnected: boolean;
};

function toBase58(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toBase58" in value) {
    const maybe = value as { toBase58?: () => string };
    if (typeof maybe.toBase58 === "function") return maybe.toBase58();
  }
  return null;
}

export function useSolanaAddress(): SolanaAddressState {
  const { solana } = useSolana();
  const { isConnected } = usePhantom();
  const [state, setState] = useState<SolanaAddressState>({
    address: undefined,
    status: "idle",
    error: null,
    isConnected: false,
  });

  useEffect(() => {
    let cancelled = false;

    if (!isConnected) {
      setState({
        address: undefined,
        status: "idle",
        error: null,
        isConnected: false,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
      isConnected: true,
    }));

    solana
      .getPublicKey()
      .then((value) => {
        if (cancelled) return;
        const address = toBase58(value);
        if (!address) {
          setState({
            address: undefined,
            status: "error",
            error: "Unable to read Solana address from Phantom.",
            isConnected: true,
          });
          return;
        }
        setState({
          address,
          status: "ready",
          error: null,
          isConnected: true,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({
          address: undefined,
          status: "error",
          error: message,
          isConnected: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isConnected, solana]);

  return state;
}
