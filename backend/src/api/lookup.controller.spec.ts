import { Test, TestingModule } from '@nestjs/testing';
import { lookupController } from './lookup.controller';
import { lookupsService } from '../Infrastructure/lookups/lookups.service';

describe('lookupController', () => {
  let controller: lookupController;
  let service: jest.Mocked<lookupsService>;

  const mockLookupsService = {
    details: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [lookupController],
      providers: [
        {
          provide: lookupsService,
          useValue: mockLookupsService,
        },
      ],
    }).compile();

    controller = module.get<lookupController>(lookupController);
    service = module.get(lookupsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSearchOptions', () => {
    it('should return search options', async () => {
      const mockOptions = { key: 'search-options', value: [] };
      mockLookupsService.details.mockResolvedValue(mockOptions);

      const result = await controller.getSearchOptions();

      expect(service.details).toHaveBeenCalledWith({ key: 'search-options' });
      expect(result).toEqual(mockOptions);
    });
  });

  describe('getRoleTriggers', () => {
    it('should return role triggers', async () => {
      const mockTriggers = { key: 'role-triggers', value: [] };
      mockLookupsService.details.mockResolvedValue(mockTriggers);

      const result = await controller.getRoleTriggers();

      expect(service.details).toHaveBeenCalledWith({ key: 'role-triggers' });
      expect(result).toEqual(mockTriggers);
    });
  });
});
