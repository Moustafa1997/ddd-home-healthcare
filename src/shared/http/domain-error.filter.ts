import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../domain/domain.error';

/** Maps a business-rule violation to HTTP. The domain itself knows nothing about HTTP. */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(err: DomainError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = /not found/i.test(err.message) ? HttpStatus.NOT_FOUND : HttpStatus.UNPROCESSABLE_ENTITY;
    res.status(status).json({ error: err.name, message: err.message });
  }
}
