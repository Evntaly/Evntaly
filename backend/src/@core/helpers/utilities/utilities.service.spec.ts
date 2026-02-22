import { Test, TestingModule } from '@nestjs/testing';
import { utilitiesService } from './utilities.service';

describe('utilitiesService', () => {
  let service: utilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [utilitiesService],
    }).compile();

    service = module.get<utilitiesService>(utilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDateRange', () => {
    it('should return date range for "today"', () => {
      const result = service.getDateRange('today', 0);
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it('should return date range for "last 7 days"', () => {
      const result = service.getDateRange('last 7 days', 0);
      expect(result.startDate.getTime()).toBeLessThan(result.endDate.getTime());
    });

    it('should throw for unsupported range', () => {
      expect(() => service.getDateRange('invalid-range', 0)).toThrow(
        'Unsupported range text',
      );
    });
  });

  describe('generateEventID', () => {
    it('should generate ID with prefix', () => {
      const id = service.generateEventID('evt_');
      expect(id).toMatch(/^evt_\d+$/);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds to duration string', () => {
      expect(service.formatDuration(3661)).toBe('1h 1m 1s');
      expect(service.formatDuration(65)).toBe('0h 1m 5s');
    });
  });

  describe('sortList', () => {
    it('should sort list ascending', () => {
      const list = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
      const result = service.sortList(list, 'name', 'asc');
      expect(result[0].name).toBe('a');
      expect(result[2].name).toBe('c');
    });

    it('should sort list descending', () => {
      const list = [{ name: 'a' }, { name: 'c' }, { name: 'b' }];
      const result = service.sortList(list, 'name', 'desc');
      expect(result[0].name).toBe('c');
      expect(result[2].name).toBe('a');
    });
  });
});
