import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        errorCode: 'VALIDATION_ERROR',
        details,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BusinessLogicException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        errorCode: 'BUSINESS_LOGIC_ERROR',
        details,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    
    super(
      {
        message,
        errorCode: 'RESOURCE_NOT_FOUND',
        details: { resource, id },
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string, value: string) {
    super(
      {
        message: `${resource} with ${field} '${value}' already exists`,
        errorCode: 'DUPLICATE_RESOURCE',
        details: { resource, field, value },
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized access') {
    super(
      {
        message,
        errorCode: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden access') {
    super(
      {
        message,
        errorCode: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}