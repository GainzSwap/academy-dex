import { ContractNoAbi } from "@crypt-gain-web/api-comms/src/contracts";
import {
  ContractFunction,
  Interaction,
  TokenIdentifierType,
  TokenIdentifierValue,
  TokenPayment,
  TypedValue,
} from "@multiversx/sdk-core/out";
import { getNetworkConfig } from "src/utils/dapp/getNetworkConfig";

export class WrappedEGLDSC extends ContractNoAbi {
  async getWrappedEgldTokenId() {
    const [wEGLDTokenID] = (await this.queryEndpoint("getWrappedEgldTokenId")).values;

    return this.decoder.decodeTopLevel<TokenIdentifierValue>(wEGLDTokenID, new TokenIdentifierType()).valueOf();
  }

  private getChainID() {
    const id = this.chainID || getNetworkConfig()?.ChainID;
    if (!id) {
      throw new Error("Chain ID not set, please try again");
    }

    return id;
  }

  private makeFactory({ func, args = [] }: { func: string; args?: TypedValue[] }) {
    const interaction = new Interaction(this.contract, new ContractFunction(func), args);

    interaction.withChainID(this.getChainID());

    return interaction;
  }

  makeWrapEGLD({ amt }: { amt: string }) {
    const interaction = this.makeFactory({ func: "wrapEgld" }).withGasLimit(5_000_000).withValue(amt);

    return interaction.buildTransaction();
  }

  makeUnwrapEGLD(payment: TokenPayment) {
    const interaction = this.makeFactory({ func: "unwrapEgld" });
    interaction.withGasLimit(5_000_000).withSingleESDTTransfer(payment);

    return interaction.buildTransaction();
  }
}
