import {ValidationIssueDto} from "#app/movements/dto/validation-issue.dto.js";

export class FailedValidationException extends Error {
  constructor(message: string, public readonly reasons: ValidationIssueDto[]) {
    super(message);
  }
}
