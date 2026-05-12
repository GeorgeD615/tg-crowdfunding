import { NetworkProvider } from '@ton/blueprint';
import { toNano, Address } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/tact_CrowdfundingContract';

export async function run(provider: NetworkProvider) {
    const now = Math.floor(Date.now() / 1000);
    
    const MY_RAW_ADDRESS = "0:84f7607aec3ffcd3bdb7796dad672ed40ab438b05338d78092d00d5587bed9d3";
    const owner = Address.parse(MY_RAW_ADDRESS);
    
    const goal = toNano('100');  // 100 TON 
    const deadline = BigInt(now + 60 * 60 * 24 * 7);  // 7 дней
    
    const contract = provider.open(
        await CrowdfundingContract.fromInit(owner, goal, deadline)
    );
    
    await contract.send(
        provider.sender(),
        { value: toNano('0.1') },
        { $$type: 'Deploy', queryId: 0n }
    );
    
    await provider.waitForDeploy(contract.address);
    
    console.log(`Address: ${contract.address.toString()}`);
    console.log(`Explorer: https://testnet.tonscan.org/address/${contract.address.toString()}`);
}