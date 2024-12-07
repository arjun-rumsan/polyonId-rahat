/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
  core,
  CredentialStatusType,
  IdentityCreationOptions,
} from '@0xpolygonid/js-sdk';

import {
  initInMemoryDataStorageAndWallets,
} from './walletSetup';

const rhsUrl = process.env.RHS_URL as string;

const defaultNetworkConnection = {
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
};

const defaultIdentityCreationOptions: IdentityCreationOptions = {
  method: core.DidMethod.PolygonId,
  blockchain: core.Blockchain.Polygon,
  networkId: core.NetworkId.Amoy,
  revocationOpts: {
    type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    id: "https://rhs-staging.polygonid.me"
  }
};

export const identityCreation = async () => {
  console.log('=============== key creation ===============');

  const { identityWallet } = await initInMemoryDataStorageAndWallets(defaultNetworkConnection);

  const { did, credential } = await identityWallet.createIdentity({
    ...defaultIdentityCreationOptions
  });

  console.log(credential)

  return {did}
}

