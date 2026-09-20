import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { io } from '../server';

const router = Router();

// Mock data - replace with actual database integration
const mockMarkets = [
  {
    id: 1,
    trendId: 1,
    trendName: 'Bitcoin Bull Run',
    currentPrice: 43567,
    totalLong: 1000000,
    totalShort: 800000,
    active: true,
    lastUpdate: new Date(),
    volume24h: 450000,
    participants: 234
  },
  {
    id: 2,
    trendId: 2,
    trendName: 'Tech Stock Rally',
    currentPrice: 125.50,
    totalLong: 500000,
    totalShort: 300000,
    active: true,
    lastUpdate: new Date(),
    volume24h: 320000,
    participants: 189
  }
];

// GET /api/markets - List all active markets
router.get('/', asyncHandler(async (req, res) => {
  const { trendId, active } = req.query;
  
  let filteredMarkets = mockMarkets;
  
  if (trendId) {
    filteredMarkets = filteredMarkets.filter(m => m.trendId === parseInt(trendId as string));
  }
  
  if (active !== undefined) {
    filteredMarkets = filteredMarkets.filter(m => m.active === (active === 'true'));
  }

  res.json({
    success: true,
    data: filteredMarkets,
    count: filteredMarkets.length
  });
}));

// GET /api/markets/:id - Get market details
router.get('/:id', asyncHandler(async (req, res) => {
  const marketId = parseInt(req.params.id);
  
  const market = mockMarkets.find(m => m.id === marketId);
  
  if (!market) {
    throw createError('Market not found', 404);
  }

  res.json({
    success: true,
    data: market
  });
}));

// POST /api/markets - Create new market (admin only)
router.post('/', asyncHandler(async (req, res) => {
  const { trendId, initialPrice } = req.body;
  
  if (!trendId || !initialPrice) {
    throw createError('Trend ID and initial price are required', 400);
  }

  const newMarket = {
    id: mockMarkets.length + 1,
    trendId,
    trendName: `Trend ${trendId}`,
    currentPrice: initialPrice,
    totalLong: 0,
    totalShort: 0,
    active: true,
    lastUpdate: new Date(),
    volume24h: 0,
    participants: 0
  };

  mockMarkets.push(newMarket);

  // Emit real-time update
  io.emit('market-created', newMarket);

  res.status(201).json({
    success: true,
    data: newMarket,
    message: 'Market created successfully'
  });
}));

// GET /api/markets/:id/positions - Get market positions
router.get('/:id/positions', asyncHandler(async (req, res) => {
  const marketId = parseInt(req.params.id);
  
  const market = mockMarkets.find(m => m.id === marketId);
  
  if (!market) {
    throw createError('Market not found', 404);
  }

  // Mock positions data
  const positions = [
    {
      id: 1,
      owner: '0x1234...5678',
      isLong: true,
      margin: 1000,
      size: 5000,
      entryPrice: 43000,
      entryTimestamp: new Date(Date.now() - 3600000),
      closed: false
    },
    {
      id: 2,
      owner: '0x8765...4321',
      isLong: false,
      margin: 800,
      size: 4000,
      entryPrice: 44000,
      entryTimestamp: new Date(Date.now() - 7200000),
      closed: false
    }
  ];

  res.json({
    success: true,
    data: positions,
    count: positions.length
  });
}));

// GET /api/markets/:id/capacity - Get market capacity
router.get('/:id/capacity', asyncHandler(async (req, res) => {
  const marketId = parseInt(req.params.id);
  
  const market = mockMarkets.find(m => m.id === marketId);
  
  if (!market) {
    throw createError('Market not found', 404);
  }

  const capacity = {
    totalLong: market.totalLong,
    totalShort: market.totalShort,
    maxCapacity: 10000000, // $10M max per side
    longAvailable: 10000000 - market.totalLong,
    shortAvailable: 10000000 - market.totalShort,
    utilization: {
      long: (market.totalLong / 10000000) * 100,
      short: (market.totalShort / 10000000) * 100
    }
  };

  res.json({
    success: true,
    data: capacity
  });
}));

// PUT /api/markets/:id/suspend - Suspend market (admin only)
router.put('/:id/suspend', asyncHandler(async (req, res) => {
  const marketId = parseInt(req.params.id);
  
  const marketIndex = mockMarkets.findIndex(m => m.id === marketId);
  
  if (marketIndex === -1) {
    throw createError('Market not found', 404);
  }

  mockMarkets[marketIndex].active = false;

  // Emit real-time update
  io.emit('market-suspended', { marketId, active: false });

  res.json({
    success: true,
    message: 'Market suspended successfully'
  });
}));

// PUT /api/markets/:id/activate - Activate market (admin only)
router.put('/:id/activate', asyncHandler(async (req, res) => {
  const marketId = parseInt(req.params.id);
  
  const marketIndex = mockMarkets.findIndex(m => m.id === marketId);
  
  if (marketIndex === -1) {
    throw createError('Market not found', 404);
  }

  mockMarkets[marketIndex].active = true;

  // Emit real-time update
  io.emit('market-activated', { marketId, active: true });

  res.json({
    success: true,
    message: 'Market activated successfully'
  });
}));

export default router;
