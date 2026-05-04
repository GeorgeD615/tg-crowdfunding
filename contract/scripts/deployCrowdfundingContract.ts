import { toNano } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/CrowdfundingContract_CrowdfundingContract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    const now = Math.floor(Date.now() / 1000);

    const owner = provider.sender().address!;

    const crowdfundingContract = provider.open(
        await CrowdfundingContract.fromInit(
            owner,
            toNano('1'),          // goal = 1 TON
            BigInt(now + 3600)    // deadline = +1 час
        )
    );

    await crowdfundingContract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null
    );

    await provider.waitForDeploy(crowdfundingContract.address);

    console.log('Contract deployed at:', crowdfundingContract.address.toString());
}