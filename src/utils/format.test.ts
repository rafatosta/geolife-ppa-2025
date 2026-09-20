import { describe, expect, it } from 'vitest';
import { formatMoney, formatTime } from './format';

describe('format helpers', () => {
  it('formats Brazilian currency centrally', () => { expect(formatMoney(270)).toContain('270,00'); });
  it('formats stored times for display', () => { expect(formatTime('21:00:00')).toBe('21h'); });
});
