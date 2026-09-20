import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, switchNetwork, ETHEREUM_CONFIG } from './config';

export interface UseWalletReturn {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToNetwork: (networkName: keyof typeof ETHEREUM_CONFIG.networks) => Promise<void>;
  signer: ethers.JsonRpcSigner | null;
}

export const useWallet = (): UseWalletReturn => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balance = await provider.getBalance(address);
          const network = await provider.getNetwork();
          
          setAddress(address);
          setBalance(ethers.formatEther(balance));
          setChainId(Number(network.chainId));
          setIsConnected(true);
          setSigner(signer);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    checkConnection();
  };

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    setIsConnecting(true);
    
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await checkConnection();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance('0');
    setChainId(null);
    setIsConnected(false);
    setSigner(null);
  };

  const switchToNetwork = async (networkName: keyof typeof ETHEREUM_CONFIG.networks) => {
    const network = ETHEREUM_CONFIG.networks[networkName];
    await switchNetwork(network.chainId);
  };

  return {
    address,
    balance,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchToNetwork,
    signer,
  };
};

export interface UseContractReturn<T> {
  contract: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useContract = <T>(
  contractName: keyof typeof ETHEREUM_CONFIG.contracts,
  signer: ethers.JsonRpcSigner | null
): UseContractReturn<T> => {
  const [contract, setContract] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!signer) {
        setContract(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { getContract } = await import('./config');
        const contractInstance = getContract(contractName, signer);
        setContract(contractInstance as T);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contract');
        console.error('Error loading contract:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [contractName, signer]);

  return { contract, isLoading, error };
};
