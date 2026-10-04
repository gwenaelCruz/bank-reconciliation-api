import MovementsValidator from "#app/movements/validators/movements.validator.js";

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
});
