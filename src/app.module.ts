import { Module } from '@nestjs/common';
import { MovementsModule } from "#app/movements/movements.module.js";

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    MovementsModule,
  ],
})
export class AppModule {}
