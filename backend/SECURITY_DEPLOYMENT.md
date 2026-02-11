# Security & Deployment Guide

## Security Improvements Implemented

### 1. Strong JWT Secrets ✅
- **Before:** Simple development strings
- **After:** 128-character cryptographically random keys
- **Location:** `.env` file (JWT_SECRET, JWT_REFRESH_SECRET)

### 2. Enhanced CORS Configuration ✅
- **Multiple Origins Support:** Configure via `CORS_ORIGINS` environment variable
- **Production Safety:** No origins allowed by default in production
- **Development Mode:** All origins allowed for testing
- **Configuration:** Comma-separated list in `.env`

```bash
# Example
CORS_ORIGINS=https://app.example.com,https://admin.example.com
```

### 3. Additional Security Headers ✅
- **X-Frame-Options:** Prevents clickjacking
- **X-Content-Type-Options:** Prevents MIME sniffing
- **X-XSS-Protection:** Enables XSS filtering
- **Referrer-Policy:** Controls referrer information
- **Content-Security-Policy:** (Production only) Restricts resource loading

### 4. Input Sanitization ✅
- Removes null bytes and control characters
- Sanitizes request body, query params, and URL params
- Prevents injection attacks

### 5. Production Environment Template ✅
- **File:** `.env.production`
- **Purpose:** Template for production deployment
- **Includes:** All required variables with placeholders

## Configuration Files

### Development (.env)
- ✅ Strong JWT secrets
- ✅ SMS API configured
- ✅ Gold price API configured
- ⚠️ Razorpay keys (placeholder)

### Production (.env.production)
- Template with placeholders
- **Action Required:** Fill in production values before deployment

## Deployment Checklist

### Before Deploying

1. **Copy production template:**
   ```bash
   cp .env.production .env
   ```

2. **Generate new JWT secrets:**
   ```bash
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Configure database:**
   - Set production database host, credentials
   - Enable SSL: `DB_SSL=true`

4. **Configure CORS:**
   ```bash
   CORS_ORIGINS=https://your-app.com,https://your-admin.com
   ```

5. **Set environment:**
   ```bash
   NODE_ENV=production
   ```

6. **Configure Razorpay:**
   - Get production keys from Razorpay dashboard
   - Update RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

7. **Set application URLs:**
   ```bash
   APP_URL=https://api.your-domain.com
   FRONTEND_URL=https://your-domain.com
   ```

### Security Best Practices

#### ✅ Implemented
- Strong JWT secrets (128-char)
- Helmet.js security headers
- Additional custom security headers
- Input sanitization
- Rate limiting
- CORS configuration
- Request logging
- Graceful shutdown handling
- Error handling middleware

#### ⚠️ For Production Deployment
- [ ] Enable HTTPS/SSL certificate
- [ ] Use environment variables from hosting platform (don't commit .env)
- [ ] Set up database backups
- [ ] Configure monitoring/alerting
- [ ] Set up log aggregation
- [ ] Enable firewall rules
- [ ] Use secrets manager for sensitive data

## Mobile App Configuration

### Update API URL for Production

**File:** `mobile/src/api/client.ts`

```typescript
// Development
const API_BASE_URL = 'http://192.168.1.33:3000/api';

// Production
const API_BASE_URL = 'https://api.your-domain.com/api';
```

**Recommended:** Use environment variables:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.33:3000/api'
  : 'https://api.your-domain.com/api';
```

## Testing Security Improvements

### 1. Test JWT Tokens
```bash
# Login and check token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"8476976540","password":"Test@123","jeweller_id":"550e8400-e29b-41d4-a716-446655440000"}'
```

### 2. Test CORS
```bash
# Should work in development
curl -X GET http://localhost:3000/api/health \
  -H "Origin: http://example.com"
```

### 3. Test Security Headers
```bash
# Check response headers
curl -I http://localhost:3000/api/health
```

Should see:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## What's Production Ready

✅ **Backend Security:**
- Strong encryption keys
- Security headers
- Input validation
- Rate limiting
- Error handling

✅ **Authentication:**
- OTP verification
- Password hashing
- JWT tokens
- Session management

✅ **API Protection:**
- CORS configuration
- Request sanitization
- Logging

## What Still Needs Setup

⚠️ **Infrastructure:**
- Cloud hosting (AWS/DigitalOcean/Heroku)
- Production database
- HTTPS certificate
- Domain name

⚠️ **Payment:**
- Razorpay production account
- Production API keys
- Webhook configuration

⚠️ **Mobile App:**
- Update API URL
- Build production APK/IPA
- Submit to app stores

## Next Steps

1. **For Testing:** App is ready, test all flows locally
2. **For Production:** 
   - Set up cloud hosting
   - Configure production database
   - Get Razorpay production keys
   - Deploy backend
   - Build and publish mobile app

**Estimated Time:** 1-2 weeks for full production deployment
