import {ValidationIssueDto} from "#app/movements/dto/validation-issue.dto.js";

export class FailedValidationResponseDto {
  message: 'Validation failed';
  reasons: ValidationIssueDto[];
}
