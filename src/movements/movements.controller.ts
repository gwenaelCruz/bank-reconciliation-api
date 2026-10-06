import { MovementsService } from "#app/movements/movements.service.js";
import {Body, Controller, HttpCode, Inject, Post, UseFilters} from "@nestjs/common";
import {FailedValidationFilter} from "#app/movements/filter/failed-validation.filter.js";
import {FailedValidationException} from "#app/movements/exceptions/failed-validation.exception.js";
import {ValidateMovementsDto} from "#app/movements/dto/validate-movements.dto.js";
import {ApiBadRequestResponse, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse} from "@nestjs/swagger";
import {AcceptedResponseDto} from "#app/movements/dto/accepted-response.dto.js";
import {RequestValidationErrorDto} from "#app/movements/dto/request-validation-error.dto.js";
import {FailedValidationResponseDto} from "#app/movements/dto/failed-validation-response.dto.js";

@ApiTags('movements')
@Controller('movements')
export class MovementsController {
  constructor(@Inject() private movementsService: MovementsService) {}

  @Post('validation')
  @HttpCode(200)
  @ApiOkResponse({ type: AcceptedResponseDto })
  @ApiBadRequestResponse({ type: RequestValidationErrorDto })
  @ApiUnprocessableEntityResponse({ type: FailedValidationResponseDto })
  @UseFilters(new FailedValidationFilter())
  public validation(@Body() {movements, balances}: ValidateMovementsDto): AcceptedResponseDto {
    const { validated, reasons } = this.movementsService.validate(movements, balances);
    if (!validated) {
      throw new FailedValidationException('Validation failed', reasons);
    }

    return { message: 'Accepted' };
  }
}
