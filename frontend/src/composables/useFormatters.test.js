import { describe, it, expect } from 'vitest';
import { useFormatters } from './useFormatters';

describe('useFormatters', () => {
  const { formatCurrency, formatDate, formatDateShort } = useFormatters();

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(100000)).toBe('₩100,000');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('₩0');
    });

    it('handles null', () => {
      expect(formatCurrency(null)).toBe('₩0');
    });

    it('handles undefined', () => {
      expect(formatCurrency(undefined)).toBe('₩0');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024');
    });

    it('handles empty string', () => {
      expect(formatDate('')).toBe('');
    });

    it('handles null', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatDateShort', () => {
    it('formats date in short format', () => {
      const result = formatDateShort('2024-01-15');
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });
  });
});
