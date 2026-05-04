import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';
import { getTotal, getGoal, getDeadline } from "./ton/contract";

function App() {
  window.Telegram?.WebApp?.ready();
  
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const theme = window.Telegram?.WebApp?.themeParams;
  
  const [total, setTotal] = useState(0n);
  const [goal, setGoal] = useState(1n);
  const [deadline, setDeadline] = useState(0n);
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<string>("0.2");

  console.log("TOTAL", total);
  console.log("GOAL", goal);
  console.log("DEADLINE", deadline);

  const bgColor = theme?.bg_color || '#0a0a0a';
  const textColor = theme?.text_color || '#ffffff';
  const buttonColor = theme?.button_color || '#3b82f6';
  const linkColor = theme?.link_color || '#06b6d4';
  const hintColor = theme?.hint_color || '#6b7280';

  const [tonConnectUI] = useTonConnectUI();
  const [wallet, setWallet] = useState<any>(null);

  const sendTransaction = async () => {
    const amountNano = BigInt(Math.floor(Number(donation) * 1e9));

    await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: "kQAC33wHICte9NmLNpNhDIGyvdB138EEZ1u852TtmZk2_iuW",
          amount: amountNano.toString(),
        },
      ],
    });
  };

  useEffect(() => {
    tonConnectUI.onStatusChange((walletInfo) => {
      setWallet(walletInfo);
      console.log('Wallet:', walletInfo);
    });
  }, []);

    useEffect(() => {
    async function load() {
      try {
        const t = await getTotal();
        const g = await getGoal();
        const d = await getDeadline();

        setTotal(t);
        setGoal(g);
        setDeadline(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const progress = goal > 0n ? Number(total) / Number(goal) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-pulse text-lg">
          Loading blockchain data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh' }} 
         className="p-4 flex items-center justify-center">
      
      <div className="relative max-w-md w-full">
        {/* Анимированная подсветка */}
        <div className="absolute inset-0 rounded-2xl blur-xl animate-pulse" 
             style={{ backgroundColor: `${buttonColor}20` }}></div>
        
        {/* Основная карточка */}
        <div className="relative backdrop-blur-sm rounded-2xl p-6 shadow-2xl border"
             style={{ 
               backgroundColor: `${bgColor}cc`, 
               borderColor: `${linkColor}50` 
             }}>
          
          {/* Статус */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full animate-pulse" 
                   style={{ backgroundColor: linkColor, boxShadow: `0 0 10px ${linkColor}50` }}></div>
              <span className="text-sm font-mono tracking-wider" style={{ color: linkColor }}>ONLINE</span>
            </div>
            {user?.is_premium && (
              <div className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                   style={{ backgroundColor: buttonColor, color: theme?.button_text_color || '#fff' }}>
                ⭐ PREMIUM
              </div>
            )}
          </div>

          {/* Аватар */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                   style={{ 
                     background: `linear-gradient(135deg, ${linkColor}, ${buttonColor})`,
                     boxShadow: `0 10px 30px ${linkColor}30`
                   }}>
                <span className="text-2xl font-bold text-white">
                  {user?.first_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 animate-pulse"
                   style={{ backgroundColor: linkColor, borderColor: bgColor }}></div>
            </div>
          </div>

          {/* Информация */}
          <div className="space-y-3">
            {[
              { label: 'NAME', value: `${user?.first_name || 'Unknown'} ${user?.last_name || ''}` },
              { label: 'USERNAME', value: `@${user?.username || 'anonymous'}` },
              { label: 'USER ID', value: `#${user?.id || '000000'}` },
              user?.language_code ? { label: 'LANGUAGE', value: user.language_code.toUpperCase() } : null
            ].filter((item): item is { label: string; value: string } => item !== null).map((item, i) => (
              <div key={i} className="rounded-lg p-3 border"
                   style={{ backgroundColor: `${bgColor}80`, borderColor: `${hintColor}30` }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono" style={{ color: hintColor }}>{item.label}</span>
                  <span className="font-semibold" style={{ color: i % 2 ? linkColor : buttonColor }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Статус бар */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs"
               style={{ borderColor: `${hintColor}30` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: buttonColor }}></div>
              <span className="font-mono" style={{ color: hintColor }}>TELEGRAM WEB APP</span>
            </div>
            <span className="font-mono" style={{ color: hintColor }}>v1.0.0</span>
          </div>

          <div className="mt-4 text-center items-center">
            <TonConnectButton />
          </div>

          <div className="mt-4">
            <label className="text-xs opacity-70">Donation amount (TON)</label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={donation}
              onChange={(e) => setDonation(e.target.value)}
              className="w-full mt-2 p-2 rounded-lg bg-white/10 text-white outline-none"
            />
          </div>

          <div>
            <div className="mt-4 text-center">
              <button
                onClick={sendTransaction}
                disabled={!wallet}
                className={`mt-6 w-full py-3 rounded-xl font-medium transition
                  ${wallet
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                  }`}
              >
                💸 Donate {donation} TON
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl border"
              style={{ borderColor: `${hintColor}30` }}>

            <div className="flex justify-between text-sm mb-2">
              <span>Raised</span>
              <span>{Number(total) / 1e9} TON</span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span>Goal</span>
              <span>{Number(goal) / 1e9} TON</span>
            </div>

            {/* progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: buttonColor
                }}
              />
            </div>

            {/* deadline */}
            <div className="mt-3 text-xs opacity-70">
              Deadline: {new Date(Number(deadline) * 1000).toLocaleString()}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default App