# White-Label Jeweller Platform

A complete multi-tenant SaaS platform for jewellers to offer digital gold savings to their customers. Each jeweller gets their own branded Android app with the same functionality but different branding.

## 🌟 Features

### For Customers
- 📱 OTP-based mobile login
- 💰 Digital wallet with UPI/Card payments (Razorpay)
- 🥇 Buy and save gold at locked prices
- 📊 Track gold holdings and transaction history
- 🔒 Secure and encrypted

### For Jewellers (Admin)
- 👨‍💼 Admin dashboard with analytics
- 💵 Set daily MCX gold prices
- 📈 Configure profit margins (% or fixed)
- 👥 Manage customers
- 📋 View all bookings and transactions
- 🎨 Custom branding per app

### Platform Features
- 🏢 Multi-tenant architecture
- 🔐 Row-level security
- 💳 Razorpay payment integration
- 📱 White-label mobile apps
- ☁️ AWS cloud infrastructure
- 🚀 CI/CD ready

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Multiple Branded Mobile Apps          │
│  (Jeweller A App)  (Jeweller B App)  (...)     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Shared Backend API                  │
│         (Node.js + Express + PostgreSQL)         │
│  - Multi-tenant data isolation                   │
│  - JWT authentication                            │
│  - Razorpay payments                             │
│  - Gold price management                         │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
jweller/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database, JWT, Razorpay
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, validation, rate limiting
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   └── migrations/      # Database migrations
│
├── mobile/              # Flutter mobile app
│   └── lib/
│       ├── core/        # Configuration, theme, network
│       ├── features/    # Feature modules
│       └── shared/      # Shared widgets
│
└── docs/                # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Flutter 3.19+
- Razorpay account (test mode)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Setup database
createdb jeweller_platform
psql -d jeweller_platform -f migrations/001_initial_schema.sql
psql -d jeweller_platform -f migrations/002_row_level_security.sql
psql -d jeweller_platform -f seeds/dev_seed.sql

# Start server
npm run dev
```

Server runs on `http://localhost:3000`

### Flutter Setup

```bash
cd mobile
flutter pub get
flutter run
```

## 📚 Documentation

- [Backend README](backend/README.md) - API documentation
- [Project Summary](docs/project_summary.md) - Complete overview
- [Build Progress](docs/build_progress.md) - Development status

## 🔐 Security

- JWT authentication with refresh tokens
- Row-level security in PostgreSQL
- Multi-tenant data isolation
- Rate limiting on sensitive endpoints
- Razorpay payment signature verification
- Input validation with Joi
- Encrypted token storage

## 💳 Payment Integration

Integrated with Razorpay for:
- Wallet top-ups
- UPI payments
- Card payments
- Webhook handling
- Automatic reconciliation

## 🎨 White-Label Configuration

Each jeweller app is configured with:
- Custom app name
- Unique app icon
- Custom splash screen
- Brand colors (primary/secondary)
- Jeweller ID (hardcoded per build)

## 🗄️ Database Schema

10 tables with complete relationships:
- `jewellers` - Business information
- `users` - Customers and admins
- `wallet` - Cash and gold balances
- `gold_price_config` - Daily prices
- `gold_bookings` - Gold purchases
- `transactions` - Payment records
- `otp_verifications` - OTP codes
- `refresh_tokens` - JWT tokens
- `audit_logs` - Compliance trail
- `app_versions` - Force updates

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify & login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/refresh-token` - Refresh token

### Gold & Booking
- `GET /api/gold/current-price` - Current price
- `POST /api/gold/book` - Book gold
- `GET /api/gold/bookings` - Booking history
- `POST /api/gold/admin/set-price` - Set price (Admin)

### Wallet
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/add-money` - Create payment
- `POST /api/wallet/verify-payment` - Verify payment

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Flutter tests
cd mobile
flutter test
```

## 📦 Deployment

### Backend (AWS)
- EC2 or ECS for API
- RDS for PostgreSQL
- S3 for assets
- CloudWatch for logs

### Mobile App
- Build flavors for each jeweller
- Separate Play Store listings
- Central Play Console management

## 🔧 Environment Variables

See `backend/.env.example` for required variables:
- Database credentials
- JWT secrets
- Razorpay API keys
- SMS API configuration

## 📊 Current Status

**✅ Backend: 100% Complete**
- Full REST API
- Authentication
- Payment integration
- Multi-tenant isolation
- All business logic

**🔨 Flutter: 20% Complete**
- Core infrastructure
- Theme system
- Network layer
- Storage layer

## 🎯 Roadmap

- [x] Backend API
- [x] Database schema
- [x] Authentication system
- [x] Payment integration
- [ ] Flutter UI screens
- [ ] State management (BLoC)
- [ ] Admin dashboard
- [ ] CI/CD pipeline
- [ ] First production deployment

## 📝 License

MIT

## 👥 Support

For questions or issues:
1. Check documentation in `/docs`
2. Review API endpoints in backend README
3. Test with provided seed data

## 🙏 Acknowledgments

- Razorpay for payment gateway
- PostgreSQL for robust database
- Flutter for cross-platform development
- Express.js for backend framework

---

**Built with ❤️ for jewellers to empower their customers with digital gold savings**
