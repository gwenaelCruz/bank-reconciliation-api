import toCentHelper from '#app/movements/helpers/to-cent.helper.js';
import { ValidationIssueType } from "#app/movements/types/validation-issue.type.js";
import ValidationIssueEnum from "#app/movements/enums/validation-issue.enum.js";
import {Injectable} from "@nestjs/common";
import {MovementDto} from "#app/movements/dto/movement.dto.js";
import {BalanceDto} from "#app/movements/dto/balance.dto.js";

@Injectable()
export class MovementsValidator {
  public checkForDuplicates(movements: { id: number }[]): ValidationIssueType|null {
    const occurrences: { [key: string]: number } = {};
    movements.forEach(({ id }) => {
      occurrences[id] = occurrences[id] ? ++occurrences[id] : 1;
    });

    const duplicates = Object.keys(occurrences).filter(
      (id) => occurrences[id] > 1,
    );

    if (duplicates.length > 0) {
      return this.getValidationIssue(
        ValidationIssueEnum.DUPLICATE_MOVEMENTS,
        { ids: duplicates },
      );
    }
    return null;
  }

  public checkForBalanceDiscrepancy(
    movements: MovementDto[],
    balances: BalanceDto[],
  ): ValidationIssueType[] {
    const validationIssues: ValidationIssueType[] = [];
    const sortedMovements = movements.toSorted((first, second) => first.date.getTime() - second.date.getTime());
    const sortedBalances = balances.toSorted((first, second) => first.date.getTime() - second.date.getTime());

    sortedBalances
      .forEach((balance: BalanceDto, index: number) => {
        if (index === 0) {
          return;
        }
        const periodStart = sortedBalances[index - 1].date;
        const balanceStart = sortedBalances[index - 1].balance;
        const total = sortedMovements
          .filter((movement: MovementDto) => movement.date <= balance.date && movement.date > periodStart)
          .reduce(
            (previousValue, movement) =>
              previousValue + toCentHelper(movement.amount), // Convert values to cents to avoid float calculation issues
            toCentHelper(balanceStart)
          );

        const balanceAmount = balance.balance;

        if (toCentHelper(balanceAmount) !== total) {
          validationIssues.push(
            this.getValidationIssue(
              ValidationIssueEnum.BALANCE_DISCREPANCY,
              {
                expectedBalance: balanceAmount,
                actualBalance: total / 100,
                periodStart,
                periodEnd: balance.date,
              }
            ),
          );
        }
      });
    const lastPeriodEnd = sortedBalances[balances.length - 1]?.date;
    const uncheckedMovements = sortedMovements.filter((movement: MovementDto) =>
      lastPeriodEnd ? movement.date > lastPeriodEnd || movement.date <= sortedBalances[0].date : true,
    );
    if (uncheckedMovements.length > 0) {
      validationIssues.push(
        this.getValidationIssue(
          ValidationIssueEnum.UNCHECKED_MOVEMENTS,
          {
            ids: uncheckedMovements.map((movement: MovementDto) =>
              movement.id.toString(),
            )
          }
        ),
      );
    }

    return validationIssues;
  }

  private getValidationIssue(
    type: ValidationIssueEnum,
    params: {
     ids?: string[],
     expectedBalance?: number,
     actualBalance?: number,
     periodStart?: Date,
     periodEnd?: Date
    }): ValidationIssueType {
    switch (type) {
      case ValidationIssueEnum.DUPLICATE_MOVEMENTS:
        return {
          type: ValidationIssueEnum.DUPLICATE_MOVEMENTS,
          message: 'Duplicate ids: ' + params.ids?.join(', '),
        }
      case ValidationIssueEnum.BALANCE_DISCREPANCY:
        return {
          type: ValidationIssueEnum.BALANCE_DISCREPANCY,
          message: `Balance discrepancy. Expected: ${params.expectedBalance} Actual: ${params.actualBalance}.`
            + ` Period start: ${params.periodStart?.toLocaleDateString(['fr-FR'])}, period end: ${params.periodEnd?.toLocaleDateString(['fr-FR'])}`
        }
      case ValidationIssueEnum.UNCHECKED_MOVEMENTS:
      default:
        return {
          type: ValidationIssueEnum.UNCHECKED_MOVEMENTS,
          message: 'Unchecked movements: ' + params.ids?.join(', ')
        }
    }
  }
}
