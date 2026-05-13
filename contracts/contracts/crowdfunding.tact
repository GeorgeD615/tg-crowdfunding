import "@stdlib/deploy";

const OP_DONATE: Int = 0x444f4e45;
const OP_WITHDRAW: Int = 0x57495448;
const OP_REFUND: Int = 0x52454655;

const STATUS_ACTIVE: Int = 0;
const STATUS_SUCCESS: Int = 1;
const STATUS_FAILED: Int = 2;
const STATUS_WITHDRAWN: Int = 3;

const MIN_DONATION: Int = 10000000; // 0.01 TON

struct Donation {
    donor: Address;
    amount: Int as uint64;
    timestamp: Int as uint64;
    isRefunded: Bool;
}

struct Campaign {
    owner: Address;
    goal: Int as uint64;
    deadline: Int as uint64;
    totalRaised: Int as uint64;
    status: Int as uint8;
    createdAt: Int as uint64;
}

contract CrowdfundingContract with Deployable {
    campaign: Campaign;
    donations: map<Address, Donation>;
    eventCounter: Int as uint32;
    events: map<Int as uint32, Cell>;

    init(owner: Address, goal: Int, deadline: Int) {
        require(goal > 0, "GOAL_MUST_BE_POSITIVE");
        require(deadline > now(), "DEADLINE_MUST_BE_FUTURE");
        
        self.campaign = Campaign{
            owner: owner,
            goal: goal,
            deadline: deadline,
            totalRaised: 0,
            status: STATUS_ACTIVE,
            createdAt: now(),
        };
        
        self.eventCounter = 0;
    }

    receive(msg: Slice) {
        let op = msg.loadUint(32);
        
        if (op == OP_DONATE) {
            self.handleDonate(msg);
            return;
        }
        
        if (op == OP_WITHDRAW) {
            self.handleWithdraw();
            return;
        }
        
        if (op == OP_REFUND) {
            self.handleRefund();
            return;
        }
        
        throw(100);
    }

    fun handleDonate(body: Slice) {
        require(self.campaign.status == STATUS_ACTIVE, "CAMPAIGN_NOT_ACTIVE");
        require(now() < self.campaign.deadline, "DEADLINE_PASSED");
        require(self.campaign.totalRaised < self.campaign.goal, "GOAL_ALREADY_REACHED");
        
        let donationAmount = body.loadUint(64);
        let value = context().value;
        
        require(donationAmount == value, "AMOUNT_MISMATCH");
        require(donationAmount >= MIN_DONATION, "DONATION_TOO_SMALL");
        
        let donor = sender();
        let timestamp = now();
        
        let existingDonation = self.donations.get(donor);
        let newAmount = donationAmount;
        
        if (existingDonation != null) {
            newAmount = existingDonation!!.amount + donationAmount;
        }
        
        self.donations.set(donor, Donation{
            donor: donor,
            amount: newAmount,
            timestamp: timestamp,
            isRefunded: false,
        });
        
        self.campaign.totalRaised = self.campaign.totalRaised + donationAmount;
        
        if (self.campaign.totalRaised >= self.campaign.goal) {
            self.campaign.status = STATUS_SUCCESS;
        }
        
        self.emitEvent(OP_DONATE, donor, donationAmount, self.campaign.totalRaised);
    }

    fun handleWithdraw() {
        require(sender() == self.campaign.owner, "ONLY_OWNER");
        require(self.campaign.status == STATUS_SUCCESS, "CAMPAIGN_NOT_SUCCESSFUL");
        require(self.campaign.status != STATUS_WITHDRAWN, "ALREADY_WITHDRAWN");
        
        let amount = self.campaign.totalRaised;
        
        self.campaign.status = STATUS_WITHDRAWN;
        
        self.emitEvent(OP_WITHDRAW, self.campaign.owner, amount, 0);
        
        send(SendParameters{
            to: self.campaign.owner,
            value: amount,
            mode: SendRemainingValue
        });
    }

    fun handleRefund() {
        require(now() > self.campaign.deadline, "TOO_EARLY_FOR_REFUND");
        require(self.campaign.totalRaised < self.campaign.goal, "GOAL_REACHED_NO_REFUND");
        require(self.campaign.status == STATUS_ACTIVE, "CAMPAIGN_ALREADY_FINALIZED");
        
        let donor = sender();
        let donationOpt = self.donations.get(donor);
        require(donationOpt != null, "NO_DONATION_FOUND");
        
        let donation = donationOpt!!;
        require(!donation.isRefunded, "ALREADY_REFUNDED");
        require(donation.amount > 0, "INVALID_DONATION_AMOUNT");
        
        donation.isRefunded = true;
        self.donations.set(donor, donation);
        
        self.emitEvent(OP_REFUND, donor, donation.amount, 0);
        
        send(SendParameters{
            to: donor,
            value: donation.amount,
            mode: SendRemainingValue
        });
    }

    fun emitEvent(op: Int, addr: Address, value1: Int, value2: Int) {
        let eventCell = beginCell()
            .storeUint(op, 32)
            .storeAddress(addr)
            .storeUint(value1, 64)
            .storeUint(value2, 64)
            .storeUint(now(), 64)
            .endCell();
        
        self.events.set(self.eventCounter, eventCell);
        self.eventCounter = self.eventCounter + 1;
    }

    get fun get_campaign(): Campaign {
        return self.campaign;
    }
    
    get fun get_status(): Int {
        if (self.campaign.status == STATUS_WITHDRAWN) {
            return STATUS_WITHDRAWN;
        }
        if (self.campaign.status == STATUS_SUCCESS) {
            return STATUS_SUCCESS;
        }
        if (now() > self.campaign.deadline && self.campaign.totalRaised < self.campaign.goal) {
            return STATUS_FAILED;
        }
        return self.campaign.status;
    }
    
    get fun get_total_raised(): Int {
        return self.campaign.totalRaised;
    }
    
    get fun get_goal(): Int {
        return self.campaign.goal;
    }
    
    get fun get_deadline(): Int {
        return self.campaign.deadline;
    }
    
    get fun get_owner(): Address {
        return self.campaign.owner;
    }
    
    get fun get_donation(donor: Address): Donation? {
        return self.donations.get(donor);
    }
    
    get fun can_refund(donor: Address): Bool {
        let donationOpt = self.donations.get(donor);
        if (donationOpt == null) {
            return false;
        }
        
        let donation = donationOpt!!;
        let campaignStatus = self.get_status();
        
        return !donation.isRefunded 
            && donation.amount > 0
            && campaignStatus == STATUS_FAILED;
    }
    
    get fun can_withdraw(): Bool {
        return self.campaign.status == STATUS_SUCCESS;
    }
    
    get fun get_remaining_time(): Int {
        let deadline = self.campaign.deadline;
        if (now() >= deadline) {
            return 0;
        }
        return deadline - now();
    }
    
    get fun get_progress_percentage(): Int {
        if (self.campaign.goal == 0) {
            return 0;
        }
        return (self.campaign.totalRaised * 100) / self.campaign.goal;
    }
    
    get fun get_event_count(): Int {
        return self.eventCounter;
    }
}
