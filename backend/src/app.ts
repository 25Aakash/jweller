import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limit';
import { securityHeaders, sanitizeInput } from './middleware/security';
import logger from './utils/logger';

dotenv.config();

const app: Application = express();

// Trust proxy (Render, Railway, etc. sit behind a reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
        ? [] // No origins allowed in production without explicit configuration
        : '*'; // Allow all in development

app.use(
    cors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 86400, // 24 hours
    })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/', generalLimiter);

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'White-Label Jeweller Platform API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            gold: '/api/gold',
            wallet: '/api/wallet',
        },
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
