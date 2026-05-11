import type { CampaignInfo } from '../types';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const TON_API_KEY = import.meta.env.VITE_TON_API_KEY || 'effafb57c12498349ee5ff5dfa261991229ac48041b8b2eca6d8720a300bc726';
const TON_API_ENDPOINT = import.meta.env.VITE_TON_API_ENDPOINT || 'https://testnet.toncenter.com/api/v2';

interface GetMethodResult {
    ok: boolean;
    result?: {
        stack: any[];
        gas_used?: number;
        exit_code?: number;
    };
    error?: string;
}

class ContractService {
    private async callGetMethod(method: string, stack: any[] = []): Promise<any> {
        if (!CONTRACT_ADDRESS) {
            throw new Error('Contract address not configured');
        }
        
        // Правильное форматирование stack для TON Center API
        const formattedStack = stack.map(item => {
            if (Array.isArray(item) && item[0] === 'address') {
                // Для address используем специальный формат с тремя элементами
                return ['address', item[1]];
            }
            if (typeof item === 'string' && item.startsWith('0:')) {
                return ['address', item];
            }
            return item;
        });
        
        try {
            const response = await fetch(`${TON_API_ENDPOINT}/runGetMethod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': TON_API_KEY,
                },
                body: JSON.stringify({
                    address: CONTRACT_ADDRESS,
                    method: method,
                    stack: formattedStack,
                }),
            });
            
            const data: GetMethodResult = await response.json();
            
            if (!response.ok || !data.ok || !data.result) {
                throw new Error(`Failed to call ${method}: ${data.error || 'Unknown error'}`);
            }
            
            return data.result;
        } catch (error) {
            console.error(`Error calling ${method}:`, error);
            throw error;
        }
    }

    
    private parseNumberFromStack(stack: any[]): string {
        if (!stack || stack.length === 0) return '0';
        
        // Handle different stack value formats
        const first = stack[0];
        if (Array.isArray(first)) {
            if (first[0] === 'num') {
                return first[1];
            }
            if (first[0] === 'int') {
                return first[1];
            }
        }
        
        // Try to parse as direct value
        if (typeof first === 'object' && first !== null) {
            if ('value' in first) return String(first.value);
            if ('num' in first) return String(first.num);
        }
        
        return String(first) || '0';
    }
    
    private parseBooleanFromStack(stack: any[]): boolean {
        if (!stack || stack.length === 0) return false;
        
        const first = stack[0];
        if (Array.isArray(first)) {
            if (first[0] === 'num') {
                const value = first[1];
                return value === '-1' || value === 'true' || (typeof value === 'string' && value === '-1') || Number(value) !== 0;
            }
            if (first[0] === 'bool') {
                return first[1] === true || first[1] === 'true';
            }
        }
        
        if (typeof first === 'object' && first !== null) {
            if ('value' in first) return Boolean(first.value);
            if ('bool' in first) return first.bool;
        }
        
        return false;
    }
    
    private parseAddressFromStack(stack: any[]): string {
        if (!stack || stack.length === 0) return CONTRACT_ADDRESS || '';
        
        const first = stack[0];
        if (Array.isArray(first)) {
            if (first[0] === 'cell' && first[1]) {
                // This is simplified - in production you'd need to parse the cell
                return CONTRACT_ADDRESS || '';
            }
            if (first[0] === 'address') {
                return first[1];
            }
        }
        
        return CONTRACT_ADDRESS || '';
    }
    
    async getCampaignInfo(): Promise<CampaignInfo> {
        try {
            // Get total raised
            const totalResult = await this.callGetMethod('get_total_raised');
            const totalRaised = this.parseNumberFromStack(totalResult.stack);
            
            // Get goal
            const goalResult = await this.callGetMethod('get_goal');
            const goal = this.parseNumberFromStack(goalResult.stack);
            
            // Get deadline
            const deadlineResult = await this.callGetMethod('get_deadline');
            const deadline = this.parseNumberFromStack(deadlineResult.stack);
            
            // Get status
            const statusResult = await this.callGetMethod('get_status');
            const status = parseInt(this.parseNumberFromStack(statusResult.stack));
            
            // Get owner
            const ownerResult = await this.callGetMethod('get_owner');
            const owner = this.parseAddressFromStack(ownerResult.stack);
            
            // Get remaining time
            const remainingResult = await this.callGetMethod('get_remaining_time');
            const remainingTime = parseInt(this.parseNumberFromStack(remainingResult.stack));
            
            // Get progress percentage
            const progressResult = await this.callGetMethod('get_progress_percentage');
            const progress = parseInt(this.parseNumberFromStack(progressResult.stack));
            
            // Check if can withdraw
            const withdrawResult = await this.callGetMethod('can_withdraw');
            const canWithdraw = this.parseBooleanFromStack(withdrawResult.stack);
            
            return {
                totalRaised: totalRaised,
                goal: goal,
                deadline: Number(deadline),
                owner: owner || CONTRACT_ADDRESS || '',
                status: status,
                remainingTime: remainingTime || 0,
                progressPercentage: progress || 0,
                canWithdraw: canWithdraw,
                canRefund: false,
            };
        } catch (error) {
            console.error('Error fetching campaign info:', error);
            throw error;
        }
    }
    
    async getDonation(address: string): Promise<string> {
        try {
            const result = await this.callGetMethod('get_donation', [
                ['address', address]
            ]);
            return this.parseNumberFromStack(result.stack);
        } catch (error) {
            console.error('Error fetching donation:', error);
            return '0';
        }
    }
    
    async canRefund(address: string): Promise<boolean> {
        try {
            const result = await this.callGetMethod('can_refund', [
                ['address', address]
            ]);
            return this.parseBooleanFromStack(result.stack);
        } catch (error) {
            console.error('Error checking refund eligibility:', error);
            return false;
        }
    }
}

export const contractService = new ContractService();