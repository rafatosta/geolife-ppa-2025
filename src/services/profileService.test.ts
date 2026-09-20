import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profileService } from './profileService';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: mocks.from },
}));

describe('profileService.getCurrent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ single: mocks.single });
  });

  it('busca somente o perfil do usuário autenticado', async () => {
    const profile = { id: 'user-123', email: 'user@example.com' };
    mocks.single.mockResolvedValue({ data: profile, error: null });

    await expect(profileService.getCurrent('user-123')).resolves.toBe(profile);

    expect(mocks.from).toHaveBeenCalledWith('profiles');
    expect(mocks.select).toHaveBeenCalledWith('*');
    expect(mocks.eq).toHaveBeenCalledWith('id', 'user-123');
    expect(mocks.single).toHaveBeenCalledOnce();
  });
});
