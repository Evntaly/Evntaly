import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createUserDTO } from './DTOs';
import { users } from 'src/@domain';
import { usersRepository } from './users.repository';
import * as moment from 'moment';
import { utilitiesService } from 'src/@core/helpers';

@Injectable()
export class usersService {
  constructor(
    private readonly usrsRepository: usersRepository,
    private utils: utilitiesService,
  ) {}

  async create(dto: createUserDTO) {
    const new_event: users = {
      ...dto,
    };

    if (dto.email) {
      const is_already_existing = await this.usrsRepository.findOneByCondition({
        tenantID: dto.tenantID,
        projectID: dto.projectID,
        email: dto.email,
      });

      if (is_already_existing) {
        return new HttpException(
          `User with the same email already registered.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return this.usrsRepository.create(new_event);
  }

  list(
    tenantID: string,
    projectID: string,
    query_settings: {
      date_range: string;
      search_key?: any;
    },
  ) {
    return this.usrsRepository.findAllByCondition(
      {
        tenantID: tenantID,
        projectID: projectID,
        $or: [
          { email: { $regex: query_settings.search_key, $options: 'i' } },
          { full_name: { $regex: query_settings.search_key, $options: 'i' } },
          { id: { $regex: query_settings.search_key, $options: 'i' } },
        ],
      },
      ['id', 'email', 'full_name', 'organization', 'createdAt'],
    );
  }

  details(query) {
    return this.usrsRepository.findOneByCondition(
      {
        tenantID: query.tenantID,
        projectID: query.projectID,
        id: query.userID,
      },
      [
        'createdAt',
        'organization',
        'full_name',
        'email',
        'id',
        'updatedAt',
        'data',
        'alert',
      ],
    );
  }

  count(query) {
    return this.usrsRepository.count({
      tenantID: query.tenantID,
      projectID: query.projectID,
    });
  }

  async update(updated_entity: users) {
    return await this.usrsRepository.update(
      updated_entity['_id'],
      updated_entity,
    );
  }

  async deleteAll(query) {
    return await this.usrsRepository.deleteManyByCondition(query);
  }

  async getRegisteredUserChartData(tenantID, dateRange, projectID) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          createdAt: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: '+02:00',
              },
            },
            hour: {
              $dateToString: {
                format: '%H',
                date: '$createdAt',
                timezone: '+02:00',
              },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: '$_id.date', // Keep original date format for backward compatibility
          date: '$_id.date',
          hour: '$_id.hour',
          datetime: {
            $concat: ['$_id.date', ' ', '$_id.hour', ':00'],
          },
          count: 1,
        },
      },
      {
        $sort: { datetime: 1 },
      },
    ];

    const result = await this.usrsRepository.aggregate(pipeline);

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

  async getTotalNumberOfRegisteredUsers(query) {
    const dates = this.utils.getDateRange(query.dateRange || 'today', 2);
    const cond = { tenantID: query.tenantID, projectID: query.projectID };

    if (query.dateRange) {
      cond['createdAt'] = {
        $gte: dates.startDate,
        $lt: dates.endDate,
      };
    }

    return await this.usrsRepository.count(cond);
  }

  async getTotalUsersWithVariance(query) {
    const dates = this.utils.getDateRange(query.dateRange || 'today', 2);
    const previousPeriod = this.utils.getPreviousPeriod(
      dates.startDate,
      dates.endDate,
    );

    const baseCond = { tenantID: query.tenantID, projectID: query.projectID };

    // Current period condition
    const currentCond = { ...baseCond };
    if (query.dateRange) {
      currentCond['createdAt'] = {
        $gte: dates.startDate,
        $lt: dates.endDate,
      };
    }

    // Previous period condition
    const previousCond = { ...baseCond };
    if (query.dateRange) {
      previousCond['createdAt'] = {
        $gte: previousPeriod.startDate,
        $lt: previousPeriod.endDate,
      };
    }

    // Get both counts in parallel
    const [currentCount, previousCount] = await Promise.all([
      this.usrsRepository.count(currentCond),
      this.usrsRepository.count(previousCond),
    ]);

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
}
