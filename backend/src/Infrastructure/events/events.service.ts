import { eventOccurancesRepository } from './../event_occurances/event_occurances.repository';
import { Injectable } from '@nestjs/common';
import { eventsRepository } from './events.repository';
import {
  createEventDTO,
  keyEventsChecklistDTO,
  listEventsDto,
  searchCriteria,
} from './DTOs';
// import * as moment from 'moment';
import { events } from 'src/@domain';
import { utilitiesService } from 'src/@core/helpers';
import type { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';

@Injectable()
export class eventsService {
  constructor(
    private readonly evntRepository: eventsRepository,
    private readonly evntOcrncRepository: eventOccurancesRepository,
    private utils: utilitiesService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  async create(dto: createEventDTO) {
    const new_event: events = {
      ...dto,
      context: dto.context || {},
      requestContext: dto.requestContext || {},
      eventID: this.utils.generateEventID('EV'),
    };
    return await this.evntRepository.create(new_event);
  }

  async details(tenantID: string, eventID: string, projectID: string) {
    return await this.evntRepository.findOneByCondition({
      tenantID: tenantID,
      projectID: projectID,
      eventID: eventID,
    });
  }

  async update(updated_entity: events) {
    return await this.evntRepository.update(
      updated_entity['_id'],
      updated_entity,
    );
  }

  async deleteSingleOccurance(tenantID: string, eventID: string) {
    return await this.evntRepository.deleteByCondition({
      tenantID: tenantID,
      eventID: eventID,
    });
  }

  async list(
    criteria: searchCriteria,
    query_settings: { skip?: any; limit?: any },
    tenantID: string,
    projectID: string,
  ) {
    const dates = this.utils.getDateRange(criteria.range, 2);
    const query: any = {
      $and: [
        {
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          tenantID: tenantID,
          projectID: projectID,
        },
      ],
    };

    if (criteria.status.toLowerCase() !== 'all') {
      query.$and.push({ status: { $regex: criteria.status, $options: 'i' } });
    }

    if (criteria.metadata) {
      query.$and.push({
        $or: [
          { title: { $regex: criteria.metadata, $options: 'i' } },
          {
            description: {
              $regex: `\\b${criteria.metadata}\\b`,
              $options: 'i',
            },
          },
        ],
      });
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query.$and.push({ tags: { $in: criteria.tags } });
    }

    if (criteria.userKey) {
      query.$and.push({
        $or: [
          { 'user.id': criteria.userKey },
          { 'user.full_name': { $regex: criteria.userKey, $options: 'i' } },
          { 'user.email': { $regex: criteria.userKey, $options: 'i' } },
        ],
      });
    }

    if (criteria.featureKey) {
      query.$and.push({
        feature: { $regex: criteria.featureKey, $options: 'i' },
      });
    }

    if (criteria.topicKey) {
      query.$and.push({
        topic: { $regex: criteria.topicKey, $options: 'i' },
      });
    }

    if (query.$and.length === 0) {
      query.$and.shift();
    }

    const collectionSize = await this.evntRepository.count(query);

    const events_res = await this.evntRepository.findAllByCondition(
      query,
      [],
      query_settings.skip,
      query_settings.limit,
      'createdAt',
      'desc',
    );

    const mapped_events = this.mapper.mapArray<events, listEventsDto>(
      events_res,
      events,
      listEventsDto,
    );

    const labeled_key_events = await this.distinguisKeyEvents(
      mapped_events,
      tenantID,
      projectID,
    );

    return {
      data: labeled_key_events,
      collectionSize: collectionSize,
    };
  }

  async distinguisKeyEvents(
    events: listEventsDto[],
    tenantID: string,
    projectID: string,
  ) {
    const all_key_events = await this.evntOcrncRepository.findAllByCondition(
      { is_key_event: true, tenantID: tenantID, projectID: projectID },
      ['title', 'parentEventID'],
    );

    events.forEach((event) => {
      const is_existing = all_key_events.find(
        (x) => x.parentEventID == event.parentEventID,
      );

      if (is_existing) {
        event.is_key_event = true;
      }
    });

    return events;
  }

  async groupEventsByName(
    criteria: searchCriteria,
    tenantID: string,
    projectID: string,
  ) {
    const dates = this.utils.getDateRange(criteria.range, 2);
    const matchFilter: any = {
      timestamp: { $gte: dates.startDate, $lte: dates.endDate },
      tenantID: tenantID,
      projectID: projectID,
    };

    if (criteria.status && criteria.status.toLowerCase() !== 'all') {
      matchFilter.status = { $regex: criteria.status, $options: 'i' };
    }

    if (criteria.metadata) {
      matchFilter.$or = [
        { title: { $regex: criteria.metadata, $options: 'i' } },
        {
          description: {
            $regex: `\\b${criteria.metadata}\\b`,
            $options: 'i',
          },
        },
      ];
    }

    if (criteria.tags && criteria.tags.length > 0) {
      matchFilter.tags = { $in: criteria.tags };
    }

    if (criteria.userKey) {
      matchFilter.$or = [
        { 'user.id': criteria.userKey },
        { 'user.full_name': { $regex: criteria.userKey, $options: 'i' } },
        { 'user.email': { $regex: criteria.userKey, $options: 'i' } },
      ];
    }

    if (criteria.featureKey) {
      matchFilter.feature = { $regex: criteria.featureKey, $options: 'i' };
    }

    if (criteria.topicKey) {
      matchFilter.topic = { $regex: criteria.topicKey, $options: 'i' };
    }

    const pipeline = [
      {
        $match: matchFilter,
      },
      {
        $sort: { createdAt: -1 as const },
      },
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
          events: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          events: 1,
        },
      },
      {
        $sort: { name: 1 as const },
      },
    ];

    const results = await this.evntRepository.aggregate(pipeline);

    const mappedResults = results.map((group) => ({
      name: group.name,
      count: group.count,
      events: this.mapper.mapArray<events, listEventsDto>(
        group.events,
        events,
        listEventsDto,
      ),
    }));

    return {
      data: mappedResults,
      collectionSize: results.length,
    };
  }

  async deleteAll(query) {
    return await this.evntRepository.deleteManyByCondition(query);
  }

  async deleteMany(tenantID: string, parentEventID: string, projectID: string) {
    return await this.evntRepository.deleteManyByCondition({
      tenantID: tenantID,
      parentEventID: parentEventID,
      projectID: projectID,
    });
  }

  async getLastEventSentByUser(
    tenantID: string,
    projectID: string,
    userID: string,
  ) {
    return await this.evntRepository.findOneByCondition(
      {
        tenantID: tenantID,
        projectID: projectID,
        'user.id': userID,
      },
      [],
      { sortField: 'timestamp', sortOrder: -1 },
    );
  }

  async getLastEventSentByManyUsers(
    users: any[],
    tenantID: string,
    projectID: string,
  ) {
    const ids = [];
    users.forEach((user) => ids.push(user.id));

    const query = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          'user.id': { $in: ids },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: '$user.id',
          userID: { $first: '$user.id' },
          timestamp: { $first: '$timestamp' },
        },
      },
      {
        $project: {
          _id: 0,
          userID: 1,
          timestamp: 1,
        },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  async getMostAdoptedFeaturesPerEvent(
    tenantID: string,
    projectID: string,
    parentEventID: string,
  ) {
    return await this.evntRepository.aggregate([
      {
        $match: {
          tenantID: tenantID,
          parentEventID: parentEventID,
          projectID: projectID,
          // feature: { $ne: '' },
        },
      },
      {
        $group: { _id: '$feature', count: { $sum: 1 } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: '$count',
        },
      },
    ]);
  }

  async getMostInteractiveUsersPerEvent(
    tenantID: string,
    projectID: string,
    parentEventID: string,
  ) {
    return await this.evntRepository.aggregate([
      {
        $match: {
          tenantID: tenantID,
          parentEventID: parentEventID,
          projectID: projectID,
          'user.id': { $ne: null },
        },
      },
      {
        $group: { _id: '$user.id', count: { $sum: 1 } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          _id: 0,
          userID: '$_id',
          count: '$count',
        },
      },
    ]);
  }

  async getEventOccurancesData(tenantID, projectID, parentEventID) {
    return await this.evntRepository.aggregate([
      {
        $match: {
          parentEventID: parentEventID,
          tenantID: tenantID,
          projectID: projectID,
          timestamp: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 10)),
            $lt: new Date(),
          },
        },
      },
      {
        $group: {
          _id: '$timestamp',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);
  }

  async getNumberOfUniqueSessionsPeryUser(
    userID: string,
    tenantID: string,
  ): Promise<{ uniqueSessions: number }[] | []> {
    const query = [
      {
        $match: { 'user.id': userID, tenantID: tenantID },
      },
      {
        $group: {
          _id: '$sessionID',
        },
      },
      {
        $count: 'uniqueSessions',
      },
    ];

    return this.evntRepository.aggregate(query);
  }

  async getNumberOfEventsPerUser(userID: string, tenantID: string) {
    return this.evntRepository.count({ 'user.id': userID, tenantID: tenantID });
  }

  async getFirstAndLastEventSentByUser(
    userID: string,
    tenantID: string,
  ): Promise<
    {
      firstEvent: { eventID: string; timestamp: Date };
      lastEvent: { eventID: string; timestamp: Date };
    }[]
  > {
    const query = [
      {
        $match: { 'user.id': userID, tenantID: tenantID },
      },
      {
        $sort: { timestamp: 1 },
      },
      {
        $group: {
          _id: '$user.id',
          firstEvent: { $first: '$$ROOT' },
          lastEvent: { $last: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          firstEvent: {
            eventID: '$firstEvent.eventID',
            timestamp: '$firstEvent.timestamp',
          },
          lastEvent: {
            eventID: '$lastEvent.eventID',
            timestamp: '$lastEvent.timestamp',
          },
        },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  async getMostUsedFeaturePerUser(
    userID: string,
    tenantID: string,
  ): Promise<{ feature: string; count: number }[]> {
    const query = [
      {
        $match: { 'user.id': userID, tenantID: tenantID },
      },
      {
        $group: {
          _id: '$feature',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          feature: '$_id',
          count: 1,
        },
      },
    ];

    return this.evntRepository.aggregate(query);
  }

  async getUserActivityDataForLast3Months(tenantID, userID) {
    const dates = this.utils.getDateRange('last 3 months', 3);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          'user.id': userID,
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
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);

    return result;
  }

  async getKeyEventsChecklistPerUser(tenantID, projectID, userID) {
    const user_checklist: keyEventsChecklistDTO[] = [];
    const all_key_events = await this.evntOcrncRepository.findAllByCondition(
      { is_key_event: true, tenantID: tenantID, projectID: projectID },
      ['title', 'parentEventID', 'key_event_order'],
    );

    for (const event of all_key_events) {
      const is_event_found = await this.evntRepository.findOneByCondition(
        {
          parentEventID: event.parentEventID,
          tenantID: tenantID,
          projectID: projectID,
          'user.id': userID,
        },
        [],
        { sortField: 'createdAt', sortOrder: 1 },
      );

      if (is_event_found) {
        user_checklist.push({
          title: event.title,
          eventID: is_event_found.eventID,
          first_occurance_date: is_event_found.createdAt,
          is_existing: true,
          order: event.key_event_order,
        });
      } else {
        user_checklist.push({
          title: event.title,
          is_existing: false,
          order: event.key_event_order,
        });
      }
    }

    user_checklist.sort((a, b) => a.order - b.order);
    return user_checklist;
  }

  async getEngagementDepth(tenantID, userID) {
    const events_count = await this.evntRepository.count({
      tenantID: tenantID,
      'user.id': userID,
    });

    const sessions_count = await this.getNumberOfUniqueSessionsPeryUser(
      userID,
      tenantID,
    );

    const sessions_unique_count =
      sessions_count.length !== 0 ? sessions_count[0]['uniqueSessions'] : 0;

    if (sessions_unique_count === 0) {
      return 0;
    }

    return events_count / sessions_unique_count;
  }

  async getBounceRate(tenantID, userID) {
    const query = [
      {
        $match: { 'user.id': userID, tenantID: tenantID },
      },
      {
        $group: {
          _id: '$sessionID',
          eventCount: { $sum: 1 },
        },
      },
      {
        $match: { eventCount: 1 },
      },
      {
        $count: 'bouncedSessions',
      },
    ];

    const total_unique_sessions = await this.getNumberOfUniqueSessionsPeryUser(
      userID,
      tenantID,
    );

    const bounced_sessions = await this.evntRepository.aggregate(query);

    const bouncedCount = bounced_sessions?.[0]?.bouncedSessions || 0;
    const totalCount = total_unique_sessions?.[0]?.uniqueSessions || 1;

    return (bouncedCount / totalCount) * 100;
  }

  async avergaeSessionDuration(tenantID, userID) {
    const user_events = await this.evntRepository.findAllByCondition({
      tenantID: tenantID,
      'user.id': userID,
    });

    if (user_events.length === 0) {
      return '0h 0m 0s';
    }

    const sessionTimes = {};

    // Track the start and end times for each session
    user_events.forEach((event) => {
      const { sessionID, timestamp } = event;
      if (!sessionTimes[sessionID]) {
        sessionTimes[sessionID] = { start: timestamp, end: timestamp };
      } else {
        sessionTimes[sessionID].start =
          sessionTimes[sessionID].start < timestamp
            ? sessionTimes[sessionID].start
            : timestamp;
        sessionTimes[sessionID].end =
          sessionTimes[sessionID].end > timestamp
            ? sessionTimes[sessionID].end
            : timestamp;
      }
    });

    let totalDuration = 0;
    let totalSessions = 0;

    for (const sessionId in sessionTimes) {
      const { start, end } = sessionTimes[sessionId];
      const sessionDuration = end - start;
      totalDuration += sessionDuration;
      totalSessions++;
    }

    const averageSessionDuration = totalDuration / totalSessions / 1000;
    return this.utils.formatDuration(averageSessionDuration);
  }

  async calculateUserGeneralStatus(tenantID, userID) {
    const user_events = await this.evntRepository.findAllByCondition({
      tenantID: tenantID,
      'user.id': userID,
    });

    const sessionTimes = {};

    // Track session start and end times for the specific user
    user_events.forEach((event) => {
      const { sessionID, timestamp } = event;
      if (!sessionTimes[sessionID]) {
        sessionTimes[sessionID] = { start: timestamp, end: timestamp };
      } else {
        sessionTimes[sessionID].start =
          sessionTimes[sessionID].start < timestamp
            ? sessionTimes[sessionID].start
            : timestamp;
        sessionTimes[sessionID].end =
          sessionTimes[sessionID].end > timestamp
            ? sessionTimes[sessionID].end
            : timestamp;
      }
    });

    const sessions: any = Object.values(sessionTimes);
    const totalSessions = sessions.length;
    const timeGaps = [];

    // Calculate time gaps between consecutive sessions
    sessions.sort((a: any, b: any) => a.start - b.start);

    for (let i = 1; i < sessions.length; i++) {
      const gap = (sessions[i].start - sessions[i - 1].end) / 1000;
      timeGaps.push(gap);
    }

    const avgTimeGap =
      timeGaps.length > 0
        ? timeGaps.reduce((a, b) => a + b) / timeGaps.length
        : 0;

    let status = 'Lazy';
    // const gapInDays = (avgTimeGap) => (avgTimeGap / 86400).toFixed(2);
    // console.log(gapInDays(avgTimeGap));

    if (totalSessions > 5 && avgTimeGap < 86400) {
      // More than 5 sessions, < 1 day gap
      status = 'Active';
    } else if (totalSessions < 3 && avgTimeGap < 604800) {
      // 2-5 sessions, < 7 days gap
      status = 'Idle';
    }

    return status;
  }

  async getActivationEventsAdoptionChartData(
    tenantID,
    projectID,
    dateRange,
    total_users,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const key_events = await this.evntOcrncRepository.findAllByCondition({
      tenantID: tenantID,
      projectID: projectID,
      is_key_event: true,
    });

    const events_titles = key_events.map((event) => event.title);

    const query = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          title: { $in: events_titles },
          'user.id': { $ne: null },
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
        },
      },
      {
        $lookup: {
          from: 'events_occurances',
          let: {
            title: '$title',
            tenantID: '$tenantID',
            projectID: '$projectID',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$title', '$$title'] },
                    { $eq: ['$tenantID', '$$tenantID'] },
                    { $eq: ['$projectID', '$$projectID'] },
                  ],
                },
              },
            },
          ],
          as: 'parent_event_details',
        },
      },
      {
        $unwind: '$parent_event_details',
      },
      {
        $addFields: {
          event_pipeline_order: '$parent_event_details.key_event_order',
        },
      },
      {
        $group: {
          _id: { title: '$title', user_id: '$user.id' },
          event_pipeline_order: { $first: '$event_pipeline_order' },
        },
      },
      {
        $group: {
          _id: {
            title: '$_id.title',
            event_pipeline_order: '$event_pipeline_order',
          },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          totalUsers: total_users,
        },
      },
      {
        $project: {
          _id: 0,
          title: '$_id.title',
          count: 1,
          event_pipeline_order: '$_id.event_pipeline_order',
          percentageOfUsers: {
            $cond: {
              if: { $eq: ['$totalUsers', 0] },
              then: 0,
              else: {
                $multiply: [{ $divide: ['$count', '$totalUsers'] }, 100],
              },
            },
          },
        },
      },
      {
        $sort: { event_pipeline_order: 1 },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  async getDistinctSessionsWithEventCounts(
    tenantID: string,
    projectID: string,
    dateRange: any,
    filters: {
      email?: string;
      name?: string;
      id?: string;
      sessionID?: string;
    } = {},
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    // Base $match filter
    const matchFilter: any = {
      tenantID: tenantID,
      projectID: projectID,
      timestamp: { $gte: dates.startDate, $lte: dates.endDate },
      sessionID: { $ne: '' },
    };

    // Add filters for sessionID and user attributes if provided
    if (filters.sessionID) {
      matchFilter['sessionID'] = {
        $ne: '',
        $regex: filters.sessionID,
        $options: 'i',
      };
    }
    if (filters.id) {
      matchFilter['user.id'] = { $regex: filters.id, $options: 'i' };
    }
    if (filters.email) {
      matchFilter['user.email'] = { $regex: filters.email, $options: 'i' };
    }
    if (filters.name) {
      matchFilter['user.full_name'] = { $regex: filters.name, $options: 'i' };
    }

    console.log(matchFilter);

    const query = [
      {
        $match: matchFilter,
      },
      {
        $lookup: {
          from: 'users',
          let: {
            userId: '$user.id',
            tenantId: '$tenantID',
            projectId: '$projectID',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$id', '$$userId'] },
                    { $eq: ['$tenantID', '$$tenantId'] },
                    { $eq: ['$projectID', '$$projectId'] },
                  ],
                },
              },
            },
          ],
          as: 'existingUser',
        },
      },
      {
        $match: {
          existingUser: { $ne: [] },
        },
      },
      {
        $group: {
          _id: {
            sessionID: '$sessionID',
            userID: '$user.id',
          },
          eventCount: { $sum: 1 },
          latestTimestamp: { $max: '$timestamp' },
          user: { $first: '$user' },
        },
      },
      {
        $project: {
          _id: 0,
          sessionID: '$_id.sessionID',
          eventCount: 1,
          latestTimestamp: 1,
          userDetails: {
            name: '$user.full_name',
            email: '$user.email',
            id: '$user.id',
          },
        },
      },
      {
        $sort: {
          latestTimestamp: -1,
        },
      },
    ];

    return await this.evntRepository.aggregate(query);
  }

  async getEventsBySession(
    tenantID: string,
    projectID: string,
    sessionID: string,
  ) {
    return await this.evntRepository.findAllByCondition(
      {
        tenantID: tenantID,
        projectID: projectID,
        sessionID: sessionID,
      },
      ['icon', 'timestamp', 'title', 'eventID', 'description', 'createdAt'],
      0,
      50,
      'timestamp',
      'desc',
    );
  }

  async getEventTypeBreakdown(tenantID, dateRange) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          type: { $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByCountry(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.location.country': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: {
            country: '$requestContext.location.country',
            countryCode: '$requestContext.location.countryCode',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.country',
          countryCode: '$_id.countryCode',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByCity(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.location.city': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: {
            city: '$requestContext.location.city',
            countryCode: '$requestContext.location.countryCode',
            country: '$requestContext.location.country',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.city',
          countryCode: '$_id.countryCode',
          country: '$_id.country',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByRegion(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.location.region': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: {
            region: '$requestContext.location.region',
            countryCode: '$requestContext.location.countryCode',
            country: '$requestContext.location.country',
            city: '$requestContext.location.city',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.region',
          countryCode: '$_id.countryCode',
          country: '$_id.country',
          city: '$_id.city',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByBrowser(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.browser': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.browser',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByUtmSource(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.utm.source': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.utm.source',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByUtmMedium(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.utm.medium': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.utm.medium',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByUtmCampaign(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.utm.campaign': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.utm.campaign',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByUtmTerm(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.utm.term': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.utm.term',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByUtmContent(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.utm.content': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.utm.content',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByTrafficType(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.referrerInfo.type': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.referrerInfo.type',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByHostname(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.referrerInfo.hostname': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.referrerInfo.hostname',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByBrowserVersion(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.browserVersion': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: {
            browser: '$requestContext.browser',
            browserVersion: '$requestContext.browserVersion',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.browserVersion',
          browser: '$_id.browser',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByOS(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.os': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.os',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByOSVersion(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.osVersion': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: {
            os: '$requestContext.os',
            osVersion: '$requestContext.osVersion',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id.osVersion',
          os: '$_id.os',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getPageViewEventsByURL(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          type: 'Page View',
          'context.sdkRuntime': 'browser',
          'requestContext.url': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.url',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);
    return result;
  }

  async getEventsCountByDeviceType(
    tenantID: string,
    projectID: string,
    dateRange: string,
  ) {
    const dates = this.utils.getDateRange(dateRange || 'today', 2);

    const pipeline = [
      {
        $match: {
          tenantID: tenantID,
          projectID: projectID,
          timestamp: { $gte: dates.startDate, $lte: dates.endDate },
          'requestContext.deviceType': {
            $exists: true,
            $nin: [null, ''],
          },
        },
      },
      {
        $group: {
          _id: '$requestContext.deviceType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count',
        },
      },
    ];

    const result = await this.evntRepository.aggregate(pipeline);

    return result;
  }
}
