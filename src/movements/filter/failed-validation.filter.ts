import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from "@nestjs/common";
import {FailedValidationException} from "#app/movements/exceptions/failed-validation.exception.js";
import { Response } from 'express';

@Catch(FailedValidationException)
export class FailedValidationFilter implements ExceptionFilter {
  catch(exception: FailedValidationException, host: ArgumentsHost): any {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    response
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({
        message: exception.message,
        reasons: exception.reasons,
      });
  }
}
