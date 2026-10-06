import { MovementsService } from '#app/movements/movements.service.js';
import { MovementsValidator } from '#app/movements/validators/movements.validator.js';
import ValidationIssueEnum from "#app/movements/enums/validation-issue.enum.js";
import { ValidationIssueType } from "#app/movements/types/validation-issue.type.js";
import {Test, TestingModule} from "@nestjs/testing";
import {Mocked} from "vitest";

describe('Movement service', () => {
  let movementsValidator: Mocked<MovementsValidator>;
  let movementsService: MovementsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        {
          provide: MovementsValidator,
          useValue: { checkForDuplicates: vi.fn(), checkForBalanceDiscrepancy: vi.fn() },
        }
      ],
    }).compile();

    movementsService = app.get<MovementsService>(MovementsService);
    movementsValidator = app.get<Mocked<MovementsValidator>>(MovementsValidator);
  });

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
      movementsValidator.checkForDuplicates.mockReturnValue(null);
      movementsValidator.checkForBalanceDiscrepancy.mockReturnValue([]);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(movementsValidator.checkForDuplicates).toHaveBeenCalledWith(movements);
      expect(movementsValidator.checkForBalanceDiscrepancy).toHaveBeenCalledWith(movements, balances);
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
      movementsValidator.checkForDuplicates.mockReturnValue(validationIssue);
      movementsValidator.checkForBalanceDiscrepancy.mockReturnValue([]);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(movementsValidator.checkForDuplicates).toHaveBeenCalledWith(movements);
      expect(movementsValidator.checkForBalanceDiscrepancy).toHaveBeenCalledWith(movements, balances);
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
      movementsValidator.checkForDuplicates.mockReturnValue(null);
      movementsValidator.checkForBalanceDiscrepancy.mockReturnValue(validationIssues);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(movementsValidator.checkForBalanceDiscrepancy).toHaveBeenCalledWith(movements, balances);
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
      movementsValidator.checkForDuplicates.mockReturnValue(validationIssues[0]);
      movementsValidator.checkForBalanceDiscrepancy.mockReturnValue([validationIssues[1]]);

      // when
      const { validated, reasons } = movementsService.validate(movements, balances);

      // then
      expect(movementsValidator.checkForDuplicates).toHaveBeenCalledWith(movements);
      expect(movementsValidator.checkForBalanceDiscrepancy).toHaveBeenCalledWith(movements, balances);
      expect(validated).toBe(false);
      expect(reasons).toEqual<ValidationIssueType[]>(validationIssues);
    });
  });
});
