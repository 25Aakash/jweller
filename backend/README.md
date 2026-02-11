# White-Label Jeweller Platform - Backend

Node.js/Express backend API for the white-label jeweller platform with multi-tenant architecture.

## Features

- 🔐 JWT-based authentication (OTP for customers, email/password for admins)
- 👥 Multi-tenant architecture with jeweller isolation
- 💰 Wallet system with Razorpay payment integration
- 🥇 Gold price management with margin configuration
- 📊 Gold booking system with price locking
- 🔒 Row-level security in PostgreSQL
- 📝 Comprehensive audit logging
- ⚡ Rate limiting and security middleware

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Razorpay account (test mode for development)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## Database Setup

```bash
# Create database
createdb jeweller_platform

# Run migrations
psql -d jeweller_platform -f migrations/001_initial_schema.sql
psql -d jeweller_platform -f migrations/002_row_level_security.sql

# Seed development data (optional)
psql -d jeweller_platform -f seeds/dev_seed.sql
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Gold Price & Booking
- `GET /api/gold/current-price` - Get current gold price
- `GET /api/gold/calculate-grams` - Calculate gold grams
- `POST /api/gold/book` - Create gold booking
- `GET /api/gold/bookings` - Get user bookings
- `POST /api/gold/admin/set-price` - Set MCX price (Admin)
- `PUT /api/gold/admin/margin` - Update margin (Admin)
- `GET /api/gold/admin/price-history` - Price history (Admin)
- `GET /api/gold/admin/bookings` - All bookings (Admin)

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/add-money` - Create payment order
- `POST /api/wallet/verify-payment` - Verify payment
- `POST /api/wallet/webhook` - Razorpay webhook

## Environment Variables

See `.env.example` for all required environment variables.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Joi validation schemas
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── migrations/          # Database migrations
├── seeds/               # Database seed data
└── tests/               # Test files
```

## Security Features

- JWT authentication with refresh tokens
- Row-level security in PostgreSQL
- Rate limiting on sensitive endpoints
- Helmet security headers
- Input validation with Joi
- SQL injection prevention
- XSS protection
- CORS configuration

## License

MIT
