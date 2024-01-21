import { Process, Processor } from '@nestjs/bull';
import { CHAT_GPTS_SYNC } from '../config/QUEUE_NAME';
import { Job } from 'bull';
import { ChatOpenaiService } from '../chat-openai/chat-openai.service';
import { GizmosService } from '../gizmos/gizmos.service';
import { GizmoMetricsService } from '../gizmo-metrics/gizmo-metrics.service';
import { GizmoSearchService } from '../gizmo-search/gizmo-search.service';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Processor(CHAT_GPTS_SYNC.name)
export class AuthorProcessor {
  constructor(
    private chatOpenaiService: ChatOpenaiService,
    private gizmosService: GizmosService,
    private gizmoMetricsService: GizmoMetricsService,
    private gizmoSearchService: GizmoSearchService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Process(CHAT_GPTS_SYNC.jobs.userId)
  async handleCategory(job: Job) {
    const { userId } = job.data;

    this.logger.info('【用户维度同步】开始同步%s', userId);
    const { items } = await this.chatOpenaiService.getGizmosByUser(userId);
    this.logger.info(
      '【用户维度同步】 userId: %s 同步到 %s 个 gpt',
      userId,
      items.length,
    );
    for (let i = 0; i < items.length; i++) {
      const gpt = items[i];
      // 更新作者，无需更新
      // await this.upsertByGpt(gpt);
      // 更新gpt信息
      await this.gizmosService.upsertByGpt(gpt);
      // 更新数据
      await this.gizmoMetricsService.createByGpt(gpt);

      // 创建搜索任务
      await this.gizmoSearchService.createQueueTask(gpt.gizmo.display.name);
    }

    return true;
  }
}
