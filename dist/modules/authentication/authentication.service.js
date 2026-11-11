"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const security_1 = require("../../common/security");
const service_1 = require("../../common/service");
const enum_1 = require("../../common/enum");
const email_1 = require("../../common/utlis/email");
const otp_1 = require("../../common/utlis/otp");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../../config");
class AuthenticationService {
    userRepository;
    cacheService;
    tokenService;
    client;
    constructor() {
        this.cacheService = service_1.cacheService;
        this.userRepository = new repository_1.UserRepository();
        this.tokenService = new security_1.TokenService();
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleAccount(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: config_1.WEB_CLIENT_IDS
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified)
            throw new exception_1.BadRequestException("email not verified");
        return payload;
    }
    async signupWithGmail(idToken, issuer) {
        const { name, email, picture } = await this.verifyGoogleAccount(idToken);
        const existAccount = await this.userRepository.findOne({
            filter: { email: email }
        });
        if (existAccount) {
            if (existAccount.provider != enum_1.ProviderEnum.GOOGLE) {
                throw new exception_1.ConflictException("Invalid account provider");
            }
            return { status: 201, data: await this.tokenService.createLoginCredentials({ user: existAccount, issuer }) };
        }
        const user = await this.userRepository.createOne({
            data: {
                username: name,
                email,
                confirmEmail: new Date(),
                provider: enum_1.ProviderEnum.GOOGLE,
                image: picture
            }
        });
        return { status: 200, data: await this.tokenService.createLoginCredentials({ user, issuer }) };
    }
    async sendEmailOtp({ email, subject, title, expiresIn = 120, maxTrials = 3, blockInSeconds = 300 }) {
        const existOTP_TTL = await this.cacheService.ttl({ key: (0, email_1.userEmailKey)({ email, subject }) });
        if (existOTP_TTL > 0) {
            throw new exception_1.ConflictException(`sorry we connot create new otp while existing one still valid please try again later after ${existOTP_TTL}`);
        }
        const oldTrials = await this.cacheService.get({ key: (0, email_1.userEmaiTrialsKey)({ email, subject }) }) ?? 0;
        if (oldTrials >= maxTrials) {
            throw new exception_1.TooManyRequestsException("Max otp trials has been reached");
        }
        const code = (0, otp_1.createOtp)();
        await this.cacheService.set({
            key: (0, email_1.userEmailKey)({ email, subject }),
            value: await (0, security_1.hash)(code.toString()),
            ttl: expiresIn
        });
        const currentTrials = await this.cacheService.incrBy({ key: (0, email_1.userEmaiTrialsKey)({ email, subject }) });
        if (currentTrials == 3) {
            await this.cacheService.expire({ key: (0, email_1.userEmaiTrialsKey)({ email, subject }), ttl: blockInSeconds });
        }
        email_1.emailEvent.emit("send-Email", {
            recipients: { to: email },
            subject,
            data: { code, title: title ?? subject }
        });
    }
    async signup({ email, password, username, phone }) {
        const duplicatedAccount = await this.userRepository.findOne({
            filter: { email },
            options: { select: "email" }
        });
        if (duplicatedAccount)
            throw new exception_1.ConflictException("Email exists");
        const account = await this.userRepository.createOne({
            data: {
                email,
                password: await (0, security_1.hash)(password),
                phone: await (0, security_1.encryption)(phone),
                username
            }
        });
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return account;
    }
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
            options: { select: "email" }
        });
        if (!account)
            throw new exception_1.NotFoundException("Invalid acccount");
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    async confirmEmail({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
            options: { select: "email" }
        });
        if (!account)
            throw new exception_1.NotFoundException("Invalid acccount");
        const hashOtp = await this.cacheService.get({ key: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new exception_1.ConflictException("Invalid OTP");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cacheService.del({ key: await this.cacheService.keys({ prefix: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) }) });
        return;
    }
    async login({ email, password }, issuer) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: true } }
        });
        if (!account)
            throw new exception_1.NotFoundException("not Exist");
        const matchPassword = await (0, security_1.compare)(password, account.password);
        if (!matchPassword)
            throw new exception_1.NotFoundException("Invalid password");
        if (account.twoStepVerification) {
            await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.LOGIN });
            throw new exception_1.BadRequestException("Two step verification required");
        }
        return await this.tokenService.createLoginCredentials({ user: account, issuer });
    }
    async requestForgotPasswordCode({ email }) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
            options: { select: "email" }
        });
        if (!account)
            throw new exception_1.NotFoundException("Invalid acccount");
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD });
        return;
    }
    async verifyForgotPasswordCode({ email, otp }) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
            options: { select: "email" }
        });
        if (!account)
            throw new exception_1.NotFoundException("Invalid acccount");
        const hashOtp = await this.cacheService.get({ key: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD }) });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new exception_1.ConflictException("Invalid OTP");
        }
        return account;
    }
    async resetForgotPassword({ email, otp, password }) {
        const account = await this.verifyForgotPasswordCode({ email, otp });
        account.password = await (0, security_1.hash)(password);
        account.changeCredentialsTime;
        await account.save();
        const result = await Promise.all([
            this.cacheService.keys({ prefix: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD }) }),
            this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: account._id }) })
        ]);
        await this.cacheService.del({
            key: [...result[0], ...result[1]]
        });
    }
}
exports.default = new AuthenticationService();
