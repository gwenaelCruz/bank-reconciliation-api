import { ValidationIssueType } from "#app/movements/types/validation-issue.type.js";

export class FailedValidationException extends Error {
  constructor(message: string, public readonly reasons: ValidationIssueType[]) {
    super(message);
  }
}
