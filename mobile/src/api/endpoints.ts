import apiClient, { JEWELLER_ID } from './client';

export interface SendOTPResponse {
    success: boolean;
    message: string;
    expires_at: string;
}

export interface VerifyOTPResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        phone_number: string;
        name: string;
        role: string;
        jeweller_id: string;
    };
}

export const authAPI = {
    sendOTP: async (phoneNumber: string): Promise<SendOTPResponse> => {
        const response = await apiClient.post('/auth/send-otp', {
            phone_number: phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`,
            jeweller_id: JEWELLER_ID,
        });
        return response.data;
    },

    verifyOTP: async (phoneNumber: string, otpCode: string, name?: string): Promise<VerifyOTPResponse> => {
        const response = await apiClient.post('/auth/verify-otp', {
            phone_number: phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`,
            otp_code: otpCode,
            jeweller_id: JEWELLER_ID,
            name,
        });
        return response.data;
    },

    registerWithOTP: async (phoneNumber: string, otpCode: string, name: string, password: string, state: string, city: string): Promise<VerifyOTPResponse> => {
        const response = await apiClient.post('/auth/register', {
            phone_number: phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`,
            otp_code: otpCode,
            jeweller_id: JEWELLER_ID,
            name,
            password,
            state,
            city,
        });
        return response.data;
    },

    loginWithPassword: async (phoneNumber: string, password: string): Promise<VerifyOTPResponse> => {
        const response = await apiClient.post('/auth/login', {
            phone_number: phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`,
            password,
            jeweller_id: JEWELLER_ID,
        });
        return response.data;
    },

    loginJeweller: async (email: string, password: string): Promise<VerifyOTPResponse> => {
        const response = await apiClient.post('/auth/admin/login', {
            email,
            password,
            jeweller_id: JEWELLER_ID,
        });
        return response.data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    },
};

export const walletAPI = {
    getBalance: async () => {
        const response = await apiClient.get('/wallet/balance');
        return response.data;
    },

    getTransactions: async () => {
        const response = await apiClient.get('/wallet/transactions');
        return response.data;
    },

    addMoney: async (amount: number) => {
        const response = await apiClient.post('/wallet/add-money', { amount });
        return response.data;
    },

    verifyPayment: async (paymentId: string, orderId: string, signature: string) => {
        const response = await apiClient.post('/wallet/verify-payment', {
            payment_id: paymentId,
            order_id: orderId,
            signature,
        });
        return response.data;
    },
};

export const goldAPI = {
    getCurrentPrice: async () => {
        const response = await apiClient.get('/gold/current-price');
        return response.data.price;
    },

    getLivePrice: async () => {
        const response = await apiClient.get('/gold/live-price');
        return response.data.price;
    },

    calculateGrams: async (amount: number) => {
        const response = await apiClient.post('/gold/calculate-grams', { amount });
        return response.data;
    },

    createBooking: async (amount: number, grams: number) => {
        const response = await apiClient.post('/gold/bookings', {
            amount,
            grams,
        });
        return response.data;
    },

    getBookings: async () => {
        const response = await apiClient.get('/gold/bookings');
        return response.data;
    },
};

export const silverAPI = {
    getCurrentPrice: async () => {
        const response = await apiClient.get('/silver/current-price');
        return response.data.price;
    },

    getLivePrice: async () => {
        const response = await apiClient.get('/silver/live-price');
        return response.data.price;
    },

    calculateGrams: async (amount: number) => {
        const response = await apiClient.post('/silver/calculate-grams', { amount });
        return response.data;
    },

    createBooking: async (amount: number, grams: number) => {
        const response = await apiClient.post('/silver/bookings', {
            amount,
            grams,
        });
        return response.data;
    },

    getBookings: async () => {
        const response = await apiClient.get('/silver/bookings');
        return response.data;
    },
};

export const jewellerAPI = {
    getDashboard: async () => {
        const response = await apiClient.get('/jeweller/dashboard');
        return response.data;
    },

    getAllCustomers: async () => {
        const response = await apiClient.get('/jeweller/customers');
        return response.data?.data || response.data || [];
    },

    getCustomerDetails: async (customerId: string) => {
        const response = await apiClient.get(`/jeweller/customers/${customerId}`);
        return response.data?.data || response.data;
    },

    getAllTransactions: async () => {
        const response = await apiClient.get('/jeweller/transactions');
        return response.data?.data || response.data || [];
    },

    getAllBookings: async () => {
        const response = await apiClient.get('/jeweller/bookings');
        return response.data?.data || response.data || [];
    },

    updateGoldPrice: async (baseMcxPrice: number, marginPercent: number, marginFixed: number) => {
        const response = await apiClient.post('/jeweller/gold-price', {
            base_mcx_price: baseMcxPrice,
            margin_percent: marginPercent,
            margin_fixed: marginFixed,
        });
        return response.data;
    },
};
