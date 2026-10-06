import { MovementsValidator } from "#app/movements/validators/movements.validator.js";
import randomIntHelper from "../helpers/random-int.helper.js";
import toCentHelper from "#app/movements/helpers/to-cent.helper.js";
import ValidationIssueEnum from "#app/movements/enums/validation-issue.enum.js";
import { MovementDto } from "#app/movements/dto/movement.dto.js";
import { BalanceDto } from "#app/movements/dto/balance.dto.js";

describe('Movements validator', () => {
  const movementsValidator = new MovementsValidator();

  describe('Check for duplicates', () => {
    const validDataset = [
      {
        name: 'No duplicated ids',
        movements: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
          {
            id: 4,
          },
        ],
      },
      {
        name: 'Empty movements',
        movements: [],
      },
    ];
    it.each(validDataset)(
      'Should not return issue for : $name',
      ({movements}) => {
        // when
        const validationIssue = movementsValidator.checkForDuplicates(movements);

        // then
        expect(validationIssue).toBeNull();
      }
    );

    it('Should return issue for non unique movements ids', () => {
      // given
      const movements = [
        {
          id: 1,
        },
        {
          id: 1,
        },
        {
          id: 2,
        },
        {
          id: 3,
        },
        {
          id: 3,
        },
        {
          id: 3,
        },
      ];
      // when
      const validationIssue = movementsValidator.checkForDuplicates(movements);

      // then
      expect(validationIssue).toEqual(
        { type: 'DUPLICATE_MOVEMENTS', message: 'Duplicate ids: 1, 3'}
      );
    });
  });

  describe('Check movements and balance values', () => {
    const validMovementsAndBalance = [
      {
        name: 'Empty movements and balances',
        movements: [],
        balances: [],
      },
      {
        name: 'Valid ordered list',
        movements: [
          {
            id: 1,
            amount: 10.3,
            wording: '1-20-09-2026',
            date: new Date(2026, 8, 20),
          },
          {
            id: 2,
            amount: 5.1,
            wording: '2-24-09-2026',
            date: new Date(2026, 8, 24),
          },

          {
            id: 3,
            amount: -3,
            wording: '3-26-09-2026',
            date: new Date(2026, 8, 26),
          },
          {
            id: 4,
            amount: 11.7,
            wording: '4-30-09-2026',
            date: new Date(2026, 8, 30),
          },
        ],
        balances: [
          { balance: 0, date: new Date(2026, 8, 19) },
          { balance: 15.4, date: new Date(2026, 8, 25) },
          { balance: 24.1, date: new Date(2026, 9, 1) },
        ],
      },
      {
        name: 'Valid with non zero starting balance',
        movements: [
          {
            id: 1,
            amount: -5.6,
            wording: '1-20-09-2026',
            date: new Date(2026, 8, 20),
          },
          {
            id: 2,
            amount: 15.1,
            wording: '2-24-09-2026',
            date: new Date(2026, 8, 24),
          },
          {
            id: 3,
            amount: -3,
            wording: '3-26-09-2026',
            date: new Date(2026, 8, 26),
          },
          {
            id: 4,
            amount: -2.7,
            wording: '4-30-09-2026',
            date: new Date(2026, 8, 30),
          },
        ],
        balances: [
          { balance: 20, date: new Date(2026, 8, 19) },
          { balance: 29.5, date: new Date(2026, 8, 25) },
          { balance: 23.8, date: new Date(2026, 9, 1) },
        ],
      },
      {
        name: 'Valid unordered list',
        movements: [
          {
            id: 4,
            amount: 11.7,
            wording: '4-30-09-2026',
            date: new Date(2026, 8, 30),
          },
          {
            id: 2,
            amount: 5.1,
            wording: '2-24-09-2026',
            date: new Date(2026, 8, 24),
          },
          {
            id: 1,
            amount: 10.3,
            wording: '1-20-09-2026',
            date: new Date(2026, 8, 20),
          },
          {
            id: 3,
            amount: -3,
            wording: '3-26-09-2026',
            date: new Date(2026, 8, 26),
          },
        ],
        balances: [
          { balance: 24.1, date: new Date(2026, 9, 1) },
          { balance: 15.4, date: new Date(2026, 8, 25) },
          { balance: 0, date: new Date(2026, 8, 19) },
        ],
      },
      {
        name: 'Movements on balance dates',
        movements: [
          {
            id: 1,
            amount: 10,
            wording: '1-25-09-2026',
            date: new Date(2026, 8, 25),
          },
          {
            id: 2,
            amount: 5,
            wording: '2-01-10-2026',
            date: new Date(2026, 9, 1),
          },
        ],
        balances: [
          { balance: 0, date: new Date(2026, 8, 19) },
          { balance: 10, date: new Date(2026, 8, 25) },
          { balance: 15, date: new Date(2026, 9, 1) },
        ],
      },
      {
        name: 'With only zero balance',
        movements: [],
        balances: [{ balance: 0, date: new Date(2026, 8, 25) }],
      },
      {
        name: 'With only starting balance',
        movements: [],
        balances: [{ balance: 5.2, date: new Date(2026, 8, 25) }],
      },
    ];

    it.each(validMovementsAndBalance)(
      'Should not return issue for: $name',
      ({movements, balances}) => {
        // when
        const validationIssues = movementsValidator.checkForBalanceDiscrepancy(movements, balances);

        // then
        expect(validationIssues.length).toEqual<number>(0);
      },
    );
    it('Should pass validation with random values', () => {
      const movements: MovementDto[] = [];
      const referenceDate = new Date();
      // Create random positive or negative amount in cents
      const getRandomAmount = () => parseFloat(
        ((Math.random() < 0.5 ? 1 : -1) * randomIntHelper(5) * Math.random() * 10)
          .toFixed(2)
      );
      const balances: BalanceDto[] = [
        {
          balance: getRandomAmount(),
          date: new Date(),
        }
      ];
      let maxMovementId = 0;

      Array(randomIntHelper(5) + 1)
        .fill(0)
        .forEach((_, balanceIndex) => {
          let balanceToCent = toCentHelper(balances[balanceIndex].balance);

          Array(randomIntHelper(5) + 1)
            .fill(0)
            .forEach((_, movementIndex) => {
              const amountToCents = toCentHelper(getRandomAmount());
              referenceDate.setDate(
                referenceDate.getDate() + randomIntHelper(3) + (movementIndex === 0 ? 1 : 0),
              );
              maxMovementId++;

              movements.push({
                id: maxMovementId,
                amount: amountToCents / 100,
                wording: 'test-' + maxMovementId,
                date: new Date(referenceDate.getTime()),
              });
              balanceToCent += amountToCents;
            });
          referenceDate.setDate(
            referenceDate.getDate() + randomIntHelper(3) + 1,
          ); // Move at least one day to avoid multiple balance on the same day
          balances.push({ balance: balanceToCent / 100, date: new Date(referenceDate.getTime()) });
        });

      // when
      const validationIssues = movementsValidator.checkForBalanceDiscrepancy(
        movements,
        balances,
      );

      // then
      expect(validationIssues.length).toEqual<number>(0);
    });

    const invalidMovementsAndBalances = [
      {
        name: 'balance does not match movements amount',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: -4.8,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 8,
            wording: '3-30-09-2026',
            date: new Date(2026, 8, 30),
          },
        ],
        balances: [
          { balance: 0, date: new Date(2026, 8, 12) },
          { balance: 20.2, date: new Date(2026, 9, 1) },
        ],
        expectedIssues: [
          {
            type: ValidationIssueEnum.BALANCE_DISCREPANCY,
            message: 'Balance discrepancy. Expected: 20.2 Actual: 18.2. Period start: 12/09/2026, period end: 01/10/2026',
          },
        ],
      },
      {
        name: 'balance does not match movements amount with unordered list',
        movements: [
          {
            id: 2,
            amount: -4.8,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 8,
            wording: '3-30-09-2026',
            date: new Date(2026, 8, 30),
          },
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
        ],
        balances: [
          { balance: 20.2, date: new Date(2026, 9, 1) },
          { balance: 10.2, date: new Date(2026, 8, 25) },
          { balance: 0, date: new Date(2026, 8, 12) },
        ],
        expectedIssues: [
          {
            type: ValidationIssueEnum.BALANCE_DISCREPANCY,
            message: 'Balance discrepancy. Expected: 20.2 Actual: 18.2. Period start: 25/09/2026, period end: 01/10/2026'
          },
        ],
      },
      {
        name: 'balances do not match movements amount',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: -4.8,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 8,
            wording: '3-30-09-2026',
            date: new Date(2026, 8, 30),
          },
        ],
        balances: [
          { balance: 0, date: new Date(2026, 8, 12) },
          { balance: 10.3, date: new Date(2026, 8, 25) },
          { balance: 20.2, date: new Date(2026, 9, 1) },
        ],
        expectedIssues: [
          {
            type: ValidationIssueEnum.BALANCE_DISCREPANCY,
            message: 'Balance discrepancy. Expected: 10.3 Actual: 10.2. Period start: 12/09/2026, period end: 25/09/2026'
          },
          {
            type: ValidationIssueEnum.BALANCE_DISCREPANCY,
            message: 'Balance discrepancy. Expected: 20.2 Actual: 18.3. Period start: 25/09/2026, period end: 01/10/2026'
          }
        ],
      },
      {
        name: 'movement is unchecked after last balance',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: -4.8,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 8,
            wording: '3-30-09-2026',
            date: new Date(2026, 8, 30),
          },
        ],
        balances: [
          { balance: 0, date: new Date(2026, 8, 12) },
          { balance: 10.2, date: new Date(2026, 8, 25) }
        ],
        expectedIssues: [
          { type: ValidationIssueEnum.UNCHECKED_MOVEMENTS, message: 'Unchecked movements: 3'},
        ],
      },
      {
        name: 'movement is unchecked before first balance',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: -4.8,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 8,
            wording: '3-30-09-2026',
            date: new Date(2026, 8, 30),
          },
        ],
        balances: [
          { balance: 10.2, date: new Date(2026, 8, 25) },
          { balance: 18.2, date: new Date(2026, 10, 1) },
        ],
        expectedIssues: [
          { type: ValidationIssueEnum.UNCHECKED_MOVEMENTS, message: 'Unchecked movements: 1, 2'},
        ],
      },
      {
        name: 'movement is unchecked on first balance date',
        movements: [
          {
            id: 1,
            amount: 10,
            wording: '1-19-09-2026',
            date: new Date(2026, 8, 19),
          },
          {
            id: 2,
            amount: 5,
            wording: '2-25-09-2026',
            date: new Date(2026, 8, 25),
          },
        ],
        balances: [
          { balance: 10, date: new Date(2026, 8, 19) },
          { balance: 15, date: new Date(2026, 8, 25) },
        ],
        expectedIssues: [
          { type: ValidationIssueEnum.UNCHECKED_MOVEMENTS, message: 'Unchecked movements: 1'},
        ],
      },
      {
        name: 'movement is unchecked with no balance',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: 3.6,
            wording: '2-18-09-2026',
            date: new Date(2026, 8, 18),
          },
        ],
        balances: [],
        expectedIssues: [
          { type: ValidationIssueEnum.UNCHECKED_MOVEMENTS, message: 'Unchecked movements: 1, 2'},
        ],
      },
      {
        name: 'unchecked movements with only one balance',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: -4.6,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 12,
            wording: '3-26-09-2026',
            date: new Date(2026, 8, 26),
          },
        ],
        balances: [
          { balance: 10.2, date: new Date(2026, 8, 25) },
        ],
        expectedIssues: [
          { type: ValidationIssueEnum.UNCHECKED_MOVEMENTS, message: 'Unchecked movements: 1, 2, 3'},
        ],
      },
      {
        name: 'both unchecked movements and balance discrepancy',
        movements: [
          {
            id: 1,
            amount: 15,
            wording: '1-15-09-2026',
            date: new Date(2026, 8, 15),
          },
          {
            id: 2,
            amount: -4.6,
            wording: '2-23-09-2026',
            date: new Date(2026, 8, 23),
          },
          {
            id: 3,
            amount: 12,
            wording: '3-26-09-2026',
            date: new Date(2026, 8, 26),
          },
        ],
        balances: [
          { balance: 10.2, date: new Date(2026, 8, 16) },
          { balance: 6, date: new Date(2026, 8, 25) },
        ],
        expectedIssues: [
          { type: ValidationIssueEnum.BALANCE_DISCREPANCY, message: 'Balance discrepancy. Expected: 6 Actual: 5.6. Period start: 16/09/2026, period end: 25/09/2026'},
          { type: ValidationIssueEnum.UNCHECKED_MOVEMENTS, message: 'Unchecked movements: 1, 3'},
        ],
      },
    ];

    it.each(invalidMovementsAndBalances)(
      'Should fail validation for: $name',
      ({movements, balances, expectedIssues}) => {
        // when
        const validationIssues = movementsValidator.checkForBalanceDiscrepancy(movements, balances);

        // then
        expect(validationIssues).toEqual(expectedIssues);
      },
    );
  });
});
