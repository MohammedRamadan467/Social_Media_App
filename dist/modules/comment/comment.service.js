"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const utlis_1 = require("../../common/utlis");
class CommentService {
    commentRepository;
    userRepository;
    postRepository;
    constructor() {
        this.commentRepository = repository_1.commentRepository;
        this.userRepository = repository_1.userRepository;
        this.postRepository = repository_1.postRepository;
    }
    async createComment({ content, attachments }, postId, user) {
        const post = await this.postRepository.findById({
            id: (0, utlis_1.toObjectId)(postId)
        });
        if (!post)
            throw new exception_1.NotFoundException("post not found");
        const comment = this.commentRepository.createOne({
            data: {
                content,
                attachments,
                postId,
                userId: user._id
            }
        });
        return comment;
    }
    async getAllComments(postId, user) {
        const post = await this.postRepository.findById({
            id: (0, utlis_1.toObjectId)(postId)
        });
        if (!post)
            throw new exception_1.NotFoundException("post not found");
        const comments = await this.commentRepository.find({
            filter: {
                postId
            }
        });
        return comments;
    }
    async getComment(commentId, user) {
        const comment = await this.commentRepository.findById({
            id: (0, utlis_1.toObjectId)(commentId)
        });
        if (!comment)
            throw new exception_1.NotFoundException("comment not found");
        return comment;
    }
    async updateComment(commentId, { content, attachments }, user) {
        const commentExists = await this.commentRepository.findById({ id: (0, utlis_1.toObjectId)(commentId) });
        if (!commentExists) {
            throw new exception_1.NotFoundException("comment not found");
        }
        if (commentExists.userId.toString() !== user._id.toString()) {
            throw new exception_1.ForbiddenException("You are not allowed to update this comment");
        }
        const comment = await this.commentRepository.updateOne({
            filter: {
                _id: (0, utlis_1.toObjectId)(commentId)
            },
            update: { content, attachments }
        });
        return comment;
    }
    async deleteComment(commentId, user) {
        const commentExists = await this.commentRepository.findById({ id: (0, utlis_1.toObjectId)(commentId) });
        if (!commentExists) {
            throw new exception_1.NotFoundException("Comment not found");
        }
        if (commentExists.userId.toString() !== user._id.toString()) {
            throw new exception_1.ForbiddenException("You are not allowed to delete this comment");
        }
        const comment = await this.commentRepository.deleteOne({
            filter: {
                _id: (0, utlis_1.toObjectId)(commentId)
            }
        });
        return comment;
    }
}
exports.default = new CommentService();
