import type { CampaignInfo } from '../types';

type Props = {
    campaign: CampaignInfo | null;
    myDonation: string;
    walletAddress: string;
    onWithdraw: () => Promise<void>;
    onRefund: () => Promise<void>;
};

function formatTON(amount: string): string {
    return (Number(amount) / 1e9).toFixed(2);
}

function getStatusText(status: number): string {
    switch (status) {
        case 0: return '🟢 Active';
        case 1: return '✅ Success';
        case 2: return '❌ Failed';
        case 3: return '💰 Withdrawn';
        default: return 'Unknown';
    }
}

function formatTime(seconds: number): string {
    if (seconds <= 0) return 'Expired';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
}

export function CampaignCard({ campaign, myDonation, walletAddress, onWithdraw, onRefund }: Props) {
    if (!campaign) return null;

    const isOwner = walletAddress === campaign.owner;
    //const isActive = campaign.status === 0;
    const isSuccess = campaign.status === 1;
    const currentAmount = formatTON(campaign.totalRaised);
    const goalAmount = formatTON(campaign.goal);
    const myDonationAmount = formatTON(myDonation);
    const isDeadlinePassed = campaign.remainingTime <= 0;

    return (
        <section className="card campaign-card">
            <div className="campaign-header">
                <h2>🎯 Campaign Details</h2>
                <span className={`status-badge status-${campaign.status}`}>
                    {getStatusText(campaign.status)}
                </span>
            </div>

            <div className="progress-section">
                <div className="stats-row">
                    <span>Raised: <strong>{currentAmount} TON</strong></span>
                    <span>Goal: <strong>{goalAmount} TON</strong></span>
                </div>
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill" 
                        style={{ width: `${campaign.progressPercentage}%` }}
                    />
                </div>
                <div className="stats-row">
                    <span>Progress: {campaign.progressPercentage}%</span>
                    <span>⏰ {formatTime(campaign.remainingTime)}</span>
                </div>
            </div>

            {Number(myDonation) > 0 && (
                <div className="my-donation">
                    💰 Your donation: <strong>{myDonationAmount} TON</strong>
                </div>
            )}

            <div className="campaign-footer">
                <p className="muted">
                    <strong>Owner:</strong> {campaign.owner.slice(0, 8)}...{campaign.owner.slice(-6)}
                </p>
                <p className="muted">
                    <strong>Deadline:</strong> {new Date(campaign.deadline * 1000).toLocaleString()}
                </p>
            </div>

            {isOwner && campaign.canWithdraw && (
                <button onClick={onWithdraw} className="withdraw-btn">
                    💸 Withdraw Funds ({currentAmount} TON)
                </button>
            )}

            {!isOwner && !isSuccess && isDeadlinePassed && !campaign.canWithdraw && (
                <button onClick={onRefund} className="refund-btn">
                    ↩️ Request Refund
                </button>
            )}
        </section>
    );
}