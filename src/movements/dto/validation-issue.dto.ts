import ValidationIssue from "#app/movements/enums/validation-issue.enum.js";
import {ApiProperty} from "@nestjs/swagger";

export class ValidationIssueDto {
  @ApiProperty({ enum: ValidationIssue, enumName: 'ValidationIssue' })
  type: ValidationIssue;
  message: string;
}
