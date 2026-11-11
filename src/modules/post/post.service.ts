import { ForbiddenException, NotFoundException } from "../../common/exception"
import { IUser } from "../../common/interface"
import {userRepository, UserRepository } from "../../common/repository"
import { postRepository, PostRepository } from "../../common/repository/post.repository"
import { toObjectId } from "../../common/utlis"
import { CreatePostDto } from "./dto/post.dto"


class PostService {
  private readonly postRepository: PostRepository
  private readonly userRepository: UserRepository


  constructor() {
    this.postRepository = postRepository
    this.userRepository = userRepository

    
  }


  async createPost({content , attachments}:CreatePostDto , user:IUser){

   const post = await this.postRepository.createOne({
    data:{
      content,
      attachments,
      userId:user._id
    }
   })

   return post;
    
  }


    async getAllPost(user:IUser){

   const posts = await this.postRepository.find({
    filter:{
      userId:user._id
    }
   })


   return posts;
    
  }


    async getPost(postId:string , user:IUser){

   const post = await this.postRepository.findById({
    id: toObjectId(postId)
   })

   if(!post) throw new NotFoundException("post not found")
   return post;
    
  }


    async updatePost(postId:string, data: CreatePostDto, user:IUser){

    const postExists = await this.postRepository.findById({id:toObjectId(postId)});

    if (!postExists) {
        throw new NotFoundException("Post not found");
    }

    if (postExists.userId.toString() !== user._id.toString()) {
        throw new ForbiddenException("You are not allowed to update this post");
    }


   const post = await this.postRepository.updateOne({
    filter:{
      _id:toObjectId(postId)
    },
    update: data
   })
   return post;
    
  }


      async deletePost(postId:string , user:IUser){

    const postExists = await this.postRepository.findById({id:toObjectId(postId)});

    if (!postExists) {
        throw new NotFoundException("Post not found");
    }

    if (postExists.userId.toString() !== user._id.toString()) {
        throw new ForbiddenException("You are not allowed to delete this post");
    }


   const post = await this.postRepository.deleteOne({
    filter:{
      _id:toObjectId(postId)
    }
   })
   return post;
    
  }


}

export default new PostService()