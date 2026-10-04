import MovementsService from '#app/movements/movements.service.js';
import MovementsValidator from '#app/movements/validators/movements.validator.js';
import ValidationIssueEnum from "#app/movements/enums/validation-issue.enum.js";
import ValidationIssueType from "#app/movements/types/validation-issue.type.js";

describe('Movement service', () => {

  describe('Movements and balance validation', () => {
    it('Should pass validation when no validation returns no issue', () => {
      // given
      // Values below are only used by validator, any value could work
      const movements = [
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
      ];
      const balances = [
        { balance: 0, date: new Date(2026, 8, 19) },
        { balance: 15.4, date: new Date(2026, 8, 25) },
        { balance: 24.1, date: new Date(2026, 9, 1) },
      ];

      const ValidatorMock = vi.fn(MovementsValidator);
      const mockedValidator = new ValidatorMock();
      ValidatorMock.prototype.checkForDuplicates = vi.fn((_) => null);
      ValidatorMock.prototype.checkForBalanceDiscrepancy = vi.fn((_) => []);

      const movementsService = new MovementsService(mockedValidator);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(ValidatorMock.prototype.checkForDuplicates).toHaveBeenCalledWith(movements);
      expect(validated).toBe(true);
      expect(reasons.length).toEqual<number>(0);
    });
    it('Should fail validation when validation returns duplicate ids issue', () => {
      const movements = [
        {
          id: 1,
          amount: 10.3,
          wording: '1-20-09-2026',
          date: new Date(2026, 8, 20),
        },
        {
          id: 1,
          amount: 5.1,
          wording: '2-24-09-2026',
          date: new Date(2026, 8, 24),
        },
      ];
      const balances = [
        { balance: 0, date: new Date(2026, 8, 19) },
        { balance: 15.4, date: new Date(2026, 8, 25) },
      ];
      const validationIssue =
        { type: ValidationIssueEnum.DUPLICATE_MOVEMENTS, message: 'Test message' }
      ;
      const ValidatorMock = vi.fn(MovementsValidator);
      ValidatorMock.prototype.checkForDuplicates = vi.fn((_) => validationIssue);
      ValidatorMock.prototype.checkForBalanceDiscrepancy = vi.fn((_) => []);

      const mockedValidator = new ValidatorMock();
      const movementsService = new MovementsService(mockedValidator);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(ValidatorMock.prototype.checkForDuplicates).toHaveBeenCalledWith(movements);
      expect(validated).toBe(false);
      expect(reasons).toEqual<ValidationIssueType[]>([validationIssue]);
    });
    it('Should fail validation when validation returns balance discrepancy issue', () => {
      const movements = [
        {
          id: 1,
          amount: 10.3,
          wording: '1-20-09-2026',
          date: new Date(2026, 8, 20),
        },
        {
          id: 1,
          amount: 5.1,
          wording: '2-24-09-2026',
          date: new Date(2026, 8, 24),
        },
      ];
      const balances = [
        { balance: 0, date: new Date(2026, 8, 19) },
        { balance: 15.4, date: new Date(2026, 8, 25) },
      ];
      const validationIssues = [
        { type: ValidationIssueEnum.BALANCE_DISCREPANCY, message: 'Test message' }
      ];
      const ValidatorMock = vi.fn(MovementsValidator);
      ValidatorMock.prototype.checkForDuplicates = vi.fn((_) => null);
      ValidatorMock.prototype.checkForBalanceDiscrepancy = vi.fn((_, __) => validationIssues);
      const mockedValidator = new ValidatorMock();
      const movementsService = new MovementsService(mockedValidator);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(ValidatorMock.prototype.checkForBalanceDiscrepancy).toHaveBeenCalledWith(movements, balances);
      expect(validated).toBe(false);
      expect(reasons).toEqual<ValidationIssueType[]>(validationIssues);
    });
    it('Should fail validation when validation returns both duplicate and balance discrepancy issue', () => {
      const movements = [
        {
          id: 1,
          amount: 10.3,
          wording: '1-20-09-2026',
          date: new Date(2026, 8, 20),
        },
        {
          id: 1,
          amount: 5.1,
          wording: '2-24-09-2026',
          date: new Date(2026, 8, 24),
        },
      ];
      const balances = [
        { balance: 0, date: new Date(2026, 8, 19) },
        { balance: 15.4, date: new Date(2026, 8, 25) },
      ];
      const validationIssues = [
        { type: ValidationIssueEnum.DUPLICATE_MOVEMENTS, message: 'Test message' },
        { type: ValidationIssueEnum.BALANCE_DISCREPANCY, message: 'Test message' }
      ];
      const ValidatorMock = vi.fn(MovementsValidator);
      ValidatorMock.prototype.checkForDuplicates = vi.fn((_) => validationIssues[0]);
      ValidatorMock.prototype.checkForBalanceDiscrepancy = vi.fn((_, __) => [validationIssues[1]]);
      const mockedValidator = new ValidatorMock();
      const movementsService = new MovementsService(mockedValidator);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(ValidatorMock.prototype.checkForDuplicates).toHaveBeenCalledWith(movements);
      expect(ValidatorMock.prototype.checkForBalanceDiscrepancy).toHaveBeenCalledWith(movements, balances);
      expect(validated).toBe(false);
      expect(reasons).toEqual<ValidationIssueType[]>(validationIssues);
    });
  });
});
