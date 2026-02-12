import { Router } from 'express';
import authRoutes from './auth.routes';
import goldRoutes from './gold.routes';
import silverRoutes from './silver.routes';
import walletRoutes from './wallet.routes';
import jewellerRoutes from './jeweller.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/gold', goldRoutes);
router.use('/silver', silverRoutes);
router.use('/wallet', walletRoutes);
router.use('/jeweller', jewellerRoutes);

export default router;
