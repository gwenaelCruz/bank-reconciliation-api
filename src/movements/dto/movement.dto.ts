import {IsDate, IsInt, IsNumber, IsString} from "class-validator";
import {Type} from "class-transformer";

export class MovementDto {
  @IsInt()
  id: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsString()
  wording: string;

  @IsDate()
  @Type(() => Date)
  date: Date;
}
