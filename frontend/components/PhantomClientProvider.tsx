"use client";

import type { ReactNode } from "react";
import { AddressType } from "@phantom/browser-sdk";
import { PhantomProvider, darkTheme, type PhantomSDKConfig } from "@phantom/react-sdk";

const phantomConfig: PhantomSDKConfig = {
  providers: ["injected"],
  addressTypes: [AddressType.solana],
};

interface PhantomClientProviderProps {
  children: ReactNode;
}

export function PhantomClientProvider({ children }: PhantomClientProviderProps) {
  return (
    <PhantomProvider config={phantomConfig} theme={darkTheme} appName="TrendFi">
      {children}
    </PhantomProvider>
  );
}
