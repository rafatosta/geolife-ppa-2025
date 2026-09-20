import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService } from './adminService';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../lib/supabase', () => ({
  supabase: { rpc: mocks.rpc },
}));

vi.mock('./storageService', () => ({ storageService: {} }));

describe('adminService operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ data: null, error: null });
  });

  it('salva regras e dias da semana em uma operação atômica', async () => {
    await adminService.saveRule({
      user_id: 'user-1', type: 'commitment', title: 'Aula', description: '',
      start_date: '2026-08-10', start_time: '08:00', end_time: '09:00',
      repeat_every_weeks: 1, end_date: null, max_occurrences: null,
      penalty_value: 10, deadline_time: null, requires_evidence: false,
      requires_admin_approval: false, weekdays: ['SEG', 'QUA'],
    }, 'rule-1');

    expect(mocks.rpc).toHaveBeenCalledWith('admin_save_rule', expect.objectContaining({
      target_rule_id: 'rule-1', selected_weekdays: ['SEG', 'QUA'],
    }));
  });

  it('desativa uma regra por RPC protegido', async () => {
    await adminService.setRuleActive('rule-1', false);
    expect(mocks.rpc).toHaveBeenCalledWith('admin_set_rule_active', {
      target_rule_id: 'rule-1', new_active: false,
    });
  });

  it('registra a transição administrativa de uma ocorrência', async () => {
    await adminService.setOccurrenceStatus('occurrence-1', 'missed', 'Falta');
    expect(mocks.rpc).toHaveBeenCalledWith('admin_set_occurrence_status', {
      target_occurrence_id: 'occurrence-1', new_status: 'missed', reason: 'Falta',
    });
  });
});
