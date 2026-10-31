import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { randomUUID } from 'node:crypto'
import mongoose from "mongoose";
import { ACCESS_ADMIN_TOKEN_SIGNUTURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNUTURE, REFRESH_ADMIN_TOKEN_SIGNUTURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNUTURE } from "../../config";
import { RoleEnum, tokenTypeEnum } from "../enum";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../exception/domain.exception.js";
import { compare } from "./hash.security";
import { cacheService} from "../../common/service";
import { userRepository } from "../repository";
import { IUser } from "../interface";



export const userBaseKey = ({ userId }: { userId: mongoose.Types.ObjectId }): string => {
    return `User::${userId.toString()}`
}



export const userBaseRevokeTokenKey = ({ userId }: { userId: mongoose.Types.ObjectId }): string => {
    return `${userBaseKey({ userId })}::Revoke_Token`
}


export const userRevokeTokenKey = ({ userId, jti }: { userId: mongoose.Types.ObjectId, jti: string }): string => {
    return `${userBaseRevokeTokenKey({ userId })}::${jti}`
}

export const createToken = async ({
    payload = {},
    secret_key = ACCESS_USER_TOKEN_SIGNUTURE,
    options = {}
}: {
    payload?: jwt.JwtPayload,
    secret_key?: Secret,
    options?: SignOptions
} = {}):Promise<string> => {
    return jwt.sign(payload, secret_key, options)
}





export const verifyToken = async ({
    token = "",
    secret_key = ACCESS_USER_TOKEN_SIGNUTURE,
}:{
    token?:string
    secret_key?:Secret
} = {}):Promise<string | jwt.JwtPayload> => {
    return jwt.verify(token, secret_key)
}


const getTokenSignatures = async ({ role = RoleEnum.USER }:{ role?:RoleEnum} = {}):Promise<{accessSignature:string , refreshSignature:string}> => {
    let signatures;
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

const getSignature = async ({ tokenType = tokenTypeEnum.ACCESS, role = RoleEnum.USER }:{ tokenType?:  tokenTypeEnum, role ?: RoleEnum } = {}):Promise<string> => {
    const signatures = await getTokenSignatures({ role })
    return tokenType == tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature
}


export const decodeToken = async ({
    authorization = "",
    tokenType = tokenTypeEnum.ACCESS
}:{
    authorization?:string,
    tokenType?:tokenTypeEnum
} = {}):Promise<{ user:IUser, payload:jwt.JwtPayload }> => {

    const decoded = jwt.decode(authorization);

    console.log(decoded);

    if (
        !decoded ||
        typeof decoded === "string" ||
        !decoded.aud
    ) {
        throw new BadRequestException("missing decoded payload");
    }

    const payload = await verifyToken({
        token: authorization,
        secret_key: await getSignature({
            tokenType,
            role: Number(decodeToken) as RoleEnum
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

    if (await cacheService.exist({ key: userRevokeTokenKey({ userId: new mongoose.Types.ObjectId(payload.sub), jti: payload.jti }) })) {
        throw new UnauthorizedException("Expired login credentials")
    }

    const user = await userRepository.findById({
        id: new mongoose.Types.ObjectId(payload.sub)
    })

    if (!user) throw new NotFoundException("Invalid user")

    if (!payload.iat) throw new BadRequestException("missing token iat");


    if (new Date(user.changeCredentialsTime ?? 0).getTime() > payload.iat * 1000) {
        throw new UnauthorizedException("Expired login credentials")
    }
    return { user, payload }

}






export const createLoginCredentials = async ({
    user,
    issuer,
    options = {}


}:{
    user: {_id:mongoose.Types.ObjectId , role:RoleEnum},
    issuer:string,
    options?: jwt.SignOptions


}):Promise<{ access_token:string , refresh_token:string }> => {

    const { accessSignature, refreshSignature } = await getTokenSignatures({ role: user.role })
    const jwtid = randomUUID()
    const access_token = await createToken({
        payload: { sub: user._id.toString() },
        secret_key: accessSignature,
        options: {
            ...options,
            issuer,
            audience: String(user.role),
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        }
    })

    const refresh_token = await createToken({
        payload: { sub: user._id.toString() },
        secret_key: refreshSignature,
        options: {
            ...options,
            issuer,
            audience: String(user.role),
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        },

    })

    return { access_token, refresh_token }
}


export const createRevokeToken = async ({ payload }:{ payload:jwt.JwtPayload }):Promise<void> => {


    const consumedTime = (Math.ceil(Date.now() / 1000) - (payload.iat as number))
    const refreshExpiredIn = (payload.iat as number) + REFRESH_TOKEN_EXPIRES_IN
    const ttl = refreshExpiredIn - consumedTime

    // const refreshExpiredIn = (payload.iat as number) + REFRESH_TOKEN_EXPIRES_IN
    // const ttl = refreshExpiredIn - (Math.ceil(Date.now() / 1000))
    
    await cacheService.set({ key: userRevokeTokenKey({ userId: new mongoose.Types.ObjectId( payload.sub), jti: (payload.jti as string) }), value: payload.jti, ttl })
    return;
}



export const basicAuth = async ({ email, password }:{ email:string, password:string }):Promise<IUser> => {
    const account = await userRepository.findOne({
        filter: { email }
    })
    if (!account) throw new NotFoundException("not Exist")
    const match = await compare(password, account.password)

    if (!match) throw new NotFoundException("not Exist")
    return account

}



