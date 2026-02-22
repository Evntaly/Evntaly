import { Test, TestingModule } from '@nestjs/testing';
import { lookupsService } from './lookups.service';
import { lookupsRepository } from './lookups.repository';

describe('lookupsService', () => {
  let service: lookupsService;
  let repository: jest.Mocked<lookupsRepository>;

  const mockRepository = {
    findOneByCondition: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        lookupsService,
        {
          provide: lookupsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<lookupsService>(lookupsService);
    repository = module.get(lookupsRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('details', () => {
    it('should return lookup details for given key', async () => {
      const mockLookup = { key: 'search-options', value: ['option1', 'option2'] };
      mockRepository.findOneByCondition.mockResolvedValue(mockLookup);

      const result = await service.details({ key: 'search-options' });

      expect(repository.findOneByCondition).toHaveBeenCalledWith({
        key: 'search-options',
      });
      expect(result).toEqual(mockLookup);
    });

    it('should return null when lookup not found', async () => {
      mockRepository.findOneByCondition.mockResolvedValue(null);

      const result = await service.details({ key: 'non-existent' });

      expect(result).toBeNull();
    });
  });
});
