import { useEffect, useState } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { contractService } from './lib/contract';
import { buildDonatePayload, buildWithdrawPayload, buildRefundPayload } from './lib/ton';
import { initTelegramWebApp, getTelegramUser } from './lib/telegram';
import { ProfileCard } from './components/ProfileCard';
import { CampaignCard } from './components/CampaignCard';
import { DonationForm } from './components/DonationForm';
import type { TelegramUser, CampaignInfo } from './types';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
    const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
    const walletAddress = useTonAddress();
    const [tonConnectUI] = useTonConnectUI();
    
    const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
    const [myDonation, setMyDonation] = useState('0');
    const [canRefund, setCanRefund] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    console.log(canRefund)
    // Initialize Telegram WebApp
    useEffect(() => {
        initTelegramWebApp();
        const user = getTelegramUser();
        setTelegramUser(user);
        console.log('Telegram user:', user);
    }, []);
    
    // Load campaign data periodically
    useEffect(() => {
        loadCampaignData();
        const interval = setInterval(loadCampaignData, 10000);
        return () => clearInterval(interval);
    }, []);
    
    // Load user's donation when wallet connects
    useEffect(() => {
        if (walletAddress) {
            loadUserDonation();
        }
    }, [walletAddress]);
    
    async function loadCampaignData() {
        try {
            const data = await contractService.getCampaignInfo();
            setCampaign(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load campaign data');
        } finally {
            setLoading(false);
        }
    }
    
    async function loadUserDonation() {
        if (!walletAddress) return;
        try {
            const donation = await contractService.getDonation(walletAddress);
            setMyDonation(donation);
            const refundable = await contractService.canRefund(walletAddress);
            setCanRefund(refundable);
        } catch (err) {
            console.error(err);
        }
    }
    
    async function handleDonate(amountTON: string) {
        if (!walletAddress) {
            setError('Please connect wallet first');
            return;
        }
        
        const amountNano = BigInt(Math.floor(Number(amountTON) * 1e9));
        const payload = buildDonatePayload(amountNano);
        
        try {
            setTxStatus('Sending donation transaction...');
            await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [{
                    address: CONTRACT_ADDRESS!,
                    amount: amountNano.toString(),
                    payload,
                }],
            });
            setTxStatus('Donation sent! Updating data...');
            await loadCampaignData();
            await loadUserDonation();
            setTimeout(() => setTxStatus(null), 5000);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Transaction failed');
            setTimeout(() => setError(null), 5000);
        }
    }
    
    async function handleWithdraw() {
        if (!walletAddress) return;
        const payload = buildWithdrawPayload();
        
        try {
            setTxStatus('Sending withdraw request...');
            await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [{
                    address: CONTRACT_ADDRESS!,
                    amount: '50000000', // 0.05 TON for gas
                    payload,
                }],
            });
            setTxStatus('Withdraw successful!');
            await loadCampaignData();
            setTimeout(() => setTxStatus(null), 5000);
        } catch (err) {
            console.error(err);
            setError('Withdraw failed');
            setTimeout(() => setError(null), 5000);
        }
    }
    
    async function handleRefund() {
        if (!walletAddress) return;
        const payload = buildRefundPayload();
        
        try {
            setTxStatus('Sending refund request...');
            await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [{
                    address: CONTRACT_ADDRESS!,
                    amount: '50000000', // 0.05 TON for gas
                    payload,
                }],
            });
            setTxStatus('Refund successful!');
            await loadCampaignData();
            await loadUserDonation();
            setTimeout(() => setTxStatus(null), 5000);
        } catch (err) {
            console.error(err);
            setError('Refund failed');
            setTimeout(() => setError(null), 5000);
        }
    }
    
    if (loading) {
        return (
            <main className="app-shell">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading campaign data...</p>
                </div>
            </main>
        );
    }
    
    const canDonate = campaign && 
        campaign.status === 0 && 
        campaign.remainingTime > 0 &&
        Number(campaign.totalRaised) < Number(campaign.goal);
    
    return (
        <main className="app-shell">
            <header className="top-header">
                <div>
                    <h1>🎯 Crowdfunding on TON</h1>
                    <p className="muted">Support this project with TON blockchain</p>
                </div>
                <TonConnectButton />
            </header>
            
            <ProfileCard user={telegramUser} walletAddress={walletAddress} />
            
            {txStatus && (
                <section className="card tx-notice">
                    {txStatus}
                </section>
            )}
            
            {error && (
                <section className="card error">
                    ⚠️ {error}
                </section>
            )}
            
            <CampaignCard
                campaign={campaign}
                myDonation={myDonation}
                walletAddress={walletAddress}
                onWithdraw={handleWithdraw}
                onRefund={handleRefund}
            />
            
            {canDonate && (
                <DonationForm
                    disabled={!walletAddress}
                    onSubmit={handleDonate}
                    goal={campaign.goal}
                    current={campaign.totalRaised}
                />
            )}
            
            <section className="card muted-card">
                <p><strong>📜 Contract:</strong> {CONTRACT_ADDRESS}</p>
                <p><strong>🌐 Network:</strong> {import.meta.env.VITE_TON_NETWORK || 'testnet'}</p>
                <p><strong>⚡ Status:</strong> {campaign?.status === 0 ? 'Active' : campaign?.status === 1 ? 'Success' : 'Completed'}</p>
            </section>
        </main>
    );
}

export default App;