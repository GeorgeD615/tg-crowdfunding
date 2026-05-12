import type { TelegramUser } from '../types';

type Props = {
    user: TelegramUser | null;
    walletAddress: string;
};

function shortAddress(address: string): string {
    if (!address) {
        return 'Not connected';
    }
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function ProfileCard({ user, walletAddress }: Props) {
    const displayName = user?.username || 
        [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 
        'Anonymous User';

    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <section className="card profile-card">
            <div className="profile-row">
                {user?.photo_url ? (
                    <img src={user.photo_url} alt={displayName} className="avatar" />
                ) : (
                    <div className="avatar-fallback" style={{ backgroundColor: '#3b82f6' }}>
                        {initials || '?'}
                    </div>
                )}
                <div>
                    <h2>{displayName}</h2>
                    <p className="muted">
                        {user?.id ? `ID: ${user.id}` : 'Telegram user'}
                        {user?.is_premium && ' ⭐ Premium'}
                    </p>
                </div>
            </div>
            <p className="wallet-line">
                <strong>Wallet:</strong> {shortAddress(walletAddress)}
            </p>
        </section>
    );
}