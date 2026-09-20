import { adminService } from '../services/adminService';
import type { UserStatus } from '../types/domain';
import { useAsync } from './useAsync';

export function useUsers(status: UserStatus) { return useAsync(() => adminService.listUsers(status), [status]); }
export function usePendingUsers() { return useUsers('pending'); }
export function usePendingSubmissions() { return useAsync(() => adminService.pendingSubmissions(), []); }
