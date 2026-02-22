import { getRelativeTime, formatTime, formatDateTime, formatDate } from './date.utils';

describe('date.utils', () => {
  describe('getRelativeTime', () => {
    it('should return "Ahora mismo" for just now', () => {
      expect(getRelativeTime(new Date())).toBe('Ahora mismo');
    });

    it('should return minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000);
      expect(getRelativeTime(fiveMinAgo)).toBe('Hace 5 minutos');
    });

    it('should use singular for 1 minute', () => {
      const oneMinAgo = new Date(Date.now() - 60000);
      expect(getRelativeTime(oneMinAgo)).toBe('Hace 1 minuto');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
      expect(getRelativeTime(twoHoursAgo)).toBe('Hace 2 horas');
    });

    it('should use singular for 1 hour', () => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      expect(getRelativeTime(oneHourAgo)).toBe('Hace 1 hora');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      expect(getRelativeTime(threeDaysAgo)).toBe('Hace 3 días');
    });

    it('should use singular for 1 day', () => {
      const oneDayAgo = new Date(Date.now() - 86400000);
      expect(getRelativeTime(oneDayAgo)).toBe('Hace 1 día');
    });

    it('should accept string dates', () => {
      const result = getRelativeTime(new Date().toISOString());
      expect(result).toBe('Ahora mismo');
    });
  });

  describe('formatTime', () => {
    it('should return HH:MM format', () => {
      const result = formatTime(new Date(2024, 0, 15, 14, 30));
      expect(result).toMatch(/14:30/);
    });
  });

  describe('formatDateTime', () => {
    it('should include date and time', () => {
      const result = formatDateTime(new Date(2024, 0, 15, 14, 30));
      expect(result).toContain('15');
      expect(result).toMatch(/14:30/);
    });
  });

  describe('formatDate', () => {
    it('should include day, month and year', () => {
      const result = formatDate(new Date(2024, 0, 15));
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });
});
