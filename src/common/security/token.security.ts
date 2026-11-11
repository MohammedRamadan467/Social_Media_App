import mongoose from "mongoose"
import { userRepository, UserRepository } from "../repository"
import { cacheService, CacheService } from "../service"
import { ACCESS_ADMIN_TOKEN_SIGNUTURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNUTURE, REFRESH_ADMIN_TOKEN_SIGNUTURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNUTURE } from "../../config"
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken'
import { RoleEnum, tokenTypeEnum } from "../enum"
import { BadRequestException, NotFoundException, UnauthorizedException } from "../exception"
import { toObjectId } from "../utlis"
import { HUser } from "../../DB/model"
import { randomUUID } from "node:crypto"
import { compare } from "./hash.security"

type userIdType = mongoose.Types.ObjectId | string

export type JwtPayloadType = JwtPayload & {
sub:string | mongoose.Types.ObjectId;
aud: number[];
jti:string;
iat:number
}


export class TokenService {
    private readonly userRepositort: UserRepository
    private readonly cacheService: CacheService
    constructor() {
        this.userRepositort = userRepository
        this.cacheService = cacheService
    }


    userBaseKey({ userId }: { userId: userIdType }): string {
        return `User::${userId.toString()}`
    }



    userBaseRevokeTokenKey({ userId }: { userId: userIdType }): string {
        return `${this.userBaseKey({ userId })}::Revoke_Token`
    }


    userRevokeTokenKey({ userId, jti }: { userId: userIdType, jti: string }): string {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`
    }

    async createToken({
        payload,
        secret_key = ACCESS_USER_TOKEN_SIGNUTURE,
        options
    }: {
        payload: string | Buffer | object,
        secret_key: Secret,
        options?: SignOptions,
    }): Promise<string> {
        return jwt.sign(payload, secret_key, options)
    }





    async verifyToken({
        token = "",
        secret_key = ACCESS_USER_TOKEN_SIGNUTURE,
    }: {
        token: string
        secret_key: Secret
    }): Promise<JwtPayloadType> {
        return jwt.verify(token, secret_key) as JwtPayloadType
    }


    async getTokenSignatures  ({ role = RoleEnum.USER }: { role? : RoleEnum } ): Promise<{ accessSignature: string, refreshSignature: string }>{
        let signatures :  { accessSignature: string, refreshSignature: string }
        switch (role) {
            case RoleEnum.ADMIN:
                signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNUTURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNUTURE }
                break;
            default:
                signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNUTURE, refreshSignature: REFRESH_USER_TOKEN_SIGNUTURE }
                break;
        }
        return signatures
    }

     async getSignature({ tokenType = tokenTypeEnum.ACCESS, role = RoleEnum.USER }: { tokenType: tokenTypeEnum, role?: RoleEnum }): Promise<string>  {
        const signatures = await this.getTokenSignatures({ role })
        return tokenType == tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
    }


    async decodeToken ({
        authorization = "",
        tokenType = tokenTypeEnum.ACCESS
    }: {
        authorization: string,
        tokenType?: tokenTypeEnum
    } ): Promise<{ user: HUser, payload: JwtPayloadType }> {

        const decoded = jwt.decode(authorization) as JwtPayloadType

        console.log(decoded);

        if (
            !decoded ||
            typeof decoded === "string" ||
            !decoded.aud
        ) {
            throw new BadRequestException("missing decoded payload");
        }

        const payload = await this.verifyToken({
            token: authorization,
            secret_key: await this.getSignature({
                tokenType,
                role: decoded.aud[0]  as unknown as RoleEnum
            })
        });

        if (
            !payload ||
            typeof payload === "string" ||
            !payload.sub ||
            !payload.jti
        ) {
            throw new BadRequestException("missing token payload");
        }

        if (await this.cacheService.exist({ key: this.userRevokeTokenKey({ userId: new mongoose.Types.ObjectId(payload.sub), jti: payload.jti }) })) {
            throw new UnauthorizedException("Expired login credentials")
        }

        const user = await this.userRepositort.findById({
            id: toObjectId(payload.sub)
        })

        if (!user) throw new NotFoundException("Invalid user")

        if (!payload.iat) throw new BadRequestException("missing token iat");


        if ( (user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new UnauthorizedException("Expired login credentials")
        }
        return { user, payload }

    }






    async createLoginCredentials ({
        user,
        issuer,
        options = {}

    }: {
        user: HUser,
        issuer: string,
        options?: SignOptions


    }): Promise<{ access_token: string, refresh_token: string }> {

        const { accessSignature, refreshSignature } = await this.getTokenSignatures({ role: user.role })
        const jwtid = randomUUID()
        const access_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret_key: accessSignature,
            options: {
                ...options,
                issuer,
                audience: [user.role as unknown as string],
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        })

        const refresh_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret_key: refreshSignature,
            options: {
                ...options,
                issuer,
                audience:[user.role as unknown as string],
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            },

        })

        return { access_token, refresh_token }
    }


    async createRevokeToken ({ payload }: { payload: JwtPayloadType }): Promise<void> {


        const consumedTime = (Math.ceil(Date.now() / 1000) - (payload.iat as number))
        const refreshExpiredIn = (payload.iat as number) + REFRESH_TOKEN_EXPIRES_IN
        const ttl = refreshExpiredIn - consumedTime

        // const refreshExpiredIn = (payload.iat as number) + REFRESH_TOKEN_EXPIRES_IN
        // const ttl = refreshExpiredIn - (Math.ceil(Date.now() / 1000))

        await this.cacheService.set({ key: this.userRevokeTokenKey({ userId: new mongoose.Types.ObjectId(payload.sub), jti: (payload.jti as string) }), value: payload.jti, ttl })
        return;
    }



      basicAuth = async ({ email, password }: { email: string, password: string }): Promise<HUser> => {
        const account = await this.userRepositort.findOne({
            filter: { email }
        })
        if (!account) throw new NotFoundException("not Exist")
        const match = await compare(password, account.password)

        if (!match) throw new NotFoundException("not Exist")
        return account

    }




}

export const tokenService = new TokenService()