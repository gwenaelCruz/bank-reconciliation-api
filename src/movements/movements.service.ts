import MovementType from '#app/movements/types/movement.type.js';
import BalanceType from '#app/movements/types/balance.type.js';
import MovementsValidator from '#app/movements/validators/movements.validator.js';
import ValidationIssueType from "#app/movements/types/validation-issue.type.js";

class MovementsService {
  constructor(private validator: MovementsValidator) {}

  public validate(
    movements: MovementType[],
    balances: BalanceType[],
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

export default MovementsService;
