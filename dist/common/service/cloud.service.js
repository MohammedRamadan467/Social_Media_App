"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config");
const node_crypto_1 = require("node:crypto");
const exception_1 = require("../exception");
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
    async uploadAsset({ Bucket = config_1.AWS_BUCKET_NAME, ACL = client_s3_1.ObjectCannedACL.private, file, folder = "general" }) {
        const Key = `${config_1.APPLICATION_NAME}/${folder}/${(0, node_crypto_1.randomUUID)()}_${file.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: file.buffer
        });
        await this.coludClient.send(command);
        if (!command.input.Key)
            throw new exception_1.BadRequestException("Fail to upload this asset");
        return command.input.Key;
    }
}
exports.CloudService = CloudService;
exports.cloudService = new CloudService();
