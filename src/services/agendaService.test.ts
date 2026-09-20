import { beforeEach, describe, expect, it, vi } from 'vitest';
import { agendaService } from './agendaService';

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock('../lib/supabase', () => ({
  supabase: { rpc: mocks.rpc },
}));

describe('agendaService.completeCommitment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('conclui a ocorrência pelo RPC protegido', async () => {
    mocks.rpc.mockResolvedValue({ error: null });

    await agendaService.completeCommitment('occurrence-123');

    expect(mocks.rpc).toHaveBeenCalledWith('complete_own_commitment', {
      target_occurrence_id: 'occurrence-123',
    });
  });
});
