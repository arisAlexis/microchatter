export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.code=404;
        this.message = message;
        this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.code=401;
        this.message = message;
        this.name = "UnauthorizedError";
    }
}

export class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.code=400;
        this.message = message;
        this.name = "BadRequestError";
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.code=409;
        this.message = message;
        this.name = "ConflictError";
    }
}
