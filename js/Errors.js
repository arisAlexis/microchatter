'use strict'
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.code = 404;
    this.message = message;
    this.name = 'NotFoundError';
  }
}
exports.NotFoundError = NotFoundError;

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.code = 401;
    this.message = message;
    this.name = 'UnauthorizedError';
  }
}
exports.UnauthorizedError = UnauthorizedError;

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.message = message;
    this.name = 'BadRequestError';
  }
}
exports.BadRequestError = BadRequestError;

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.code = 409;
    this.message = message;
    this.name = 'ConflictError';
  }
}
exports.ConflictError = ConflictError;
