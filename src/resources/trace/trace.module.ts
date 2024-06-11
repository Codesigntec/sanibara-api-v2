import { Module } from '@nestjs/common';
import { TraceService } from './trace.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [TraceService]
})
export class TraceModule {}
