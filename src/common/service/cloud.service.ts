import { CompleteMultipartUploadCommandOutput, DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, DeleteObjectsCommandInput, DeleteObjectsCommandOutput, GetObjectCommand, GetObjectCommandOutput, ListObjectsV2Command, ListObjectsV2CommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_EXPIRES_IN, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exception";
import { IFile } from "../types";
import { Progress, Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class CloudService {
    private readonly coludClient: S3Client
    constructor() {
        this.coludClient = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        })
    }

    private generateKey({ path = "public", file }: { path?: string, file: IFile }) {
        return `${APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`
    }

    async uploadAsset({
        Bucket = AWS_BUCKET_NAME,
        ACL = ObjectCannedACL.private,
        file,
        path = "public"
    }: {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        file: IFile,
        path?: string
    }): Promise<string> {

        const command = new PutObjectCommand({
            Bucket,
            Key: this.generateKey({ path, file }),
            ACL,
            Body: file.buffer,
            ContentType: file.mimetype
        })

        if (!command.input.Key) throw new BadRequestException("Fail to upload this asset")

        await this.coludClient.send(command)
        return command.input.Key
    }



    async createPreSignedUploadAssetLink({
        Bucket = AWS_BUCKET_NAME,
        path = "public",
        ContentType,
        Originalname,
        expiresIn = AWS_EXPIRES_IN
    }: {
        Bucket?: string,
        path?: string,
        ContentType:string,
        Originalname:string,
        expiresIn?:number


    }): Promise<{url:string , Key:string}> {

        const command = new PutObjectCommand({
            Bucket,
            Key: this.generateKey({ path, file:{originalname:Originalname} as IFile }),
            ContentType
        })

        if (!command.input.Key) throw new BadRequestException("Fail to upload this asset")
        const url = await getSignedUrl(this.coludClient , command , {expiresIn})
        return {url , Key:command.input.Key}
    }


        async uploadLargeAsset({
        Bucket = AWS_BUCKET_NAME,
        ACL = ObjectCannedACL.private,
        file,
        partSize = 5,
        path = "public"
    }: {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        file: IFile,
        partSize?:number,
        path?: string
    }): Promise<CompleteMultipartUploadCommandOutput> {

        const upload = new Upload({
           client:this.coludClient,
           params:{
             Bucket,
             Key: this.generateKey({ path, file }),
             ACL,
             Body: file.buffer,
             ContentType: file.mimetype
           },
           partSize: partSize * 1024 * 1024
        })

        upload.on("httpUploadProgress",(process:Progress)=>{
             console.log(`File upload is ${(process.loaded as number)/(process.total as number) * 100}%`);
             
        })
    
        return await upload.done()
    }


     async uploadAssets({
        Bucket = AWS_BUCKET_NAME,
        ACL = ObjectCannedACL.private,
        files,
        path = "public"
    }: {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        files: IFile[],
        path?: string
    }): Promise<string[]> {
         return await Promise.all(files.map((file)=> this.uploadAsset({Bucket , ACL , file , path})))
    
// BIG(O(n))
        // for (const file of files){
        //     const key = await this.uploadAsset({Bucket , ACL , file , path})
        //     urls.push(key)
        // }

    }



        async uploadLargeAssets({
        Bucket = AWS_BUCKET_NAME,
        ACL = ObjectCannedACL.private,
        files,
        partSize = 5,
        path = "public"
    }: {
        Bucket?: string,
        ACL?: ObjectCannedACL,
        files: IFile[],
        partSize?:number,
        path?: string
    }): Promise<string[]> {
         const result =  await Promise.all(files.map((file)=> this.uploadLargeAsset({Bucket , ACL , file , partSize, path})))
         return result.map((ele)=> ele.Key) as string[]
    }




     async getAsset({
        Bucket = AWS_BUCKET_NAME,
        Key
    }: {
        Bucket?: string,
        Key: string
    }): Promise<GetObjectCommandOutput> {

        const command = new GetObjectCommand({
            Bucket,
            Key
        })

        return await this.coludClient.send(command)
    }

async createPreSignedFetchAssetLink({
    Bucket = AWS_BUCKET_NAME,
    Key,
    expiresIn = AWS_EXPIRES_IN,
    download = 'false',
    filename
  }: {
    Bucket?: string,
    Key: string;
    expiresIn?: number,
    download?: 'true' | 'false',
    filename?: string | undefined
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition: download == "true" ? `attachment; filename="${filename}"` : undefined ,
    })
    return await getSignedUrl(this.coludClient, command, { expiresIn })
  }


    async deleteAsset({
        Bucket = AWS_BUCKET_NAME,
        Key
    }: {
        Bucket?: string,
        Key: string
    }): Promise<DeleteObjectCommandOutput> {

        const command = new DeleteObjectCommand({
            Bucket,
            Key
        })

        return await this.coludClient.send(command)
    }


    async deleteAssets({
        Bucket = AWS_BUCKET_NAME,
        Keys
    }: {
        Bucket?: string,
        Keys: string[]
    }): Promise<DeleteObjectsCommandOutput> {

        const command = new DeleteObjectsCommand({
            Bucket,
            Delete:{
                Objects:Keys.map((key)=> {return {Key:key}})
            }
        })

        return await this.coludClient.send(command)
    }


    async listFolderDirs({
        Bucket = AWS_BUCKET_NAME,
        Prefix
    }: {
        Bucket?: string,
        Prefix: string
    }): Promise<ListObjectsV2CommandOutput> {

        const command = new ListObjectsV2Command({
            Bucket,
            Prefix:`${APPLICATION_NAME}/${Prefix}`
        })

        return await this.coludClient.send(command)
    }


    async deleteFolderByPrefix({
        Bucket = AWS_BUCKET_NAME,
        Prefix
    }: {
        Bucket?: string,
        Prefix: string
    }): Promise<DeleteObjectsCommandOutput> {

        const {Contents} = await this.listFolderDirs({Bucket , Prefix})
        const Keys = Contents?.map((ele) => ele.Key as string) || []
        return await this.deleteAssets({Bucket , Keys})
    }



    
}

export const cloudService = new CloudService()