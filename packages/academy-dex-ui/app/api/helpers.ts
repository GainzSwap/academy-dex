import { createClient, http } from "viem";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

export type ChainID = (typeof scaffoldConfig)["targetNetworks"][number]["id"];

export const wagmiConfigServer = (chainID: ChainID) =>
  createConfig({
    chains: [scaffoldConfig.targetNetworks.find(network => network.id == chainID)!],
    ssr: true,
    client({ chain }) {
      return createClient({
        chain,
        transport: http(getAlchemyHttpUrl(chain.id)),
      });
    },
  });
