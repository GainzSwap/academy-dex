"use client";

import React from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import BootstrapClient from "~~/components/BootstrapClient";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import useInitGlobalData from "~~/hooks/useInitGlobalData";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const queryClient = new QueryClient();

function AppInit() {
  useInitGlobalData();

  return null;
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider avatar={BlockieAvatar} theme={darkTheme()}>
          <AppInit />
          {children}
          <BootstrapClient />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
