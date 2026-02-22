import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import * as Sentry from '@sentry/node';

@Injectable()
export class Repository<T> {
  modelName = '';

  constructor(private readonly model: Model<T>) {
    this.modelName = model.modelName;
  }

  async findAll(skip: number = 0, take: number = 10): Promise<T[]> {
    try {
      return await this.model.find().skip(skip).limit(take).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: findAll] Not able to retrieve data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: findById] Not able to retrieve data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllByCondition(
    condition: any,
    selectedFields: string[] = [],
    skip: number = 0,
    take: number = 0,
    sortBy: string = '',
    sortAs: string = '',
  ): Promise<T[]> {
    try {
      let query = this.model.find(condition);

      if (selectedFields && selectedFields.length > 0) {
        // query.select(selectedFields.join(' '));
        const projection = selectedFields.join(' ');
        query.select(`${projection} -_id`);
      }

      if (sortBy != '' && sortAs != '') {
        const sortDirection = sortAs.toLowerCase() === 'desc' ? -1 : 1;
        query.sort({ [sortBy]: sortDirection });
      }

      if (skip > 0) {
        query = query.skip(skip);
      }

      if (take > 0) {
        query = query.limit(take);
      }

      return await query.exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: findAllByCondition] Not able to retrieve data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOneByCondition(
    condition: any,
    selectedFields: string[] = [],
    sortAttributes: { sortField: string; sortOrder: any } = {
      sortField: null,
      sortOrder: -1,
    },
  ): Promise<T> {
    try {
      const query = this.model.findOne(condition);

      if (selectedFields && selectedFields.length > 0) {
        query.select(selectedFields.join(' '));
      }

      if (sortAttributes.sortField) {
        query.sort({ [sortAttributes.sortField]: sortAttributes.sortOrder });
      }

      return await query.exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: findOneByCondition] Not able to retrieve data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(entity: T) {
    try {
      const created_item = new this.model(entity);
      return await created_item.save();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: create] Not able to create data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, entity: T): Promise<T | null> {
    try {
      return this.model.findByIdAndUpdate(id, entity, { new: true }).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: update] Not able to update data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateOneByCondition(query: any, entity: any): Promise<T | null> {
    try {
      return this.model.findOneAndUpdate(query, entity, { new: true }).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: update] Not able to update data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async patch(id: string, patch_quey: any): Promise<T | null> {
    try {
      return this.model.findByIdAndUpdate(id, patch_quey, { new: true }).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: patch] Not able to patch update data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async patch_many(
    filter_query: any,
    update_quey: any,
  ): Promise<boolean | null> {
    try {
      const results = await this.model
        .updateMany(filter_query, update_quey, { multi: true })
        .exec();
      return results ? true : false;
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: patch_many] Not able to patch many updates data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteByCondition(condition: any): Promise<any | null> {
    try {
      return await this.model.findOneAndDelete(condition).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: deleteByCondition] Not able to delete data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteManyByCondition(condition: any): Promise<any | null> {
    try {
      return await this.model.deleteMany(condition).exec();
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: deleteByCondition] Not able to delete data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async aggregate(pipeline: any[]) {
    try {
      const result = this.model.aggregate(pipeline);
      return await result;
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: aggregate] Not able to aggregate data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async count(query: any) {
    try {
      const result = this.model.countDocuments(query);
      return await result;
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(
        `[Repo:=>: ${this.modelName} - Method:=>: count] Not able to get counts of data.`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
