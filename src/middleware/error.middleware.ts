import { NextFunction, Request, Response } from "express"
import { IError } from "../common/interface";


export const globalErrorHandling = (error:IError , req:Request ,res:Response , next:NextFunction):Response=>{
    if(error.name?.toLowerCase()?.includes("sequelize"))
    {
        error.cause ??= {status:400};
    }
    return res.status(error.status ?? 500).json({
        error_message: error.message || 'server error' ,
        cause: error.cause,
        error: error ,
        stack:error.stack
})
}   