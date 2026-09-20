import { rewardService } from '../services/rewardService';
import { useAsync } from './useAsync';

export function useReward() { return useAsync(() => rewardService.summary(), []); }
export function useDiscountHistory() { return useAsync(() => rewardService.history(), []); }
