import { useState } from 'react';

type Props = {
    disabled: boolean;
    onSubmit: (amount: string) => Promise<void>;
    goal: string;
    current: string;
};

// function formatTON(amount: string): string {
//     return (Number(amount) / 1e9).toFixed(2);
// }

export function DonationForm({ disabled, onSubmit, goal, current }: Props) {
    const [amount, setAmount] = useState('1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const remaining = Math.max(0, Number(goal) - Number(current));
    const remainingTON = (remaining / 1e9).toFixed(2);
    
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (disabled || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit(amount);
            setAmount('1');
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <section className="card donation-form-card">
            <h2>💎 Support This Project</h2>
            <form onSubmit={handleSubmit} className="donation-form">
                <div className="amount-input">
                    <label>Amount (TON)</label>
                    <div className="input-group">
                        <input
                            type="number"
                            min="0.01"
                            step="0.1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            disabled={disabled}
                        />
                        <span className="ton-symbol">⤣ TON</span>
                    </div>
                </div>
                <p className="remaining-hint">
                    🎯 Still needed: <strong>{remainingTON} TON</strong> to reach goal
                </p>
                <button type="submit" disabled={disabled || isSubmitting} className="donate-btn">
                    {isSubmitting ? 'Processing...' : `Donate ${amount} TON`}
                </button>
            </form>
        </section>
    );
}