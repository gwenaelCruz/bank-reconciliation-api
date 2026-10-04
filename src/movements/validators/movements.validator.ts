class MovementsValidator {
  public checkForDuplicates(movements: { id: number }[]): {type: string, message: string}|null {
    const occurrences: { [key: string]: number } = {};
    movements.forEach(({ id }) => {
      occurrences[id] = occurrences[id] ? ++occurrences[id] : 1;
    });

    const duplicates = Object.keys(occurrences).filter(
      (id) => occurrences[id] > 1,
    );

    if (duplicates.length > 0) {
      return { type: 'DUPLICATE_MOVEMENTS', message: 'Duplicate ids: ' + duplicates.join(', ')};
    }
    return null;
  }
}

export default MovementsValidator;
