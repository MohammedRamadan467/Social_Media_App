import { NextFunction, Request, RequestHandler, Response } from "express";
import { BadRequestException } from "../common/exception/domain.exception.js";
import { proccessMulterUpload } from "../common/utlis/multer";



export const uploadMiddleware = ({
    isRequired = true ,
    multerMiddleware ,
    customPath = "general",
    validation
    }:{
    isRequired?:boolean;
    multerMiddleware:RequestHandler;
    customPath?:string;
    validation:string[]
})=>{

    return  (req:Request , res:Response , next:NextFunction)=>{
    multerMiddleware(req , res , async (error?:any)=>{
        if (error) {
            next(new Error(error.message , {cause:{status:400}}));
            return;
        }

        try {
        if (
          isRequired
           && (
            !req.file &&
             !(Array.isArray(req.files) && req.files.length) &&
             !(typeof req.files =="object" && Object.keys(req.files)?.length)
            )
          ) {
        next(new BadRequestException("File is required"))
        return
        } 

         await proccessMulterUpload({req , customPath ,isRequired,  validation })
         next()
        } catch (error:any) {
            next(new Error(error.message , {cause:{status:400}}));
        }

    })
   
        
}
}