import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { funnelRepository } from './funnel.repository';
import { createFunnelDto } from './DTOs/create-funnel.dto';
import { eventOccurancesRepository } from '../event_occurances/event_occurances.repository';
import { userssOccurancesRepository } from '../users_occurances/users_occurances.repository';
import { eventsRepository } from '../events/events.repository';
import { utilitiesService } from 'src/@core/helpers';
import * as Sentry from '@sentry/node';

@Injectable()
export class funnelService {
  private readonly logger = new Logger(funnelService.name);

  constructor(
    private readonly funnelRepo: funnelRepository,
    private readonly eventOccRepo: eventOccurancesRepository,
    private readonly userOccRepo: userssOccurancesRepository,
    private readonly eventsRepo: eventsRepository,
    private readonly utils: utilitiesService,
  ) {}

  async createFunnel(dto: createFunnelDto) {
    try {
      this.logger.log(`Creating funnel: ${dto.funnel_name}`);

      const existingFunnel = await this.funnelRepo.findOneByCondition({
        tenantID: dto.tenantID,
        funnel_name: dto.funnel_name,
      });

      if (existingFunnel) {
        throw new HttpException(
          'Funnel with this name already exists.',
          HttpStatus.CONFLICT,
        );
      }

      const steps = dto.steps.sort((a, b) => a.step_order - b.step_order);

      const stepOrders = steps.map((step) => step.step_order);
      const uniqueOrders = [...new Set(stepOrders)];

      if (stepOrders.length !== uniqueOrders.length) {
        throw new HttpException(
          'Duplicate step orders are not allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      const funnelData = {
        ...dto,
        steps,
        status: dto.status || 'active',
        metadata: dto.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newFunnel = await this.funnelRepo.create(funnelData);

      this.logger.log(`Funnel created successfully: ${newFunnel._id}`);

      return newFunnel;
    } catch (error) {
      this.logger.error('Failed to create funnel:', error);
      Sentry.captureException(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create funnel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFunnels(tenantID: string, projectID: string) {
    try {
      const funnels = await this.funnelRepo.findAllByCondition({
        tenantID: tenantID,
        projectID: projectID,
      });

      const funnelsWithConversion = await Promise.all(
        funnels.map(async (funnel) => {
          try {
            const conversionSummary = await this.calculateFunnelConversionRate(
              (funnel as any)._id,
              tenantID,
              projectID,
              'last 7 days',
            );

            return {
              ...(funnel as any).toObject(),
              conversionRate: conversionSummary.conversionRate,
              change: conversionSummary.change,
            };
          } catch (error) {
            this.logger.error(
              'Error calculating conversion for funnel:',
              error,
            );
            return {
              ...(funnel as any).toObject(),
              conversionRate: 0,
              change: { value: 0, sign: '+' },
            };
          }
        }),
      );

      return funnelsWithConversion;
    } catch (error) {
      this.logger.error('Failed to get funnels by account:', error);
      Sentry.captureException(error);
      throw new HttpException(
        'Failed to retrieve funnels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFunnel(funnelId: string, tenantID: string, projectID: string) {
    try {
      const funnel = await this.funnelRepo.findOneByCondition({
        _id: funnelId,
        tenantID: tenantID,
        projectID: projectID,
      });

      if (!funnel) {
        throw new HttpException('Funnel not found', HttpStatus.NOT_FOUND);
      }

      return funnel;
    } catch (error) {
      this.logger.error('Failed to get funnel by ID:', error);
      Sentry.captureException(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to retrieve funnel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFunnelWithAnalytics(
    funnelId: string,
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    try {
      const date = this.utils.getDateRange(dateRange, 2);

      const funnel = await this.getFunnel(funnelId, tenantID, projectID);

      const funnelStepsWithAnalytics = await this.calculateFunnelStepsAnalytics(
        funnel.steps,
        tenantID,
        projectID,
        date,
      );

      return {
        _id: (funnel as any)._id,
        name: funnel.funnel_name,
        description:
          funnel.metadata?.description || 'This is a description of the funnel',
        funnelSteps: funnelStepsWithAnalytics,
        dateRange: {
          startDate: date.startDate,
          endDate: date.endDate,
        },
        metadata: funnel.metadata,
        status: funnel.status,
        createdAt: funnel.createdAt,
        updatedAt: funnel.updatedAt,
      };
    } catch (error) {
      this.logger.error('Failed to get funnel analytics:', error);
      Sentry.captureException(error);

      throw new HttpException(
        'Failed to retrieve funnel analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateFunnelConversionRate(
    funnelId: string,
    tenantID: string,
    projectID: string,
    dateRange: string = 'last 7 days',
  ) {
    try {
      const date = this.utils.getDateRange(dateRange, 2);
      const previousPeriod = this.utils.getPreviousPeriod(
        date.startDate,
        date.endDate,
      );

      const funnel = await this.getFunnel(funnelId, tenantID, projectID);

      if (!funnel) {
        return {
          conversionRate: 0,
          change: { value: 0, sign: '+' },
        };
      }

      // Calculate current period conversion rate
      const currentKPIs = await this.calculateKPIsForPeriod(
        funnel.steps,
        tenantID,
        projectID,
        date,
      );

      // Calculate previous period conversion rate for comparison
      const previousKPIs = await this.calculateKPIsForPeriod(
        funnel.steps,
        tenantID,
        projectID,
        previousPeriod,
      );

      const change = this.calculatePercentageChange(
        previousKPIs.conversionRate,
        currentKPIs.conversionRate,
      );

      return {
        conversionRate: Math.round(currentKPIs.conversionRate),
        change,
      };
    } catch (error) {
      this.logger.error('Failed to get funnel conversion summary:', error);
      return {
        conversionRate: 0,
        change: { value: 0, sign: '+' },
      };
    }
  }

  private async calculateFunnelStepsAnalytics(
    steps: any[],
    tenantID: string,
    projectID: string,
    dateRange: { startDate: Date; endDate: Date },
  ) {
    const sortedSteps = steps.sort((a, b) => a.step_order - b.step_order);
    const stepAnalytics = [];

    for (let i = 0; i < sortedSteps.length; i++) {
      const step = sortedSteps[i];
      const userCount = await this.getUniqueUserCountForEvent(
        step.event_name,
        tenantID,
        projectID,
        dateRange,
      );

      const isFirst = i === 0;
      let dropOffPercentage = 0;
      let conversionRate = 0;

      if (!isFirst && stepAnalytics[i - 1]) {
        const previousCount = stepAnalytics[i - 1].count;
        dropOffPercentage =
          previousCount > 0
            ? Math.round(((previousCount - userCount) / previousCount) * 100)
            : 0;

        conversionRate =
          previousCount > 0 ? Math.round((userCount / previousCount) * 100) : 0;
      }

      stepAnalytics.push({
        name: step.event_name,
        count: userCount,
        dropOffPercentage: Math.max(0, dropOffPercentage),
        conversionRate: isFirst ? 100 : Math.max(0, conversionRate),
        isFirst: isFirst,
        step_order: step.step_order,
      });
    }

    return stepAnalytics;
  }

  private async getUniqueUserCountForEvent(
    eventName: string,
    tenantID: string,
    projectID: string,
    dateRange: { startDate: Date; endDate: Date },
  ): Promise<number> {
    try {
      const eventOccurrence = await this.eventOccRepo.findOneByCondition({
        title: eventName,
        tenantID,
        projectID,
      });

      if (!eventOccurrence) {
        this.logger.warn(`Event occurrence not found for event: ${eventName}`);
        return 0;
      }

      const uniqueUsersCount = await this.userOccRepo.aggregate([
        {
          $match: {
            parentEventID: eventOccurrence.parentEventID,
            tenantID,
            projectID,
            createdAt: {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate,
            },
          },
        },
        {
          $group: {
            _id: '$userID',
          },
        },
        {
          $count: 'uniqueUsers',
        },
      ]);

      return uniqueUsersCount.length > 0 ? uniqueUsersCount[0].uniqueUsers : 0;
    } catch (error) {
      this.logger.error(
        `Error getting user count for event ${eventName}:`,
        error,
      );
      Sentry.captureException(error);
      return 0;
    }
  }

  async deleteFunnel(funnelId: string, tenantID: string, projectID: string) {
    try {
      const result = await this.funnelRepo.deleteByCondition({
        _id: funnelId,
        tenantID: tenantID,
        projectID: projectID,
      });

      if (!result) {
        throw new HttpException('Funnel not found', HttpStatus.NOT_FOUND);
      }

      this.logger.log(`Funnel deleted successfully: ${funnelId}`);
      return { success: true, message: 'Funnel deleted successfully' };
    } catch (error) {
      this.logger.error('Failed to delete funnel:', error);
      Sentry.captureException(error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to delete funnel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFunnelKPIs(
    funnelId: string,
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    try {
      const date = this.utils.getDateRange(dateRange, 2);
      const previousPeriod = this.utils.getPreviousPeriod(
        date.startDate,
        date.endDate,
      );

      const funnel = await this.getFunnel(funnelId, tenantID, projectID);

      if (!funnel) {
        Sentry.captureMessage('Funnel not found');
        throw new HttpException('Funnel not found', HttpStatus.NOT_FOUND);
      }

      const currentKPIs = await this.calculateKPIsForPeriod(
        funnel.steps,
        tenantID,
        projectID,
        date,
      );

      const previousKPIs = await this.calculateKPIsForPeriod(
        funnel.steps,
        tenantID,
        projectID,
        previousPeriod,
      );

      const kpis = [
        {
          name: 'Conversion Rate',
          value: `${currentKPIs.conversionRate.toFixed(0)}%`,
          change: this.calculatePercentageChange(
            previousKPIs.conversionRate,
            currentKPIs.conversionRate,
          ),
          infoText: 'Percentage of users who completed all steps',
          suffix: '%',
        },
        {
          name: 'Total Conversions',
          value: currentKPIs.totalConversions.toString(),
          change: this.calculatePercentageChange(
            previousKPIs.totalConversions,
            currentKPIs.totalConversions,
          ),
          infoText: 'Users who completed the entire funnel',
          suffix: '%',
        },
        {
          name: 'Median Time to Convert',
          value: currentKPIs.medianTimeToConvert,
          change: this.calculateTimeChange(
            previousKPIs.medianTimeToConvertSeconds,
            currentKPIs.medianTimeToConvertSeconds,
          ),
          infoText: 'Average time from first step to completion',
        },
        // {
        //   kpiName: 'Average Time to Convert',
        //   value: currentKPIs.averageTimeToConvert,
        //   change: this.calculateTimeChange(
        //     previousKPIs.averageTimeToConvertSeconds,
        //     currentKPIs.averageTimeToConvertSeconds,
        //   ),
        // },
        {
          name: 'Drop-off Rate',
          value: `${currentKPIs.dropOffRate.toFixed(0)}%`,
          change: this.calculatePercentageChange(
            previousKPIs.dropOffRate,
            currentKPIs.dropOffRate,
          ),
          infoText: "Percentage of users who didn't complete the funnel",
          suffix: '%',
        },
      ];

      return {
        kpis,
        dateRange: {
          current: {
            startDate: date.startDate,
            endDate: date.endDate,
          },
          previous: {
            startDate: previousPeriod.startDate,
            endDate: previousPeriod.endDate,
          },
        },
        funnelName: funnel.funnel_name,
      };
    } catch (error) {
      this.logger.error('Failed to get funnel KPIs:', error);
      Sentry.captureException(error);

      throw new HttpException(
        'Failed to retrieve funnel KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async calculateKPIsForPeriod(
    steps: any[],
    tenantID: string,
    projectID: string,
    dateRange: { startDate: Date; endDate: Date },
  ) {
    const sortedSteps = steps.sort((a, b) => a.step_order - b.step_order);
    const firstStepName = sortedSteps[0].event_name;
    const lastStepName = sortedSteps[sortedSteps.length - 1].event_name;

    const stepCounts = await Promise.all(
      sortedSteps.map((step) =>
        this.getUniqueUserCountForEvent(
          step.event_name,
          tenantID,
          projectID,
          dateRange,
        ),
      ),
    );

    const firstStepCount = stepCounts[0];
    const lastStepCount = stepCounts[stepCounts.length - 1];

    const conversionRate =
      firstStepCount > 0 ? (lastStepCount / firstStepCount) * 100 : 0;

    const totalConversions = lastStepCount;

    const dropOffRate =
      firstStepCount > 0
        ? ((firstStepCount - lastStepCount) / firstStepCount) * 100
        : 0;

    const timeToConvertData = await this.calculateTimeToConvert(
      firstStepName,
      lastStepName,
      tenantID,
      projectID,
      dateRange,
    );

    return {
      conversionRate,
      totalConversions,
      dropOffRate,
      medianTimeToConvert: timeToConvertData.median,
      averageTimeToConvert: timeToConvertData.average,
      medianTimeToConvertSeconds: timeToConvertData.medianSeconds,
      averageTimeToConvertSeconds: timeToConvertData.averageSeconds,
    };
  }

  private async calculateTimeToConvert(
    firstStepName: string,
    lastStepName: string,
    tenantID: string,
    projectID: string,
    dateRange: { startDate: Date; endDate: Date },
  ) {
    try {
      const completedUsersTimings = await this.eventsRepo.aggregate([
        {
          $match: {
            tenantID,
            projectID,
            timestamp: {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate,
            },
            title: { $in: [firstStepName, lastStepName] },
            'user.id': { $ne: null },
          },
        },
        {
          $group: {
            _id: {
              userId: '$user.id',
              title: '$title',
            },
            firstTimestamp: { $min: '$timestamp' },
          },
        },
        {
          $group: {
            _id: '$_id.userId',
            events: {
              $push: {
                title: '$_id.title',
                timestamp: '$firstTimestamp',
              },
            },
          },
        },
        {
          $match: {
            'events.1': { $exists: true },
          },
        },
        {
          $project: {
            userId: '$_id',
            firstStepTime: {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: '$events',
                        cond: { $eq: ['$$this.title', firstStepName] },
                      },
                    },
                    as: 'event',
                    in: '$$event.timestamp',
                  },
                },
                0,
              ],
            },
            lastStepTime: {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: '$events',
                        cond: { $eq: ['$$this.title', lastStepName] },
                      },
                    },
                    as: 'event',
                    in: '$$event.timestamp',
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $match: {
            firstStepTime: { $ne: null },
            lastStepTime: { $ne: null },
          },
        },
        {
          $project: {
            userId: 1,
            timeToConvertMs: {
              $subtract: ['$lastStepTime', '$firstStepTime'],
            },
          },
        },
        {
          $match: {
            timeToConvertMs: { $gt: 0 },
          },
        },
        {
          $sort: { timeToConvertMs: 1 },
        },
      ]);

      if (completedUsersTimings.length === 0) {
        return {
          median: 'No data',
          average: 'No data',
          medianSeconds: 0,
          averageSeconds: 0,
        };
      }

      // Convert to seconds and calculate median/average
      const timingsInSeconds = completedUsersTimings.map(
        (user) => user.timeToConvertMs / 1000,
      );

      const medianSeconds = this.calculateMedian(timingsInSeconds);
      const averageSeconds =
        timingsInSeconds.reduce((a, b) => a + b, 0) / timingsInSeconds.length;

      return {
        median: this.utils.formatDuration(medianSeconds),
        average: this.utils.formatDuration(averageSeconds),
        medianSeconds,
        averageSeconds,
      };
    } catch (error) {
      this.logger.error('Error calculating time to convert:', error);
      return {
        median: 'Error',
        average: 'Error',
        medianSeconds: 0,
        averageSeconds: 0,
      };
    }
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculatePercentageChange(
    previousValue: number,
    currentValue: number,
  ): { value: number; sign: string } {
    if (previousValue === 0) {
      return {
        value: currentValue > 0 ? 100 : 0,
        sign: currentValue > 0 ? '+' : '-',
      };
    }

    const change = ((currentValue - previousValue) / previousValue) * 100;
    const sign = change >= 0 ? '+' : '-';
    return {
      value: parseInt(`${sign}${change.toFixed(1)}`),
      sign,
    };
  }

  private calculateTimeChange(
    previousSeconds: number,
    currentSeconds: number,
  ): string {
    if (previousSeconds === 0 || currentSeconds === 0) {
      return 'No data';
    }

    const change = ((currentSeconds - previousSeconds) / previousSeconds) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }
}
