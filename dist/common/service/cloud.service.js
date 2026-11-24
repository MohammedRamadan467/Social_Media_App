"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config");
const node_crypto_1 = require("node:crypto");
const exception_1 = require("../exception");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class CloudService {
    coludClient;
    constructor() {
        this.coludClient = new client_s3_1.S3Client({
            region: config_1.AWS_REGION,
            credentials: {
                accessKeyId: config_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_1.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    generateKey({ path = "public", file }) {
        return `${config_1.APPLICATION_NAME}/${path}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`;
    }
    async uploadAsset({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, path = "public" }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: this.generateKey({ path, file }),
            ACL,
            Body: file.buffer,
            ContentType: file.mimetype
        });
        if (!command.input.Key)
            throw new exception_1.BadRequestException("Fail to upload this asset");
        await this.coludClient.send(command);
        return command.input.Key;
    }
    async createPreSignedUploadAssetLink({ Bucket = config_1.AWS_BUCKET_NAME, path = "public", ContentType, Originalname, expiresIn = config_1.AWS_EXPIRES_IN }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: this.generateKey({ path, file: { originalname: Originalname } }),
            ContentType
        });
        if (!command.input.Key)
            throw new exception_1.BadRequestException("Fail to upload this asset");
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.coludClient, command, { expiresIn });
        return { url, Key: command.input.Key };
    }
    async uploadLargeAsset({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, partSize = 5, path = "public" }) {
        const upload = new lib_storage_1.Upload({
            client: this.coludClient,
            params: {
                Bucket,
                Key: this.generateKey({ path, file }),
                ACL,
                Body: file.buffer,
                ContentType: file.mimetype
            },
            partSize: partSize * 1024 * 1024
        });
        upload.on("httpUploadProgress", (process) => {
            console.log(`File upload is ${process.loaded / process.total * 100}%`);
        });
        return await upload.done();
    }
    async uploadAssets({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, files, path = "public" }) {
        return await Promise.all(files.map((file) => this.uploadAsset({ Bucket, ACL, file, path })));
    }
    async uploadLargeAssets({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, files, partSize = 5, path = "public" }) {
        const result = await Promise.all(files.map((file) => this.uploadLargeAsset({ Bucket, ACL, file, partSize, path })));
        return result.map((ele) => ele.Key);
    }
    async getAsset({ Bucket = config_1.AWS_BUCKET_NAME, Key }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key
        });
        return await this.coludClient.send(command);
    }
    async createPreSignedFetchAssetLink({ Bucket = config_1.AWS_BUCKET_NAME, Key, expiresIn = config_1.AWS_EXPIRES_IN, download = 'false', filename }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download == "true" ? `attachment; filename="${filename}"` : undefined,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.coludClient, command, { expiresIn });
    }
    async deleteAsset({ Bucket = config_1.AWS_BUCKET_NAME, Key }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key
        });
        return await this.coludClient.send(command);
    }
    async deleteAssets({ Bucket = config_1.AWS_BUCKET_NAME, Keys }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects: Keys.map((key) => { return { Key: key }; })
            }
        });
        return await this.coludClient.send(command);
    }
    async listFolderDirs({ Bucket = config_1.AWS_BUCKET_NAME, Prefix }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: `${config_1.APPLICATION_NAME}/${Prefix}`
        });
        return await this.coludClient.send(command);
    }
    async deleteFolderByPrefix({ Bucket = config_1.AWS_BUCKET_NAME, Prefix }) {
        const { Contents } = await this.listFolderDirs({ Bucket, Prefix });
        const Keys = Contents?.map((ele) => ele.Key) || [];
        return await this.deleteAssets({ Bucket, Keys });
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
