"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const post_repository_1 = require("../../common/repository/post.repository");
const utlis_1 = require("../../common/utlis");
class PostService {
    postRepository;
    userRepository;
    constructor() {
        this.postRepository = post_repository_1.postRepository;
        this.userRepository = repository_1.userRepository;
    }
    async createPost({ content, attachments }, user) {
        const post = await this.postRepository.createOne({
            data: {
                content,
                attachments,
                userId: user._id
            }
        });
        return post;
    }
    async getAllPost(user) {
        const posts = await this.postRepository.find({
            filter: {
                userId: user._id
            }
        });
        return posts;
    }
    async getPost(postId, user) {
        const post = await this.postRepository.findById({
            id: (0, utlis_1.toObjectId)(postId)
        });
        if (!post)
            throw new exception_1.NotFoundException("post not found");
        return post;
    }
    async updatePost(postId, data, user) {
        const postExists = await this.postRepository.findById({ id: (0, utlis_1.toObjectId)(postId) });
        if (!postExists) {
            throw new exception_1.NotFoundException("Post not found");
        }
        if (postExists.userId.toString() !== user._id.toString()) {
            throw new exception_1.ForbiddenException("You are not allowed to update this post");
        }
        const post = await this.postRepository.updateOne({
            filter: {
                _id: (0, utlis_1.toObjectId)(postId)
            },
            update: data
        });
        return post;
    }
    async deletePost(postId, user) {
        const postExists = await this.postRepository.findById({ id: (0, utlis_1.toObjectId)(postId) });
        if (!postExists) {
            throw new exception_1.NotFoundException("Post not found");
        }
        if (postExists.userId.toString() !== user._id.toString()) {
            throw new exception_1.ForbiddenException("You are not allowed to delete this post");
        }
        const post = await this.postRepository.deleteOne({
            filter: {
                _id: (0, utlis_1.toObjectId)(postId)
            }
        });
        return post;
    }
}
exports.default = new PostService();
