import { ApplicationException } from "./error.exception";

export class BadRequestException extends ApplicationException {
    constructor( message: string = "BadRequest" , cause? : unknown) {
        super(message ,400, cause);
    }   
}  

export class UnauthorizedException extends ApplicationException {
constructor(message: string = "Unauthorized", cause?: unknown) {
super(message, 401, cause);
}
}

export class ForbiddenException extends ApplicationException {
constructor(message: string = "Forbidden", cause?: unknown) {
super(message, 403, cause);
}
}

export class NotFoundException extends ApplicationException {
constructor(message: string = "NotFound", cause?: unknown) {
super(message, 404, cause);
}
}

export class MethodNotAllowedException extends ApplicationException {
constructor(message: string = "MethodNotAllowed", cause?: unknown) {
super(message, 405, cause);
}
}

export class RequestTimeoutException extends ApplicationException {
constructor(message: string = "RequestTimeout", cause?: unknown) {
super(message, 408, cause);
}
}

export class ConflictException extends ApplicationException {
constructor(message: string = "Conflict", cause?: unknown) {
super(message, 409, cause);
}
}

export class GoneException extends ApplicationException {
constructor(message: string = "Gone", cause?: unknown) {
super(message, 410, cause);
}
}

export class PayloadTooLargeException extends ApplicationException {
constructor(message: string = "PayloadTooLarge", cause?: unknown) {
super(message, 413, cause);
}
}

export class UnsupportedMediaTypeException extends ApplicationException {
constructor(message: string = "UnsupportedMediaType", cause?: unknown) {
super(message, 415, cause);
}
}

export class UnprocessableEntityException extends ApplicationException {
constructor(message: string = "UnprocessableEntity", cause?: unknown) {
super(message, 422, cause);
}
}

export class TooManyRequestsException extends ApplicationException {
constructor(message: string = "TooManyRequests", cause?: unknown) {
super(message, 429, cause);
}
}

export class InternalServerErrorException extends ApplicationException {
constructor(message: string = "InternalServerError", cause?: unknown) {
super(message, 500, cause);
}
}

export class NotImplementedException extends ApplicationException {
constructor(message: string = "NotImplemented", cause?: unknown) {
super(message, 501, cause);
}
}

export class BadGatewayException extends ApplicationException {
constructor(message: string = "BadGateway", cause?: unknown) {
super(message, 502, cause);
}
}

export class ServiceUnavailableException extends ApplicationException {
constructor(message: string = "ServiceUnavailable", cause?: unknown) {
super(message, 503, cause);
}
}

export class GatewayTimeoutException extends ApplicationException {
constructor(message: string = "GatewayTimeout", cause?: unknown) {
super(message, 504, cause);
}
}