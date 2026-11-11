import { NextFunction, Request, Response } from "express"
import { tokenTypeEnum } from "../common/enum/security.enum"
import { ForbiddenException, UnauthorizedException } from "../common/exception/domain.exception.js"
import { RoleEnum } from "../common/enum/user.enum.js"
import { tokenService } from "../common/security"



export const bearerAuth = async ({req , tokenType = tokenTypeEnum.ACCESS}:{req:Request , tokenType ?: tokenTypeEnum})=>{

    
           const [key , credential] = (req.headers['authorization']?.split(" ") ?? []) as [string , string]
           const {user , payload} = await tokenService.decodeToken({authorization: credential , tokenType})
            req.user = user
            req.payload = payload 
}






export const authentication = (tokenType = tokenTypeEnum.ACCESS)=>{
    return async (req:Request , res:Response , next:NextFunction)=>{

    const {authorization} = req.headers
    if(!authorization) throw new UnauthorizedException("Unauthorized Account")

    const [key , credential] = (authorization.split(" ") || []) as [string , string]
    
    switch (key) {
        case "Basic":
            const [email , password] = Buffer.from(credential , "base64").toString().split(":") as [string , string]
            req.user = await tokenService.basicAuth({email , password })
            break;

        case "Bearer":
           await bearerAuth({ req , tokenType})
            break;

        default:
            next(new Error ("Invalid authentication schema" , {cause:{status:400}}))
            break;
    }


    next()
}
}



export const authorization = (accessRole:RoleEnum)=>{
    return async (req:Request , res:Response , next:NextFunction)=>{

    if(req.user.role < accessRole) throw new ForbiddenException("Forbidden Account")
     
     
    next()
}
}

// if i have specific Roles
// export const authorization = (accessRoles)=>{
//     return async (req , res , next)=>{

//     if(!accessRoles.icludes(req.user.role)) throw ForbiddenException("Forbidden Account")
     
     
//     next()
// }
// }