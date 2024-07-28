import { Type } from '@crypt-gain-web/api-comms/src';
import { ContractNoAbi } from '@crypt-gain-web/api-comms/src/contracts';
import {
  AddressType,
  AddressValue,
  BigUIntType,
  BigUIntValue,
  BooleanType,
  BooleanValue,
  ContractFunction,
  EnumType,
  EnumValue,
  EnumVariantDefinition,
  Interaction,
  StructType,
  TokenIdentifierType,
  TokenIdentifierValue,
  TokenPayment,
  TypedValue,
  U32Type,
  VariadicValue
} from '@multiversx/sdk-core/out';
import { oneDexAddress } from 'src/config';
import apiProvider from 'src/providers/apiProvider';
import { getNetworkConfig } from 'src/utils/dapp/getNetworkConfig';

export interface Pair {
  pair_id: number;
  state: 'ActiveButNoSwap' | 'Inactive' | 'Active';
  enabled: boolean;
  owner: string;
  first_token_id: string;
  second_token_id: string;
  lp_token_id: string;
  lp_token_decimal: number;
  first_token_reserve: string;
  second_token_reserve: string;
  lp_token_supply: string;
  lp_token_roles_are_set: boolean;
}

class OneDexSC extends ContractNoAbi {
  async viewPairs() {
    const pairs = (await this.queryEndpoint('viewPairs')).values.map<Pair>(
      (pairRaw) => {
        const {
          pair_id,
          state,
          enabled,
          owner,
          first_token_id,
          second_token_id,
          lp_token_id,
          lp_token_decimal,
          first_token_reserve,
          second_token_reserve,
          lp_token_supply,
          lp_token_roles_are_set
        } = this.decoder
          .decodeTopLevel(
            pairRaw,
            new StructType('Pair', [
              {
                name: 'pair_id',
                type: new U32Type(),
                description: ''
              },
              {
                name: 'state',
                type: new EnumType(
                  'State',
                  ['Inactive', 'Active', 'ActiveButNoSwap'].map(
                    (variant, index) =>
                      new EnumVariantDefinition(variant, index)
                  )
                ),
                description: ''
              },
              {
                name: 'enabled',
                type: new BooleanType(),
                description: ''
              },
              {
                name: 'owner',
                type: new AddressType(),
                description: ''
              },
              {
                name: 'first_token_id',
                type: new TokenIdentifierType(),
                description: ''
              },
              {
                name: 'second_token_id',
                type: new TokenIdentifierType(),
                description: ''
              },
              {
                name: 'lp_token_id',
                type: new TokenIdentifierType(),
                description: ''
              },
              {
                name: 'lp_token_decimal',
                type: new U32Type(),
                description: ''
              },
              {
                name: 'first_token_reserve',
                type: new BigUIntType(),
                description: ''
              },
              {
                name: 'second_token_reserve',
                type: new BigUIntType(),
                description: ''
              },
              {
                name: 'lp_token_supply',
                type: new BigUIntType(),
                description: ''
              },
              {
                name: 'lp_token_roles_are_set',
                type: new BooleanType(),
                description: ''
              }
            ]) as unknown as Type
          )
          .valueOf();

        return {
          pair_id: +pair_id,
          state: (<EnumValue>state).name as any,
          enabled: Boolean(enabled),
          owner: (<AddressValue>owner).valueOf().bech32(),
          first_token_id,
          second_token_id,
          lp_token_id,
          lp_token_decimal: +lp_token_decimal,
          first_token_reserve: first_token_reserve.toFixed(0),
          second_token_reserve: second_token_reserve.toFixed(0),
          lp_token_supply: lp_token_supply.toFixed(0),
          lp_token_roles_are_set: Boolean(lp_token_roles_are_set)
        };
      }
    );

    return pairs;
  }

  async getWegldTokenId() {
    const [wEGLDTokenID] = (await this.queryEndpoint('getWegldTokenId')).values;

    return this.decoder
      .decodeTopLevel<TokenIdentifierValue>(
        wEGLDTokenID,
        new TokenIdentifierType()
      )
      .valueOf();
  }

  async getMultiPathAmountOut(amount: string, path: string[]) {
    const [amount_out] = (
      await this.queryEndpoint('getMultiPathAmountOut', [
        new BigUIntValue(amount),
        VariadicValue.fromItems(
          ...path.map((token) => new TokenIdentifierValue(token))
        )
      ])
    ).values;

    return this.decoder
      .decodeTopLevel<BigUIntValue>(amount_out, new BigUIntType())
      .valueOf();
  }

  private getChainID() {
    const id = this.chainID || getNetworkConfig()?.ChainID;
    if (!id) {
      throw new Error('Chain ID not set, please try again');
    }

    return id;
  }

  private makeFactory({
    func,
    args = []
  }: {
    func: string;
    args?: TypedValue[];
  }) {
    const interaction = new Interaction(
      this.contract,
      new ContractFunction(func),
      args
    );

    interaction.withChainID(this.getChainID());

    return interaction;
  }

  makeSwapMultiTokensFixedInput({
    amount_out,
    path,
    unwrap_required = false,
    sendValue
  }: {
    amount_out: string;
    path: string[];
    unwrap_required?: boolean;
    sendValue: string | TokenPayment;
  }) {
    const interaction = this.makeFactory({
      func: 'swapMultiTokensFixedInput',
      args: [
        new BigUIntValue(amount_out),
        new BooleanValue(unwrap_required),
        VariadicValue.fromItems(
          ...path.map((token) => new TokenIdentifierValue(token))
        )
      ]
    });

    interaction.withGasLimit(50_000_000);

    typeof sendValue == 'string'
      ? interaction.withValue(sendValue)
      : interaction.withSingleESDTTransfer(sendValue);

    return interaction.buildTransaction();
  }

  makeAddLiquidity({
    egldAmt,
    cgAmt,
    wegldID,
    cgIdentifier,
    sender
  }: {
    egldAmt: string;
    cgAmt: string;
    wegldID: string;
    cgIdentifier: string;
    sender: string;
  }) {
    const interaction = this.makeFactory({
      func: 'addLiquidity',
      args: [new BigUIntValue(1), new BigUIntValue(1)]
    });

    interaction.withGasLimit(20_000_000);
    interaction.withMultiESDTNFTTransfer(
      [
        TokenPayment.fungibleFromAmount(cgIdentifier, cgAmt, 0),
        TokenPayment.fungibleFromAmount(wegldID, egldAmt, 0)
      ],
      { bech32: () => sender }
    );

    return interaction.buildTransaction();
  }

  makeRemoveLiquidity({ removeAmt }: { removeAmt: string }) {
    const interaction = this.makeFactory({
      func: 'removeLiquidity',
      args: [new BigUIntValue(0), new BigUIntValue(0), new BooleanValue(true)]
    });

    interaction.withGasLimit(20_000_000);
    interaction.withSingleESDTTransfer(
      TokenPayment.fungibleFromAmount('', removeAmt, 0)
    );

    return interaction.buildTransaction();
  }
}

const oneDexSc = new OneDexSC(oneDexAddress, '', apiProvider);

export default oneDexSc;
