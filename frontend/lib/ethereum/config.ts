import { ethers } from 'ethers';

export const ETHEREUM_CONFIG = {
  // Network configurations
  networks: {
    localhost: {
      chainId: 1337,
      name: 'localhost',
      rpcUrl: 'http://127.0.0.1:8545',
    },
    sepolia: {
      chainId: 11155111,
      name: 'sepolia',
      rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/',
    },
  },
  
  // Contract addresses (will be updated after deployment)
  contracts: {
    TREND_TOKEN: process.env.NEXT_PUBLIC_TREND_TOKEN_ADDRESS || '',
    TREND_ORACLE: process.env.NEXT_PUBLIC_TREND_ORACLE_ADDRESS || '',
    TREND_MARKET: process.env.NEXT_PUBLIC_TREND_MARKET_ADDRESS || '',
    TREND_FI: process.env.NEXT_PUBLIC_TREND_FI_ADDRESS || '',
  },
  
  // ABI files (will be imported after contract compilation)
  abis: {
    TREND_TOKEN: [] as any[],
    TREND_ORACLE: [] as any[],
    TREND_MARKET: [] as any[],
    TREND_FI: [] as any[],
  },
};

export const getProvider = (networkName: keyof typeof ETHEREUM_CONFIG.networks) => {
  const network = ETHEREUM_CONFIG.networks[networkName];
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(network.rpcUrl);
};

export const getContract = (
  contractName: keyof typeof ETHEREUM_CONFIG.contracts,
  providerOrSigner: ethers.Provider | ethers.Signer
) => {
  const address = ETHEREUM_CONFIG.contracts[contractName];
  const abi = ETHEREUM_CONFIG.abis[contractName];
  
  if (!address) {
    throw new Error(`Contract ${contractName} address not configured`);
  }
  
  return new ethers.Contract(address, abi, providerOrSigner);
};

export const switchNetwork = async (chainId: number) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Network doesn't exist, need to add it
      const network = Object.values(ETHEREUM_CONFIG.networks).find(n => n.chainId === chainId);
      if (network) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
          }],
        });
      }
    } else {
      throw error;
    }
  }
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
