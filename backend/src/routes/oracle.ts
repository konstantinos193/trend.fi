import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

// POST /api/oracle/submit - Submit trend data
router.post('/submit', asyncHandler(async (req, res) => {
  const { trendId, price, timestamp, signature } = req.body;
  
  if (!trendId || !price || !timestamp || !signature) {
    throw createError('Trend ID, price, timestamp, and signature are required', 400);
  }

  // Mock oracle submission
  const submission = {
    id: Date.now(),
    trendId,
    price,
    timestamp,
    signature,
    verified: true,
    submittedAt: new Date()
  };

  res.status(201).json({
    success: true,
    data: submission,
    message: 'Oracle data submitted successfully'
  });
}));

// GET /api/oracle/data/:hash - Get trend data
router.get('/data/:hash', asyncHandler(async (req, res) => {
  const hash = req.params.hash;
  
  // Mock data retrieval
  const data = {
    hash,
    trendId: 1,
    price: 43567,
    timestamp: new Date(),
    verified: true
  };

  res.json({
    success: true,
    data
  });
}));

export default router;
