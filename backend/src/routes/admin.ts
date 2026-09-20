import { Router } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { adminAuthMiddleware } from '../middleware/auth';

const router = Router();

// Apply admin auth to all admin routes
router.use(adminAuthMiddleware);

// GET /api/admin/system - System status
router.get('/system', asyncHandler(async (req, res) => {
  const systemStatus = {
    contracts: 'operational',
    oracle: 'operational',
    api: 'operational',
    database: 'operational',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  };

  res.json({
    success: true,
    data: systemStatus
  });
}));

// POST /api/admin/emergency - Emergency controls
router.post('/emergency', asyncHandler(async (req, res) => {
  const { action } = req.body;
  
  if (!['pause', 'resume'].includes(action)) {
    throw createError('Invalid action. Must be pause or resume', 400);
  }

  // Mock emergency control
  const result = {
    action,
    executed: true,
    timestamp: new Date(),
    status: action === 'pause' ? 'paused' : 'active'
  };

  res.json({
    success: true,
    data: result,
    message: `Emergency ${action} executed successfully`
  });
}));

export default router;
