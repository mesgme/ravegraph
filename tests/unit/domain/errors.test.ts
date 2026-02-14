import { describe, it, expect } from 'vitest';
import {
  DomainError,
  ValidationError,
  NotFoundError,
  DatabaseError,
} from '../../../src/domain/errors.js';

describe('DomainError', () => {
  it('is an instance of Error', () => {
    const err = new DomainError('something went wrong');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err.message).toBe('something went wrong');
    expect(err.name).toBe('DomainError');
  });
});

describe('ValidationError', () => {
  it('extends DomainError', () => {
    const err = new ValidationError('bad input');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.name).toBe('ValidationError');
    expect(err.message).toBe('bad input');
  });
});

describe('NotFoundError', () => {
  it('extends DomainError', () => {
    const err = new NotFoundError('Control', 42);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.name).toBe('NotFoundError');
    expect(err.message).toBe('Control with id 42 not found');
    expect(err.entity).toBe('Control');
    expect(err.id).toBe(42);
  });

  it('formats string ids', () => {
    const err = new NotFoundError('Service', 'api-service');
    expect(err.message).toBe('Service with id api-service not found');
  });
});

describe('DatabaseError', () => {
  it('extends DomainError and wraps cause', () => {
    const cause = new Error('connection refused');
    const err = new DatabaseError('query failed', cause);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(DatabaseError);
    expect(err.name).toBe('DatabaseError');
    expect(err.message).toBe('query failed');
    expect(err.cause).toBe(cause);
  });
});
