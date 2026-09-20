const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';

if (!ORACLE_PRIVATE_KEY) {
  throw new Error('ORACLE_PRIVATE_KEY environment variable is required');
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const oracleWallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);

router.post('/sign-trend-data', async (req, res) => {
  try {
    const { trendId, trendName, trendValue, timestamp } = req.body;
    
    if (!trendId || !trendName || trendValue === undefined || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const messageHash = ethers.solidityPackedKeccak256(
      ['uint256', 'string', 'uint256', 'uint256'],
      [trendId, trendName, trendValue, timestamp]
    );

    const signature = await oracleWallet.signMessage(ethers.getBytes(messageHash));

    res.json({
      trendId,
      trendName,
      trendValue,
      timestamp,
      signature,
      oracleAddress: oracleWallet.address
    });
  } catch (error) {
    console.error('Error signing trend data:', error);
    res.status(500).json({ error: 'Failed to sign trend data' });
  }
});

router.get('/oracle-address', (req, res) => {
  res.json({ oracleAddress: oracleWallet.address });
});

module.exports = router;
