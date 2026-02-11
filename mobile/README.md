# 📱 Jeweller Platform - React Native Mobile App

## ✅ Setup Complete!

This is an Expo React Native app built with TypeScript.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd ../backend
npm run dev
```

### 2. Find Your Computer's IP Address
```bash
ipconfig
```
Look for **IPv4 Address** (e.g., 192.168.1.100)

### 3. Update API URL
Edit `src/api/client.ts` and change:
```typescript
const API_BASE_URL = 'http://YOUR_IP_HERE:3000/api';
// Example: 'http://192.168.1.100:3000/api'
```

### 4. Start the App

**Option A: Run on Android Device**
```bash
npm run android
```

**Option B: Run on iOS Simulator (Mac only)**
```bash
npm run ios
```

**Option C: Run on Web**
```bash
npm run web
```

**Option D: Use Expo Go App**
```bash
npx expo start
```
Then scan the QR code with Expo Go app on your phone.

## 📱 Testing the App

### Test Credentials
- **Phone**: `9876543211`
- **OTP**: Check backend console

### Test Flow:
1. Enter phone number
2. Click "Send OTP"
3. Check backend terminal for OTP
4. Enter OTP
5. Login successful!
6. See wallet balance and gold price

## 🎯 Features

✅ Phone + OTP authentication
✅ User profile display
✅ Wallet balance
✅ Gold price display
✅ Auto-login (AsyncStorage)
✅ Pull to refresh
✅ Logout functionality

## 📁 Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios client with interceptors
│   └── endpoints.ts       # API endpoints
├── context/
│   └── AuthContext.tsx    # Authentication state
├── screens/
│   ├── PhoneInputScreen.tsx
│   ├── OTPVerificationScreen.tsx
│   └── HomeScreen.tsx
└── types/
    └── index.ts           # TypeScript types
```

## 🔧 Tech Stack

- **React Native** with Expo
- **TypeScript**
- **React Navigation** - Routing
- **React Native Paper** - UI components
- **Axios** - API calls
- **AsyncStorage** - Token storage

## 🐛 Troubleshooting

### Can't connect to backend?
- Make sure backend is running on port 3000
- Update API_BASE_URL with your computer's IP
- Make sure phone and computer are on same WiFi

### App won't start?
```bash
# Clear cache
npx expo start -c
```

### Dependencies issue?
```bash
# Reinstall
rm -rf node_modules
npm install
```

## 📊 API Integration

The app connects to your backend API:
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/wallet/balance` - Get wallet balance
- `GET /api/gold/current-price` - Get gold price
- `POST /api/auth/logout` - Logout

## ✨ No More Storage Errors!

Unlike Flutter, React Native's AsyncStorage works perfectly on all platforms:
- ✅ Android
- ✅ iOS
- ✅ Web

**Everything just works!** 🎉

