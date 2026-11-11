import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exception";

export class CloudService {
    private coludClient: S3Client
    constructor() {
        this.coludClient = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        })
    }

    async uploadAsset({Bucket = AWS_BUCKET_NAME , ACL = ObjectCannedACL.private , file , folder = "general" }: {Bucket?: string, ACL?: ObjectCannedACL , file: Express.Multer.File, folder?: string }): Promise<string> {

        const Key = `${APPLICATION_NAME}/${folder}/${randomUUID()}_${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: file.buffer
        })

        await this.coludClient.send(command)
        if (!command.input.Key) throw new BadRequestException("Fail to upload this asset")
        return command.input.Key
    }
}

export const cloudService = new CloudService()