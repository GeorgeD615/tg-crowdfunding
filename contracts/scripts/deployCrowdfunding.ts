import { NetworkProvider } from '@ton/blueprint';
import { toNano } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/tact_CrowdfundingContract';

export async function run(provider: NetworkProvider) {
    const now = Math.floor(Date.now() / 1000);
    const owner = provider.sender().address!;
    
    const goal = toNano('100');
    const deadline = BigInt(now + 30 * 24 * 3600);
    
    console.log('🚀 Deploying crowdfunding contract...');
    console.log(`📊 Goal: ${Number(goal) / 1e9} TON`);
    console.log(`⏰ Deadline: ${new Date(Number(deadline) * 1000).toLocaleString()}`);
    console.log(`👤 Owner: ${owner.toString()}`);
    
    const contract = provider.open(
        await CrowdfundingContract.fromInit(owner, goal, deadline)
    );
    
    await contract.send(
        provider.sender(),
        { value: toNano('0.1') },
        { $$type: 'Deploy', queryId: 0n }
    );
    
    await provider.waitForDeploy(contract.address);
    
    console.log('✅ Contract deployed successfully!');
    console.log('📝 Contract address:', contract.address.toString());
}