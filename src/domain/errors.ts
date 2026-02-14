export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  readonly entity: string;
  readonly id: string | number;

  constructor(entity: string, id: string | number) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.entity = entity;
    this.id = id;
  }
}

export class DatabaseError extends DomainError {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
    this.cause = cause;
  }
}
