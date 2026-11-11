import multer  from "multer";
import {randomUUID} from 'node:crypto'
import { resolve } from "node:path";
import {mkdir, readFile, unlink, writeFile} from 'node:fs/promises'
import {fileTypeFromBuffer} from 'file-type'
import { BadRequestException } from "../../exception";
import { Request } from "express";
import { StorageApproachEnum } from "../../enum";
import { tmpdir } from "node:os";



export const fileValidation = {
    image:['image/jpeg' , 'image/png' , 'image/gif'],
    file:['application/pdf' , 'application/json']

}


export const localFielupload = ({maxFileSize = 5, storageApproach = StorageApproachEnum.MEMORY }:{maxFileSize?:number , storageApproach?:StorageApproachEnum})=>{
  
    const storage = storageApproach == StorageApproachEnum.MEMORY ? multer.memoryStorage() : multer.diskStorage({
      destination(req, file, callback) {
        callback(null , tmpdir())
      },
      filename(req, file, callback) {
        callback(null , randomUUID()+file.originalname)
      },
    })
    return multer({storage , limits:{fileSize: maxFileSize * 1024 * 1024}})
}




export const proccessFile = async ({
  customPath = "general" ,
  file ,
  validation
  }:{
  customPath?: string;
  file: Express.Multer.File;
  validation: string[]
    })=>{      

        if(file.path){
          file.buffer = await readFile(file.path)
        }
       
        const result = await fileTypeFromBuffer(file.buffer)

        if(!result || !validation.includes(result.mime)) {
           await unlink(file.path)
           throw new BadRequestException("Invalid file formats")            
        }else{

            await mkdir(resolve(`./assets/${customPath}`) , {recursive : true})
           const uniqueFilepath = `assets/${customPath}/${randomUUID()}.${result.ext}`
           await writeFile(resolve(`./${uniqueFilepath}`), file.buffer)
           if (file.path) {
              await unlink(file.path)
           }
           file.path = uniqueFilepath
           return file
        }


    }


export const proccessFiles = async ({
  customPath="general" ,
  files ,
  validation
  }:{
  customPath?: string;
  files: Express.Multer.File[];
  validation: string[]
    })=>{  
 
   const assets = []
   try {

    for (const file of files) {
    const uploadFile = await proccessFile({customPath , file , validation})
    assets.push(uploadFile)
  }  
  return assets

   } catch (error) {

    for (const file of files) {
      if (file.path) {
        await unlink(resolve(`./${file.path}`))
      }
   }
   throw error
 }}

 

 
export const proccessFields = async ({
  customPath="general" ,
  fields ,
  validation
  }:{
  customPath?: string;
  fields: Record<string , Express.Multer.File[]>;
  validation: string[]
    })=>{  
 
   const assets = []

   try {

    for (const field of Object.keys(fields)) {
    const files = await proccessFiles({customPath , files : fields[field] as Express.Multer.File[] , validation})
    assets.push({field , files})
  }  
  return assets

   } catch (error) {
      for (const {files} of assets) {
        for (const file of files) {
             if (file.path) {
              await unlink(resolve(`./${file.path}`))
            }
   }
   }
   throw error
   }

  
 }



export const proccessMulterUpload = async ({
  req ,
  customPath = "general",
  isRequired = true,
  validation = []
  }:{
  req:Request ;
  customPath?: string;
  isRequired?:boolean
  validation: string[]
      })=>{

//         if (isRequired &&(!req.files ||(!Array.isArray(req.files) && !Object.keys(req.files).length))) {
//     throw new BadRequestException("File is required")
// }


       if (req.file) {
         await proccessFile({customPath , file : req.file , validation})
       }
        else if (Array.isArray(req.files)) {
         await proccessFiles({customPath , files : req.files , validation})
       }
       else if(typeof req.files =="object" && Object.keys(req.files)?.length){
         await proccessFields({customPath , fields : req.files as Record<string , Express.Multer.File[]> , validation})

       }
    }
