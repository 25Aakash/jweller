/**
 * Quick test script to verify OTP and SMS integration
 * Run with: node test-otp.js
 */

const axios = require('axios');

const API_BASE = 'http://192.168.1.33:3000/api';
const JEWELLER_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_PHONE = '8476976540';

async function testOTPFlow() {
    console.log('🧪 Testing OTP Flow...\n');

    try {
        // Step 1: Send OTP
        console.log('📱 Step 1: Sending OTP to', TEST_PHONE);
        const otpResponse = await axios.post(`${API_BASE}/auth/send-otp`, {
            phone_number: TEST_PHONE,
            jeweller_id: JEWELLER_ID
        });
        
        console.log('✅ OTP sent successfully!');
        console.log('Response:', JSON.stringify(otpResponse.data, null, 2));
        console.log('\n⏰ OTP expires at:', otpResponse.data.expires_at);
        console.log('\n📝 Check your phone for the OTP SMS');
        console.log('💡 In development mode, check backend logs for the OTP\n');

        // Instructions for next steps
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Next Steps:');
        console.log('1. Check your phone (8476976540) for the OTP SMS');
        console.log('2. Use the OTP to register with this command:\n');
        console.log('   node -e "const axios = require(\'axios\'); axios.post(\'http://192.168.1.33:3000/api/auth/register\', {phone_number: \'8476976540\', otp_code: \'YOUR_OTP\', jeweller_id: \'550e8400-e29b-41d4-a716-446655440000\', name: \'Test User\', password: \'Test@123\', state: \'Delhi\', city: \'New Delhi\'}).then(r => console.log(JSON.stringify(r.data, null, 2))).catch(e => console.error(e.response.data));"');
        console.log('\n3. Then login with password:\n');
        console.log('   node -e "const axios = require(\'axios\'); axios.post(\'http://192.168.1.33:3000/api/auth/login\', {phone_number: \'8476976540\', password: \'Test@123\', jeweller_id: \'550e8400-e29b-41d4-a716-446655440000\'}).then(r => console.log(JSON.stringify(r.data, null, 2))).catch(e => console.error(e.response.data));"');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

// Run the test
testOTPFlow();
