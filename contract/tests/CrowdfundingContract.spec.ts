import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/CrowdfundingContract_CrowdfundingContract';
import '@ton/test-utils';

describe('CrowdfundingContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let crowdfundingContract: SandboxContract<CrowdfundingContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        crowdfundingContract = blockchain.openContract(await CrowdfundingContract.fromInit(0n, 0n));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await crowdfundingContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: crowdfundingContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and crowdfundingContract are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await crowdfundingContract.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = BigInt(Math.floor(Math.random() * 100));

            console.log('increasing by', increaseBy);

            const increaseResult = await crowdfundingContract.send(
                increaser.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Add',
                    amount: increaseBy,
                }
            );

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: crowdfundingContract.address,
                success: true,
            });

            const counterAfter = await crowdfundingContract.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
