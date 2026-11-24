"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const friendRequest_repository_1 = require("../../common/repository/friendRequest.repository");
const post_repository_1 = require("../../common/repository/post.repository");
const service_1 = require("../../common/service");
const utlis_1 = require("../../common/utlis");
class PostService {
    cloudService;
    postRepository;
    userRepository;
    friendRequestRepository;
    constructor() {
        this.postRepository = post_repository_1.postRepository;
        this.userRepository = repository_1.userRepository;
        this.cloudService = service_1.cloudService;
        this.friendRequestRepository = friendRequest_repository_1.friendRequestRepository;
    }
    async create({ allowShare, privacy, content, mentions }, user, files = []) {
        const folderId = (0, utlis_1.createOtp)();
        let attachments = [];
        if (mentions?.length && (await this.userRepository.find({ filter: { _id: { $in: mentions } } })).length != mentions?.length) {
            throw new exception_1.NotFoundException("Some of mentioned account not exist");
        }
        if (files?.length) {
            attachments = await this.cloudService.uploadAssets({ files, path: `Post/${folderId}` });
        }
        const post = await this.postRepository.createOne({
            data: {
                folderId,
                content,
                attachments,
                allowShare,
                createdBy: user._id,
                mentions,
                privacy
            }
        });
        return post;
    }
    async update({ postId }, { removeAttachments = [], removeMentions = [], allowShare, privacy, content, mentions = [] }, user, files = []) {
        if (mentions?.length && (await this.userRepository.find({ filter: { _id: { $in: mentions } } })).length != mentions?.length) {
            throw new exception_1.NotFoundException("Some of mentioned account not exist");
        }
        const post = await this.postRepository.findOne({
            filter: { _id: postId, createdBy: user._id }
        });
        if (!post) {
            throw new exception_1.NotFoundException("Invalid postId");
        }
        removeAttachments = removeAttachments.filter(ele => post.attachments.includes(ele));
        const postAttachmentsLength = post.attachments.length + files.length - removeAttachments.length;
        if (postAttachmentsLength > 3) {
            throw new exception_1.BadRequestException("post connot hold more than 3 files");
        }
        const postContent = content ?? post.content;
        if (!postContent && postAttachmentsLength < 1) {
            throw new exception_1.BadRequestException("post cannot be empty");
        }
        let newAttachments = [];
        if (files.length) {
            newAttachments = await this.cloudService.uploadAssets({ files, path: `Post/${post.folderId}` });
        }
        const uPost = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId, createdBy: user._id
            },
            update: [
                {
                    $set: {
                        content: postContent,
                        allowShare: allowShare ?? post.allowShare,
                        privacy: privacy ?? post.privacy,
                        mentions: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$mentions",
                                        removeMentions.map(ele => (0, utlis_1.toObjectId)(ele))
                                    ]
                                },
                                mentions.map(ele => (0, utlis_1.toObjectId)(ele))
                            ]
                        },
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attachments",
                                        removeAttachments
                                    ]
                                },
                                newAttachments
                            ]
                        }
                    }
                }
            ]
        });
        if (!uPost) {
            if (newAttachments?.length) {
                await this.cloudService.deleteAssets({ Keys: newAttachments });
            }
            if (removeAttachments?.length) {
                await this.cloudService.deleteAssets({ Keys: newAttachments });
            }
            throw new exception_1.NotFoundException("Invalid post");
        }
        return uPost;
    }
}
exports.default = new PostService();
