import { NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/tact_CrowdfundingContract';

export async function run(provider: NetworkProvider) {
    // ВСТАВЬТЕ НОВЫЙ АДРЕС КОНТРАКТА ПОСЛЕ ДЕПЛОЯ
    const contractAddress = Address.parse("EQB9U3S_CB4uIZ-BlvErMhVpyX_k2hz_gaALr2zqPrawwYDW");
    const contract = provider.open(CrowdfundingContract.fromAddress(contractAddress));
    
    const owner = await contract.getGetOwner();
    
    console.log("=" .repeat(60));
    console.log("ПРОВЕРКА ВЛАДЕЛЬЦА КОНТРАКТА");
    console.log("=" .repeat(60));
    console.log(`Адрес контракта: ${contractAddress.toString()}`);
    console.log(`Owner (bounceable): ${owner.toString({ bounceable: true })}`);
    console.log(`Owner (non-bounceable): ${owner.toString({ bounceable: false })}`);
    console.log("\nВАШ КОШЕЛЕК ДОЛЖЕН СОВПАДАТЬ:");
    console.log(`Ваш кошелек: EQCE92B67D_80723eW2tZy7UCrQ4sFM414CS0A1Vh77Z0zeN`);
    console.log("=" .repeat(60));
}