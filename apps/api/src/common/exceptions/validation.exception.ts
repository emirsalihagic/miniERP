import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: string[]) {
    super(
      {
        message: 'Validation failed',
        errors: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
