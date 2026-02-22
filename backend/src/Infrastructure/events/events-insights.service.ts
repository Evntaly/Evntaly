import { Injectable } from '@nestjs/common';
import { eventsRepository } from './events.repository';
import { featuresListDTO, topicsListDTO } from './DTOs';
import * as moment from 'moment';
import { utilitiesService } from 'src/@core/helpers';

@Injectable()
export class eventsInsightsService {
  constructor(
    private readonly evntRepository: eventsRepository,
    private utils: utilitiesService,
  ) {}

  async getFeaturesInsightsList(
    tenantID: string,
    projectID: string,
    total_users: number,
    query_settings: {
      date_range: string;
      sort_by?: any;
      sort_as?: any;
      skip?: any;
      limit?: any;
      search_key?: any;
    },
  ) {
    const dates = this.utils.getDateRange(
      query_settings.date_range || 'today',
      3,
    );

    const previous_period = this.getPreviousPeriod(
      dates.startDate,
      dates.endDate,
    );

    const original_query = this.getFeaturesInsightListQuery(
      tenantID,
      projectID,
      dates.startDate,
      dates.endDate,
      query_settings.search_key,
    );

    const result = await this.evntRepository.aggregate(original_query);

    for (const feature_record of result) {
      feature_record.unique_users_using_feature_performance = 0;
      feature_record.total_events_performance = 0;
      feature_record.adoption = 0;

      if (total_users > 0) {
        feature_record.adoption =
          (feature_record.unique_users_using_feature / total_users) * 100;
      }

      const occurances = await this.getFirstAndLastOccuranceByFeature(
        tenantID,
        projectID,
        feature_record.name,
      );

      if (occurances.length > 0) {
        feature_record.last_seen_active = occurances[0]['last_seen_active'];
        feature_record.registeration_date = occurances[0]['registeration_date'];
      }
    }

    const performance_query = this.getFeaturesInsightListQuery(
      tenantID,
      projectID,
      previous_period.startDate,
      previous_period.endDate,
      query_settings.search_key,
    );

    const historical_results =
      await this.evntRepository.aggregate(performance_query);

    historical_results.forEach((item: featuresListDTO) => {
      const feature: featuresListDTO = result.find((x) => x.name == item.name);

      if (feature) {
        const users_variance =
          feature.unique_users_using_feature - item.unique_users_using_feature;
        const events_variance = feature.total_events - item.total_events;
        const adoption_variance =
          feature.adoption -
          (item.unique_users_using_feature / total_users) * 100;

        feature.unique_users_using_feature_performance = users_variance;
        feature.total_events_performance = events_variance;
        feature.adoption_performance = adoption_variance;
      }
    });

    const sorted_result = this.sortInsightList(
      result,
      query_settings.sort_by || 'adoption',
      query_settings.sort_as || 'desc',
    );

    const paginated_result = sorted_result.slice(
      query_settings.skip,
      query_settings.skip + query_settings.limit,
    );

    return {
      data: paginated_result,
      collectionSize: result.length,
    };
  }

  async getTopicsInsightsList(
    tenantID: string,
    projectID: string,
    query_settings: {
      date_range: string;
      sort_by?: any;
      sort_as?: any;
      skip?: any;
      limit?: any;
      search_key?: any;
    },
  ) {
    const dates = this.utils.getDateRange(
      query_settings.date_range || 'today',
      3,
    );

    const previous_period = this.getPreviousPeriod(
      dates.startDate,
      dates.endDate,
    );

    const original_query = this.getTopicsInsightListQuery(
      tenantID,
      projectID,
      dates.startDate,
      dates.endDate,
      query_settings.search_key,
    );

    const result = await this.evntRepository.aggregate(original_query);

    for (const topic_record of result) {
      const occurances = await this.getFirstAndLastOccuranceByTopic(
        tenantID,
        topic_record.name,
      );

      if (occurances.length > 0) {
        topic_record.last_seen_active = occurances[0]['last_seen_active'];
        topic_record.registeration_date = occurances[0]['registeration_date'];
      }
    }

    const performance_query = this.getTopicsInsightListQuery(
      tenantID,
      projectID,
      previous_period.startDate,
      previous_period.endDate,
      query_settings.search_key,
    );

    const historical_results =
      await this.evntRepository.aggregate(performance_query);

    historical_results.forEach((item: topicsListDTO) => {
      const topic: topicsListDTO = result.find((x) => x.name == item.name);

      if (topic) {
        const events_variance = topic.total_events - item.total_events;
        topic.total_events_performance = events_variance;
      }
    });

    const sorted_result = this.sortInsightList(
      result,
      query_settings.sort_by || 'total_events',
      query_settings.sort_as || 'desc',
    );

    const paginated_result = sorted_result.slice(
      query_settings.skip,
      query_settings.skip + query_settings.limit,
    );

    return {
      data: paginated_result,
      collectionSize: result.length,
    };
  }

  async getActiveUsersChartData(tenantID, dateRange, projectID) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          user: { $ne: null },
          'user.id': { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp',
                timezone: '+02:00',
              },
            },
            user: '$user.id',
          },
          uniqueUser: { $first: '$user.id' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          uniqueUsers: { $addToSet: '$uniqueUser' },
        },
      },
      {
        $project: {
          _id: '$_id',
          count: { $size: '$uniqueUsers' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);

    const timezoneOffset = 2;

    const todayStr = moment().utcOffset(timezoneOffset).format('YYYY-MM-DD');

    const yesterdayStr = moment()
      .utcOffset(timezoneOffset)
      .subtract(1, 'days')
      .format('YYYY-MM-DD');

    const todayData = result.find((item: any) => item._id === todayStr);
    const yesterdayData = result.find((item: any) => item._id === yesterdayStr);

    const todayUsers = todayData?.count || 0;
    const yesterdayUsers = yesterdayData?.count || 0;
    let percentageChange;

    if (yesterdayUsers === 0) {
      percentageChange = todayUsers > 0 ? 100 : 0;
    } else {
      percentageChange = ((todayUsers - yesterdayUsers) / yesterdayUsers) * 100;
    }

    return {
      data: result,
      kpi: todayUsers,
      variance: percentageChange,
    };
  }

  async getNumberOfActiveUsers(tenantID, projectID, dateRange) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $addToSet: '$user.id' },
        },
      },
      {
        $project: {
          _id: 0,
          count: { $size: '$uniqueUsers' },
        },
      },
    ];

    return await this.evntRepository.aggregate(pipeline);
  }

  async getNumberOfActiveUsersWithVariance(tenantID, projectID, dateRange) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);
    const previousPeriod = this.utils.getPreviousPeriod(
      dates.startDate,
      dates.endDate,
    );

    // Current period pipeline
    const currentPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $addToSet: '$user.id' },
        },
      },
      {
        $project: {
          _id: 0,
          count: { $size: '$uniqueUsers' },
        },
      },
    ];

    // Previous period pipeline
    const previousPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: {
            $gte: previousPeriod.startDate,
            $lte: previousPeriod.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $addToSet: '$user.id' },
        },
      },
      {
        $project: {
          _id: 0,
          count: { $size: '$uniqueUsers' },
        },
      },
    ];

    // Execute both queries in parallel
    const [currentResult, previousResult] = await Promise.all([
      this.evntRepository.aggregate(currentPipeline),
      this.evntRepository.aggregate(previousPipeline),
    ]);

    const currentCount = currentResult[0]?.count || 0;
    const previousCount = previousResult[0]?.count || 0;

    // Calculate variance
    const difference = currentCount - previousCount;
    let percentageChange = 0;
    if (previousCount > 0) {
      percentageChange = (difference / previousCount) * 100;
    } else if (currentCount > 0) {
      percentageChange = 100; // 100% increase from 0
    }

    return {
      current: currentCount,
      previous: previousCount,
      difference: difference,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  }

  async getDropOffUsersCount(tenantID, projectID) {
    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
        },
      },
      {
        $group: {
          _id: '$user.id',
          eventCount: { $sum: 1 },
        },
      },
      {
        $match: {
          eventCount: 1,
        },
      },
      {
        $count: 'dropOffUsers',
      },
    ];

    return await this.evntRepository.aggregate(pipeline);
  }

  async getOnlineUsersWithHistory(
    tenantID: string,
    projectID: string,
  ): Promise<{ online_users: number; history: number[] }> {
    const timezoneOffset = '+02:00';
    const now = moment().utcOffset(2);

    // Calculate 5 minutes ago for current online users
    const fiveMinutesAgo = now.clone().subtract(5, 'minutes').toDate();

    // Calculate 12 hours ago for history
    const twelveHoursAgo = now.clone().subtract(12, 'hours').toDate();

    // Pipeline for current online users (last 5 minutes)
    const onlineUsersPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: fiveMinutesAgo },
          user: { $ne: null },
          'user.id': { $ne: null },
        },
      },
      {
        $group: {
          _id: '$user.id',
        },
      },
      {
        $count: 'onlineUsers',
      },
    ];

    // Pipeline for hourly history (last 12 hours)
    const historyPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: twelveHoursAgo },
          user: { $ne: null },
          'user.id': { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            hour: {
              $dateToString: {
                format: '%Y-%m-%d-%H',
                date: '$timestamp',
                timezone: timezoneOffset,
              },
            },
            user: '$user.id',
          },
        },
      },
      {
        $group: {
          _id: '$_id.hour',
          uniqueUsers: { $addToSet: '$_id.user' },
        },
      },
      {
        $project: {
          _id: '$_id',
          count: { $size: '$uniqueUsers' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    // Execute both queries in parallel
    const [onlineResult, historyResult] = await Promise.all([
      this.evntRepository.aggregate(onlineUsersPipeline),
      this.evntRepository.aggregate(historyPipeline),
    ]);

    const onlineUsers = onlineResult[0]?.onlineUsers || 0;

    // Build the 24-hour history array (from oldest to newest)
    const historyMap = new Map<string, number>();
    historyResult.forEach((item: any) => {
      historyMap.set(item._id, item.count);
    });

    // Generate all 12 hour slots and fill with data or 0
    const history: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const hourKey = now.clone().subtract(i, 'hours').format('YYYY-MM-DD-HH');
      history.push(historyMap.get(hourKey) || 0);
    }

    return {
      online_users: onlineUsers,
      history: history,
    };
  }

  async getSessionsCountPerDayChartData(tenantID, projectID, dateRange) {
    const dates = this.utils.getDateRange(dateRange || 'today', 3);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          sessionID: { $nin: [null, ''] },
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp',
              timezone: '+03:00',
            },
          },
          uniqueSessions: { $addToSet: '$sessionID' },
        },
      },
      {
        $project: {
          _id: '$_id',
          count: { $size: '$uniqueSessions' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);

    return {
      data: result,
    };
  }

  async getFirstAndLastOccurance(
    tenantID: string,
    projectID: string,
    title: string,
  ) {
    const query = [
      {
        $match: {
          title: title,
          tenantID: tenantID,
          projectID: projectID,
        },
      },
      {
        $sort: {
          timestamp: -1,
        },
      },
      {
        $group: {
          _id: '$title',
          firstOccurance: { $first: '$timestamp' },
          lastOccurance: { $last: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          title: '$_id',
          first_occurance: '$firstOccurance',
          last_occurance: '$lastOccurance',
        },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  async getPageViewEventsCount(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 3);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          type: 'Page View',
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $count: 'pageViewCount',
      },
    ];
    const result = await this.evntRepository.aggregate(pipeline);
    return result[0]?.pageViewCount || 0;
  }

  async getPageViewEventsCountWithVariance(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 3);
    const previousPeriod = this.utils.getPreviousPeriod(
      dates.startDate,
      dates.endDate,
    );

    // Current period pipeline
    const currentPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          type: 'Page View',
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $count: 'pageViewCount',
      },
    ];

    // Previous period pipeline
    const previousPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          type: 'Page View',
          timestamp: {
            $gte: previousPeriod.startDate,
            $lte: previousPeriod.endDate,
          },
        },
      },
      {
        $count: 'pageViewCount',
      },
    ];

    // Execute both queries in parallel
    const [currentResult, previousResult] = await Promise.all([
      this.evntRepository.aggregate(currentPipeline),
      this.evntRepository.aggregate(previousPipeline),
    ]);

    const currentCount = currentResult[0]?.pageViewCount || 0;
    const previousCount = previousResult[0]?.pageViewCount || 0;

    // Calculate variance
    const difference = currentCount - previousCount;
    let percentageChange = 0;
    if (previousCount > 0) {
      percentageChange = (difference / previousCount) * 100;
    } else if (currentCount > 0) {
      percentageChange = 100; // 100% increase from 0
    }

    return {
      current: currentCount,
      previous: previousCount,
      difference: difference,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  }

  async getUniqueSessionsCount(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 3);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          sessionID: { $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$sessionID',
        },
      },
      {
        $count: 'uniqueSessionsCount',
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result[0]?.uniqueSessionsCount || 0;
  }

  async getUniqueSessionsCountWithVariance(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 3);
    const previousPeriod = this.utils.getPreviousPeriod(
      dates.startDate,
      dates.endDate,
    );

    // Current period pipeline
    const currentPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          sessionID: { $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$sessionID',
        },
      },
      {
        $count: 'uniqueSessionsCount',
      },
    ];

    // Previous period pipeline
    const previousPipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: {
            $gte: previousPeriod.startDate,
            $lte: previousPeriod.endDate,
          },
          sessionID: { $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$sessionID',
        },
      },
      {
        $count: 'uniqueSessionsCount',
      },
    ];

    // Execute both queries in parallel
    const [currentResult, previousResult] = await Promise.all([
      this.evntRepository.aggregate(currentPipeline),
      this.evntRepository.aggregate(previousPipeline),
    ]);

    const currentCount = currentResult[0]?.uniqueSessionsCount || 0;
    const previousCount = previousResult[0]?.uniqueSessionsCount || 0;

    // Calculate variance
    const difference = currentCount - previousCount;
    let percentageChange = 0;
    if (previousCount > 0) {
      percentageChange = (difference / previousCount) * 100;
    } else if (currentCount > 0) {
      percentageChange = 100; // 100% increase from 0
    }

    return {
      current: currentCount,
      previous: previousCount,
      difference: difference,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  }

  async getPageViewCountPerDayChartData(tenantID, projectID, dateRange) {
    const dates = this.utils.getDateRange(dateRange || 'today', 3);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          type: 'Page View',
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp',
              timezone: '+03:00',
            },
          },
          count: { $sum: 1 }, // Count the actual page view events per day
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);

    return {
      data: result,
    };
  }

  //#region Helper Methods..
  private getPreviousPeriod(startDate, endDate) {
    const currentStartDate = moment(startDate);
    const currentEndDate = moment(endDate);

    const duration = moment.duration(currentEndDate.diff(currentStartDate));

    const previousStartDate = currentStartDate.clone().subtract(duration);
    const previousEndDate = currentEndDate.clone().subtract(duration);

    return {
      startDate: previousStartDate.toDate(),
      endDate: previousEndDate.toDate(),
    };
  }

  private sortInsightList(
    list: any[],
    attribute: any,
    order: 'asc' | 'desc' = 'asc',
  ): any[] {
    return list.sort((a, b) => {
      let valueA = a[attribute];
      let valueB = b[attribute];

      // Handle Date objects differently
      if (valueA instanceof Date && valueB instanceof Date) {
        valueA = valueA.getTime();
        valueB = valueB.getTime();
      }

      // Handle optional values
      if (valueA === undefined) return 1;
      if (valueB === undefined) return -1;

      // Numeric or Date comparison
      const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;

      return order === 'asc' ? comparison : -comparison;
    });
  }

  private async getFirstAndLastOccuranceByTopic(
    tenantID: string,
    topic_name: string,
  ) {
    const query = [
      {
        $match: {
          topic: topic_name,
          tenantID: tenantID,
        },
      },
      {
        $sort: {
          timestamp: 1,
        },
      },
      {
        $group: {
          _id: '$topic',
          firstEvent: { $first: '$timestamp' },
          lastEvent: { $last: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          feature: '$_id',
          registeration_date: '$firstEvent',
          last_seen_active: '$lastEvent',
        },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  private async getFirstAndLastOccuranceByFeature(
    tenantID: string,
    projectID: string,
    feature_name: string,
  ) {
    const query = [
      {
        $match: {
          feature: feature_name,
          tenantID: tenantID,
          projectID: projectID,
        },
      },
      {
        $sort: {
          timestamp: 1,
        },
      },
      {
        $group: {
          _id: '$feature',
          firstEvent: { $first: '$timestamp' },
          lastEvent: { $last: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          feature: '$_id',
          registeration_date: '$firstEvent',
          last_seen_active: '$lastEvent',
        },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  private getFeaturesInsightListQuery(
    tenantID,
    projectID,
    startDate,
    endDate,
    search_key,
  ) {
    const query = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          'user.id': { $ne: null },
          timestamp: { $gte: startDate, $lte: endDate },
          feature: { $regex: search_key, $options: 'i' },
        },
      },
      {
        $group: {
          _id: { feature: '$feature', userId: '$user.id' },
          eventsCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.feature',
          unique_users_using_feature: { $sum: 1 },
          total_events: { $sum: '$eventsCount' },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          total_events: 1,
          unique_users_using_feature: 1,
          usage: 1,
        },
      },
    ];

    return query;
  }

  private getTopicsInsightListQuery(
    tenantID,
    projectID,
    startDate,
    endDate,
    search_key,
  ) {
    const query = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: startDate, $lte: endDate },
          topic: { $regex: search_key, $options: 'i' },
        },
      },
      {
        $group: {
          _id: { topic: '$topic' },
          total_events: { $sum: 1 },
        },
      },
      // {
      //   $group: {
      //     _id: '$_id.topic',
      //     total_events: { $sum: '$eventsCount' },
      //   },
      // },
      {
        $project: {
          _id: 0,
          name: '$_id.topic',
          total_events: 1,
        },
      },
    ];

    return query;
  }
  //#endregion
}
