import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { io } from '../server';

const router = Router();

// POST /api/trades/open - Open position
router.post('/open', asyncHandler(async (req, res) => {
  const { marketId, isLong, margin, leverage } = req.body;
  
  if (!marketId || isLong === undefined || !margin || !leverage) {
    throw createError('Market ID, direction, margin, and leverage are required', 400);
  }

  const newPosition = {
    id: Date.now(),
    owner: req.user?.address,
    marketId,
    isLong,
    margin,
    size: margin * leverage,
    entryPrice: 43567, // Mock current price
    entryTimestamp: new Date(),
    closed: false
  };

  // Emit real-time update
  io.to(`market-${marketId}`).emit('position-opened', newPosition);
  io.to(`user-${req.user?.address}`).emit('user-position-opened', newPosition);

  res.status(201).json({
    success: true,
    data: newPosition,
    message: 'Position opened successfully'
  });
}));

// POST /api/trades/close/:positionId - Close position
router.post('/close/:positionId', asyncHandler(async (req, res) => {
  const positionId = parseInt(req.params.positionId);
  
  // Mock position closing logic
  const closedPosition = {
    id: positionId,
    closePrice: 44000,
    closeTimestamp: new Date(),
    pnl: 433, // Mock PnL calculation
    closed: true
  };

  // Emit real-time update
  io.to(`user-${req.user?.address}`).emit('position-closed', closedPosition);

  res.json({
    success: true,
    data: closedPosition,
    message: 'Position closed successfully'
  });
}));

// GET /api/trades/positions/:user - Get user positions
router.get('/positions/:user', asyncHandler(async (req, res) => {
  const userAddress = req.params.user;
  
  // Mock positions data
  const positions = [
    {
      id: 1,
      owner: userAddress,
      marketId: 1,
      isLong: true,
      margin: 1000,
      size: 5000,
      entryPrice: 43000,
      entryTimestamp: new Date(Date.now() - 3600000),
      closed: false,
      currentPrice: 43567,
      pnl: 567
    }
  ];

  res.json({
    success: true,
    data: positions,
    count: positions.length
  });
}));

// GET /api/trades/pnl/:positionId - Calculate PnL
router.get('/pnl/:positionId', asyncHandler(async (req, res) => {
  const positionId = parseInt(req.params.positionId);
  
  // Mock PnL calculation
  const pnlData = {
    positionId,
    currentPrice: 43567,
    entryPrice: 43000,
    unrealizedPnl: 567,
    unrealizedPnlPercent: 11.34,
    leverage: 5
  };

  res.json({
    success: true,
    data: pnlData
  });
}));

// GET /api/trades/history/:user - Trading history
router.get('/history/:user', asyncHandler(async (req, res) => {
  const userAddress = req.params.user;
  const { limit = 50, offset = 0 } = req.query;
  
  // Mock trading history
  const history = [
    {
      id: 1,
      marketId: 1,
      isLong: true,
      margin: 1000,
      size: 5000,
      entryPrice: 43000,
      closePrice: 44000,
      entryTimestamp: new Date(Date.now() - 86400000),
      closeTimestamp: new Date(Date.now() - 3600000),
      pnl: 1000,
      pnlPercent: 100,
      status: 'closed'
    }
  ];

  res.json({
    success: true,
    data: history,
    count: history.length,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      total: 1
    }
  });
}));

export default router;
