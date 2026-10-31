"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTimeoutException = exports.ServiceUnavailableException = exports.BadGatewayException = exports.NotImplementedException = exports.InternalServerErrorException = exports.TooManyRequestsException = exports.UnprocessableEntityException = exports.UnsupportedMediaTypeException = exports.PayloadTooLargeException = exports.GoneException = exports.ConflictException = exports.RequestTimeoutException = exports.MethodNotAllowedException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = void 0;
const error_exception_1 = require("./error.exception");
class BadRequestException extends error_exception_1.ApplicationException {
    constructor(message = "BadRequest", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends error_exception_1.ApplicationException {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends error_exception_1.ApplicationException {
    constructor(message = "Forbidden", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends error_exception_1.ApplicationException {
    constructor(message = "NotFound", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class MethodNotAllowedException extends error_exception_1.ApplicationException {
    constructor(message = "MethodNotAllowed", cause) {
        super(message, 405, cause);
    }
}
exports.MethodNotAllowedException = MethodNotAllowedException;
class RequestTimeoutException extends error_exception_1.ApplicationException {
    constructor(message = "RequestTimeout", cause) {
        super(message, 408, cause);
    }
}
exports.RequestTimeoutException = RequestTimeoutException;
class ConflictException extends error_exception_1.ApplicationException {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class GoneException extends error_exception_1.ApplicationException {
    constructor(message = "Gone", cause) {
        super(message, 410, cause);
    }
}
exports.GoneException = GoneException;
class PayloadTooLargeException extends error_exception_1.ApplicationException {
    constructor(message = "PayloadTooLarge", cause) {
        super(message, 413, cause);
    }
}
exports.PayloadTooLargeException = PayloadTooLargeException;
class UnsupportedMediaTypeException extends error_exception_1.ApplicationException {
    constructor(message = "UnsupportedMediaType", cause) {
        super(message, 415, cause);
    }
}
exports.UnsupportedMediaTypeException = UnsupportedMediaTypeException;
class UnprocessableEntityException extends error_exception_1.ApplicationException {
    constructor(message = "UnprocessableEntity", cause) {
        super(message, 422, cause);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class TooManyRequestsException extends error_exception_1.ApplicationException {
    constructor(message = "TooManyRequests", cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
class InternalServerErrorException extends error_exception_1.ApplicationException {
    constructor(message = "InternalServerError", cause) {
        super(message, 500, cause);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class NotImplementedException extends error_exception_1.ApplicationException {
    constructor(message = "NotImplemented", cause) {
        super(message, 501, cause);
    }
}
exports.NotImplementedException = NotImplementedException;
class BadGatewayException extends error_exception_1.ApplicationException {
    constructor(message = "BadGateway", cause) {
        super(message, 502, cause);
    }
}
exports.BadGatewayException = BadGatewayException;
class ServiceUnavailableException extends error_exception_1.ApplicationException {
    constructor(message = "ServiceUnavailable", cause) {
        super(message, 503, cause);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;
class GatewayTimeoutException extends error_exception_1.ApplicationException {
    constructor(message = "GatewayTimeout", cause) {
        super(message, 504, cause);
    }
}
exports.GatewayTimeoutException = GatewayTimeoutException;
