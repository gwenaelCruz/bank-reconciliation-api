import {IsDate, IsNumber} from "class-validator";
import {Type} from "class-transformer";

export class BalanceDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  balance: number;

  @IsDate()
  @Type(() => Date)
  date: Date;
}
