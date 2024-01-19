import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CategoryService } from './category.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CHAT_GPTS_SYNC } from '../config/QUEUE_NAME';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class CategoryJob {
  constructor(
    private categoryService: CategoryService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  runSyncGpt() {
    this.categoryService.runSyncGpt().catch(this.logger.error);
  }
}
