message Withdraw {}
message Refund {}

contract CrowdfundingContract {

    owner: Address;
    goal: Int as uint64;
    deadline: Int as uint64;
    total: Int as uint64;

    contributions: map<Address, Int as uint64>;

    init(owner: Address, goal: Int, deadline: Int) {
        self.owner = owner;
        self.goal = goal;
        self.deadline = deadline;
        self.total = 0;
    }

    receive() {
        require(now() < self.deadline, "Deadline passed");
        require(self.total < self.goal, "Goal already reached");

        let sender = sender();
        let value = context().value;

        self.total += value;

        let prevOpt = self.contributions.get(sender);

        let prev: Int = 0;
        if (prevOpt != null) {
            prev = prevOpt!!;
        }

        self.contributions.set(sender, prev + value);
    }

    receive(msg: Withdraw) {
        require(now() > self.deadline, "Too early");
        require(self.total >= self.goal, "Goal not reached");
        require(sender() == self.owner, "Not owner");

        send(SendParameters{
            to: self.owner,
            value: self.total
        });
    }

    receive(msg: Refund) {
        require(now() > self.deadline, "Too early");
        require(self.total < self.goal, "Goal reached");

        let sender = sender();
        let amountOpt = self.contributions.get(sender);

        let amount: Int = 0;
        if (amountOpt != null) {
            amount = amountOpt!!;
        }

        require(amount > 0, "Nothing to refund");

        self.contributions.set(sender, 0);
        send(SendParameters{
            to: sender,
            value: amount,
            bounce: false
        });
    }

    get fun getTotal(): Int {
        return self.total;
    }

    get fun getGoal(): Int {
        return self.goal;
    }

    get fun getDeadline(): Int {
        return self.deadline;
    }
}