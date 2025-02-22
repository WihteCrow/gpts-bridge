import { Module } from '@nestjs/common';
import { AuthorProcessor } from './author.processor';
import { ChatOpenaiModule } from '../chat-openai/chat-openai.module';
import { CategoryProcessor } from './category.processor';
import { GizmosModule } from '../gizmos/gizmos.module';
import { AuthorModule } from '../author/author.module';
import { GizmoSearchModule } from '../gizmo-search/gizmo-search.module';
import { GizmoMetricsModule } from '../gizmo-metrics/gizmo-metrics.module';
import { GizmoSearchProcessor } from './gizmo-search.processor';
import { BullProcessorController } from './bull-processor.controller';
import { BullListener } from './bull.listener';

@Module({
  imports: [
    ChatOpenaiModule,
    GizmosModule,
    AuthorModule,
    GizmoSearchModule,
    GizmoMetricsModule,
  ],
  providers: [
    AuthorProcessor,
    CategoryProcessor,
    GizmoSearchProcessor,
    BullListener,
  ],
  controllers: [BullProcessorController],
})
export class BullProcessorModule {}
