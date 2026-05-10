export interface TelegramUser {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    language_code?: string;
    is_premium?: boolean;
}

export interface Campaign {
    owner: string;
    goal: bigint;
    deadline: bigint;
    total_raised: bigint;
    status: number;
    created_at: bigint;
}

export interface Donation {
    donor: string;
    amount: bigint;
    timestamp: bigint;
    is_refunded: boolean;
}

export interface CampaignInfo {
    totalRaised: string;
    goal: string;
    deadline: number;
    owner: string;
    status: number;
    remainingTime: number;
    progressPercentage: number;
    canWithdraw: boolean;
    canRefund: boolean;
}