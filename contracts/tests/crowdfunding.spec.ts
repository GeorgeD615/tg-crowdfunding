import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, beginCell, Address } from '@ton/core';
import { CrowdfundingContract } from '../build/CrowdfundingContract/tact_CrowdfundingContract';

describe('CrowdfundingContract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let donor: SandboxContract<TreasuryContract>;
    let contract: SandboxContract<CrowdfundingContract>;
    
    const goal = toNano('100');
    const now = Math.floor(Date.now() / 1000);
    const deadline = BigInt(now + 3600);
    
    const OP_DONATE = 0x444f4e45;
    const OP_WITHDRAW = 0x57495448;
    const OP_REFUND = 0x52454655;
    
    const STATUS_ACTIVE = 0n;
    const STATUS_SUCCESS = 1n;
    const STATUS_FAILED = 2n;
    const STATUS_WITHDRAWN = 3n;
    
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        donor = await blockchain.treasury('donor');
        
        // Add more funds to deployer
        await deployer.send({
            to: deployer.address,
            value: toNano('1000'),
        });
        
        contract = blockchain.openContract(
            await CrowdfundingContract.fromInit(deployer.address, goal, deadline)
        );
        
        const deployResult = await contract.send(
            deployer.getSender(),
            { value: toNano('0.5') }, // Increase deployment gas
            { $$type: 'Deploy', queryId: 0n }
        );
        
        expect(deployResult.transactions).toBeDefined();
        console.log('Contract deployed at:', contract.address.toString());
    });
    
    it('should accept donations', async () => {
        const donationAmount = toNano('10');
        
        const donateMessage = beginCell()
            .storeUint(OP_DONATE, 32)
            .storeUint(donationAmount, 64)
            .endCell();
        
        const result = await contract.send(
            donor.getSender(),
            { value: donationAmount + toNano('0.1') }, // Add gas
            donateMessage.beginParse()
        );
        
        console.log('Donation result transactions:', result.transactions.length);
        
        const totalRaised = await contract.getGetTotalRaised();
        console.log('Total raised:', totalRaised.toString());
        expect(totalRaised).toEqual(donationAmount);
        
        const donation = await contract.getGetDonation(donor.address);
        expect(donation).toBeDefined();
        if (donation) {
            expect(donation.amount).toEqual(donationAmount);
            expect(donation.isRefunded).toEqual(false);
        }
    });
    
    it('should allow owner to withdraw after goal reached', async () => {
        const donationAmount = goal;
        
        // Make the full donation
        const donateMessage = beginCell()
            .storeUint(OP_DONATE, 32)
            .storeUint(donationAmount, 64)
            .endCell();
        
        const donateResult = await contract.send(
            donor.getSender(),
            { value: donationAmount + toNano('0.1') },
            donateMessage.beginParse()
        );
        
        console.log('Donate result:', donateResult.transactions.length);
        
        // Check goal was reached
        const totalRaised = await contract.getGetTotalRaised();
        console.log('Total raised:', totalRaised.toString());
        expect(totalRaised).toEqual(goal);
        
        // Check status is SUCCESS
        let status = await contract.getGetStatus();
        console.log('Status after donation:', status.toString());
        expect(status).toEqual(STATUS_SUCCESS);
        
        // Check can withdraw
        const canWithdraw = await contract.getCanWithdraw();
        console.log('Can withdraw:', canWithdraw);
        expect(canWithdraw).toEqual(true);
        
        // Withdraw
        const withdrawMessage = beginCell()
            .storeUint(OP_WITHDRAW, 32)
            .endCell();
        
        const withdrawResult = await contract.send(
            deployer.getSender(),
            { value: toNano('0.1') }, // More gas for withdrawal
            withdrawMessage.beginParse()
        );
        
        console.log('Withdraw result:', withdrawResult.transactions.length);
        
        // Check status changed to WITHDRAWN
        const finalStatus = await contract.getGetStatus();
        console.log('Final status:', finalStatus.toString());
        expect(finalStatus).toEqual(STATUS_WITHDRAWN);
    });
    
    it('should allow refund if goal not reached', async () => {
        const donationAmount = toNano('10');
        
        // Make donation (not reaching goal)
        const donateMessage = beginCell()
            .storeUint(OP_DONATE, 32)
            .storeUint(donationAmount, 64)
            .endCell();
        
        await contract.send(
            donor.getSender(),
            { value: donationAmount + toNano('0.1') },
            donateMessage.beginParse()
        );
        
        // Verify donation was recorded
        let totalRaised = await contract.getGetTotalRaised();
        expect(totalRaised).toEqual(donationAmount);
        
        // Fast forward past deadline
        blockchain.now = Number(deadline) + 4000; // Well past deadline
        
        // Check that campaign failed
        const statusBeforeRefund = await contract.getGetStatus();
        console.log('Status before refund:', statusBeforeRefund.toString());
        expect(statusBeforeRefund).toEqual(STATUS_FAILED);
        
        // Check can refund
        const canRefund = await contract.getCanRefund(donor.address);
        console.log('Can refund:', canRefund);
        expect(canRefund).toEqual(true);
        
        // Request refund
        const refundMessage = beginCell()
            .storeUint(OP_REFUND, 32)
            .endCell();
        
        const refundResult = await contract.send(
            donor.getSender(),
            { value: toNano('0.1') }, // More gas for refund
            refundMessage.beginParse()
        );
        
        console.log('Refund result:', refundResult.transactions.length);
        
        // Check donation was refunded
        const donation = await contract.getGetDonation(donor.address);
        expect(donation).toBeDefined();
        if (donation) {
            console.log('Donation refunded:', donation.isRefunded);
            expect(donation.isRefunded).toEqual(true);
        }
    });
    
    it('should reject donation below minimum', async () => {
        const smallDonation = toNano('0.005');
        
        const donateMessage = beginCell()
            .storeUint(OP_DONATE, 32)
            .storeUint(smallDonation, 64)
            .endCell();
        
        await contract.send(
            donor.getSender(),
            { value: smallDonation + toNano('0.1') },
            donateMessage.beginParse()
        );
        
        const totalRaised = await contract.getGetTotalRaised();
        expect(totalRaised).toEqual(0n);
    });
    
    it('should track correct campaign info', async () => {
        const campaign = await contract.getGetCampaign();
        
        expect(campaign.owner.equals(deployer.address)).toBe(true);
        expect(campaign.goal).toEqual(goal);
        expect(campaign.deadline).toEqual(deadline);
        expect(campaign.totalRaised).toEqual(0n);
        expect(campaign.status).toEqual(STATUS_ACTIVE);
    });
});