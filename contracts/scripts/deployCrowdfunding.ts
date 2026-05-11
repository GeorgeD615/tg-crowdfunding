import { NetworkProvider } from '@ton/blueprint';
import { toNano, Address } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/tact_CrowdfundingContract';

export async function run(provider: NetworkProvider) {
    const now = Math.floor(Date.now() / 1000);
    
    // ВАШ АДРЕС В RAW ФОРМАТЕ (полученный из TON Address converter)
    // Из вашего сообщения: ваш адрес 0QCE92B67D_80723eW2tZy7UCrQ4sFM414CS0A1Vh77Z09HC
    // Конвертируем в raw формат (должен начинаться с 0:)
    const MY_RAW_ADDRESS = "0:84f7607aec3ffcd3bdb7796dad672ed40ab438b05338d78092d00d5587bed9d3";
    const owner = Address.parse(MY_RAW_ADDRESS);
    
    const goal = toNano('1');  // 1 TON для теста
    const deadline = BigInt(now + 300);  // 1 час
    
    console.log("=" .repeat(60));
    console.log("🚀 DEPLOYING CROWDFUNDING CONTRACT");
    console.log("=" .repeat(60));
    console.log(`👑 Устанавливаем владельца (owner): ${owner.toString({ bounceable: true })}`);
    console.log(`👑 Owner (non-bounceable): ${owner.toString({ bounceable: false })}`);
    console.log(`📊 Цель: ${Number(goal) / 1e9} TON`);
    console.log(`⏰ Дедлайн: ${new Date(Number(deadline) * 1000).toLocaleString()}`);
    console.log("=" .repeat(60) + "\n");
    
    const contract = provider.open(
        await CrowdfundingContract.fromInit(owner, goal, deadline)
    );
    
    console.log("📤 Отправляем транзакцию деплоя...");
    
    await contract.send(
        provider.sender(),
        { value: toNano('0.1') },
        { $$type: 'Deploy', queryId: 0n }
    );
    
    await provider.waitForDeploy(contract.address);
    
    console.log("\n" + "=" .repeat(60));
    console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("=" .repeat(60));
    console.log(`📝 Адрес контракта: ${contract.address.toString()}`);
    console.log(`👑 Owner контракта (должен быть ваш кошелек): ${owner.toString({ bounceable: true })}`);
    console.log(`🔍 Explorer: https://testnet.tonscan.org/address/${contract.address.toString()}`);
    console.log("\n⚠️ ВАЖНО: Проверьте что owner совпадает с вашим кошельком!");
    console.log(`   Ваш кошелек: ${owner.toString({ bounceable: true })}`);
    console.log("=" .repeat(60));
}