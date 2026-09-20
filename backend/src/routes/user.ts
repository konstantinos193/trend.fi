import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// GET /api/user/profile - Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userProfile = {
    address: req.user?.address,
    email: 'user@example.com',
    preferences: {
      defaultLeverage: '5x',
      slippage: '0.5%',
      notifications: true
    },
    createdAt: new Date('2024-01-01'),
    lastActive: new Date()
  };

  res.json({
    success: true,
    data: userProfile
  });
}));

// GET /api/user/portfolio - Get portfolio data
router.get('/portfolio', asyncHandler(async (req, res) => {
  const portfolio = {
    totalValue: 125432.89,
    totalPnL: 8234.56,
    winRate: 68.5,
    totalTrades: 147,
    activePositions: 8,
    marginUsed: 45.2,
    positions: [
      {
        id: 1,
        marketId: 1,
        isLong: true,
        margin: 1000,
        size: 5000,
        entryPrice: 43000,
        currentPrice: 43567,
        pnl: 567,
        leverage: 5
      }
    ]
  };

  res.json({
    success: true,
    data: portfolio
  });
}));

export default router;
