export interface User {
    id: string;
    phone_number: string;
    name: string;
    email?: string;
    state?: string;
    city?: string;
    role: string;
    jeweller_id: string;
}

export interface WalletBalance {
    balance: number;
    currency: string;
}

export interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    created_at: string;
}

export interface GoldPrice {
    base_mcx_price: number;
    margin_percent: number;
    margin_fixed: number;
    final_price: number;
    effective_date: string;
}

export interface GoldBooking {
    id: string;
    amount: number;
    grams: number;
    locked_price: number;
    status: string;
    created_at: string;
}
