import { ethers } from 'ethers';
import { ETHEREUM_CONFIG } from './config';

export const formatEther = (value: string | bigint | number): string => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value);
};

export const formatUnits = (value: string | bigint | number, decimals: number): string => {
  return ethers.formatUnits(value, decimals);
};

export const parseUnits = (value: string, decimals: number): bigint => {
  return ethers.parseUnits(value, decimals);
};

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const getTransactionUrl = (txHash: string, networkName: keyof typeof ETHEREUM_CONFIG.networks = 'localhost'): string => {
  const network = ETHEREUM_CONFIG.networks[networkName];
  
  if (networkName === 'localhost') {
    return `http://localhost:8545/tx/${txHash}`;
  } else if (networkName === 'sepolia') {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  
  return `https://etherscan.io/tx/${txHash}`;
};

export const getAddressUrl = (address: string, networkName: keyof typeof ETHEREUM_CONFIG.networks = 'localhost'): string => {
  const network = ETHEREUM_CONFIG.networks[networkName];
  
  if (networkName === 'localhost') {
    return `http://localhost:8545/address/${address}`;
  } else if (networkName === 'sepolia') {
    return `https://sepolia.etherscan.io/address/${address}`;
  }
  
  return `https://etherscan.io/address/${address}`;
};

export const waitForTransaction = async (txHash: string, provider: ethers.Provider): Promise<ethers.TransactionReceipt> => {
  return await provider.waitForTransaction(txHash, 1, 60000); // 1 confirmation, 60 second timeout
};

export const estimateGas = async (
  contract: ethers.Contract,
  method: string,
  args: any[] = [],
  overrides: ethers.Overrides = {}
): Promise<bigint> => {
  return await contract[method].estimateGas(...args, overrides);
};

export const calculatePnl = (
  isLong: boolean,
  entryPrice: number,
  exitPrice: number,
  leverage: number = 10
): number => {
  if (isLong) {
    return ((exitPrice - entryPrice) / entryPrice) * leverage;
  } else {
    return ((entryPrice - exitPrice) / entryPrice) * leverage;
  }
};

export const calculateLeverage = (
  collateral: number,
  positionSize: number
): number => {
  return positionSize / collateral;
};

export const calculateLiquidationPrice = (
  isLong: boolean,
  entryPrice: number,
  leverage: number,
  maintenanceMargin: number = 0.1
): number => {
  if (isLong) {
    return entryPrice * (1 - (1 / leverage) + maintenanceMargin);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
  }
};

export const formatPrice = (price: number | string, decimals: number = 2): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toFixed(decimals);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const getNetworkName = (chainId: number): string => {
  const network = Object.values(ETHEREUM_CONFIG.networks).find(n => n.chainId === chainId);
  return network?.name || 'Unknown';
};

export const isSupportedNetwork = (chainId: number): boolean => {
  return Object.values(ETHEREUM_CONFIG.networks).some(n => n.chainId === chainId);
};
