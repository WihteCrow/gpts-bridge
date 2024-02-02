import { GizmoMetricsService } from './gizmo-metrics.service';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GizmosService } from '../gizmos/gizmos.service';
import dayjs from 'dayjs';
import { YYYYMMDD } from '../utils/date';
import { ChatOpenaiService } from '../chat-openai/chat-openai.service';
import { isDev } from '../utils/env';

@Injectable()
export class GizmoMetricsJob {
  constructor(
    private readonly gizmoMetricsService: GizmoMetricsService,
    private readonly gizmosService: GizmosService,
    private readonly chatOpenaiService: ChatOpenaiService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.repair().then();
  }

  /**
   * 补漏逻辑
   */
  @Cron(CronExpression.EVERY_HOUR)
  async repair() {
    if (isDev()) {
      return;
    }

    let pageNo = 1,
      total = 0,
      hadTotal = 0;

    const pageSize = 100;
    const date = dayjs().subtract(1, 'days').format(YYYYMMDD);

    do {
      const page = await this.gizmosService.page({
        pageNo,
        pageSize,
      });

      if (page.data.length === 0) {
        break;
      }

      for (let i = 0; i < page.data.length; i++) {
        const temp = page.data[i];
        const metrics = await this.gizmoMetricsService.findOne(temp.id, date);

        if (metrics) {
          continue;
        }

        const gpt = await this.chatOpenaiService.getGizmosByShorUrl(
          temp.short_url,
        );
        await this.gizmosService.setConversations(
          gpt.gizmo.id,
          BigInt(gpt.gizmo.vanity_metrics.num_conversations_str),
        );
        await this.gizmoMetricsService.createByGpt(gpt, date);
      }

      hadTotal += page.data.length;
      total = page.meta.total;

      this.logger.info(
        '检测gpts是否今日更新，总共%s个，已检查%s个，当前第%s页',
        total,
        hadTotal,
        pageNo,
      );

      pageNo++;
    } while (hadTotal < total);
  }
}
