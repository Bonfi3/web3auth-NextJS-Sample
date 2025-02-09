// lib/web3auth.ts
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IBaseProvider } from "@web3auth/base";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
if (!clientId) throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not defined in environment variables");

const web3auth = new Web3Auth({
  clientId,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x3",
    rpcTarget: "https://api.devnet.solana.com",
  },
  web3AuthNetwork: "sapphire_devnet",
  privateKeyProvider: new SolanaPrivateKeyProvider({
    config: { 
      chainConfig: { 
        chainNamespace: CHAIN_NAMESPACES.SOLANA,
        chainId: "0x3",
        rpcTarget: "https://api.devnet.solana.com"
      } 
    }
  }),
  uiConfig: {
    loginMethodsOrder: ["google"]
  }
});

let initialized = false;

const initializeWeb3Auth = async () => {
  if (!initialized) {
    try {
      await web3auth.initModal();
      initialized = true;
    } catch (error) {
      console.error("Failed to initialize Web3Auth:", error);
    }
  }
};

export { web3auth, initializeWeb3Auth };
