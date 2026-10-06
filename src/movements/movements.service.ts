import { MovementsValidator } from '#app/movements/validators/movements.validator.js';
import { ValidationIssueType } from "#app/movements/types/validation-issue.type.js";
import {Injectable} from "@nestjs/common";
import {MovementDto} from "#app/movements/dto/movement.dto.js";
import {BalanceDto} from "#app/movements/dto/balance.dto.js";

@Injectable()
export class MovementsService {
  constructor(private validator: MovementsValidator) {}

  public validate(
    movements: MovementDto[],
    balances: BalanceDto[],
  ): { validated: boolean; reasons: ValidationIssueType[] } {
    const reasons: ValidationIssueType[] = [];
    const duplicateError = this.validator.checkForDuplicates(movements);
    if (duplicateError) {
      reasons.push (duplicateError);
    }
    reasons.push(...this.validator.checkForBalanceDiscrepancy(movements, balances));

    return { validated: reasons.length === 0, reasons };
  }
}
