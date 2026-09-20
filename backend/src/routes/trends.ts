import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// Mock trends data
const mockTrends = [
  {
    id: 1,
    name: 'Bitcoin Bull Run',
    description: 'Long-term upward trend in Bitcoin price driven by institutional adoption',
    createdAt: new Date('2024-01-15'),
    active: true,
    performance: 145.6,
    accuracy: 78.5
  }
];

// GET /api/trends - List all trends
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: mockTrends,
    count: mockTrends.length
  });
}));

// GET /api/trends/:id - Get trend details
router.get('/:id', asyncHandler(async (req, res) => {
  const trendId = parseInt(req.params.id);
  const trend = mockTrends.find(t => t.id === trendId);
  
  if (!trend) {
    throw createError('Trend not found', 404);
  }

  res.json({
    success: true,
    data: trend
  });
}));

export default router;
