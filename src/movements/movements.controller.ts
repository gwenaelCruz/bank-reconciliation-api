import { MovementsService } from "#app/movements/movements.service.js";
import {Body, Controller, HttpCode, Inject, Post, UseFilters} from "@nestjs/common";
import {FailedValidationFilter} from "#app/movements/filter/failed-validation.filter.js";
import {FailedValidationException} from "#app/movements/exceptions/failed-validation.exception.js";
import {ValidateMovementsDto} from "#app/movements/dto/validate-movements.dto.js";

@Controller('movements')
export class MovementsController {
  constructor(@Inject() private movementsService: MovementsService) {}

  @Post('validation')
  @HttpCode(200)
  @UseFilters(new FailedValidationFilter())
  public validation(@Body() {movements, balances}: ValidateMovementsDto): AcceptedResponseDto {
    const { validated, reasons } = this.movementsService.validate(movements, balances);
    if (!validated) {
      throw new FailedValidationException('Validation failed', reasons);
    }

    return { message: 'Accepted' };
  }
}
