import {Test, TestingModule} from "@nestjs/testing";
import {MovementsController} from "#app/movements/movements.controller.js";
import { MovementsService } from "#app/movements/movements.service.js";
import {Mocked} from "vitest";
import ValidationIssueEnum from "#app/movements/enums/validation-issue.enum.js";
import {FailedValidationException} from "#app/movements/exceptions/failed-validation.exception.js";

describe('Movements controller', () => {
  let movementsController: MovementsController;
  let movementsService: Mocked<MovementsService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MovementsController],
      providers: [
        { provide: MovementsService, useValue: { validate: vi.fn() }}
      ],
    }).compile();

    movementsController = app.get<MovementsController>(MovementsController);
    movementsService = app.get<Mocked<MovementsService>>(MovementsService);
  });

  describe('Validate', () => {
    it('Return accepted message when movements and balances are valid', () => {
      // given
      const movements = [
        {
          id: 1,
          amount: 10.3,
          wording: '1-20-09-2026',
          date: new Date(2026, 8, 20),
        },
      ];
      const balances = [
        { balance: 0, date: new Date(2026, 8, 19) }
      ];
      movementsService.validate.mockReturnValue(
        {
          validated: true,
          reasons: [],
        },
      );
      // when
      const response = movementsController.validation({movements, balances})

      //
      expect(movementsService.validate).toHaveBeenCalledWith(movements, balances);
      expect(response)
        .toEqual(
          {
            message: 'Accepted',
          },
        );
    });
    it('Return validation failed message with reasons when movements and balances are invalid', () => {
      // given
      const movements = [
        {
          id: 1,
          amount: 10.3,
          wording: '1-20-09-2026',
          date: new Date(2026, 8, 20),
        },
      ];
      const balances = [
        { balance: 0, date: new Date(2026, 8, 19) }
      ];
      const validationResponse = {
        validated: false,
        reasons: [
          { type: ValidationIssueEnum.DUPLICATE_MOVEMENTS, message: 'Test message'},
          { type: ValidationIssueEnum.BALANCE_DISCREPANCY, message: 'Test balance issue'},
        ],
      };
      movementsService.validate.mockReturnValue(validationResponse);

      // then
      expect(() => movementsController.validation({movements, balances}))
        .toThrow(
          new FailedValidationException('Validation failed', validationResponse.reasons),
        );
    });
  });
});
