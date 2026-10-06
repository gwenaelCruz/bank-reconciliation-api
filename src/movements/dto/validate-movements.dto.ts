import {IsArray, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {MovementDto} from "#app/movements/dto/movement.dto.js";
import {BalanceDto} from "#app/movements/dto/balance.dto.js";

export class ValidateMovementsDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => MovementDto)
  movements: MovementDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => BalanceDto)
  balances: BalanceDto[];
}
