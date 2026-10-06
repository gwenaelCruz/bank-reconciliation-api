import { Module } from '@nestjs/common';
import { MovementsService } from "#app/movements/movements.service.js";
import { MovementsValidator } from "#app/movements/validators/movements.validator.js";
import {MovementsController} from "#app/movements/movements.controller.js";

@Module({
  controllers: [MovementsController],
  providers: [MovementsService, MovementsValidator],
  exports: [MovementsService],
})
export class MovementsModule {}
