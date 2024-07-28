"use client";

import React from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import BootstrapClient from "~~/components/BootstrapClient";

const queryClient = new QueryClient();

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider avatar={BlockieAvatar} theme={darkTheme()}>
          {children}
          <BootstrapClient />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
