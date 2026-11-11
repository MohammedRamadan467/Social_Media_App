import { ForbiddenException, NotFoundException } from "../../common/exception"
import { IUser } from "../../common/interface"
import { commentRepository, CommentRepository, postRepository, PostRepository, UserRepository, userRepository } from "../../common/repository"
import { toObjectId } from "../../common/utlis"
import { CreatePostDto } from "../post/dto/post.dto"



class CommentService {
  private readonly commentRepository: CommentRepository
  private readonly userRepository: UserRepository
  private readonly postRepository: PostRepository


  constructor() {
    this.commentRepository = commentRepository
    this.userRepository = userRepository
    this.postRepository = postRepository

    
  }



  async createComment({content , attachments}:CreatePostDto , postId:string , user:IUser){
  
     const post = await this.postRepository.findById({
      id:toObjectId(postId)
     })
     if(!post) throw new NotFoundException("post not found")

     const comment = this.commentRepository.createOne({
    data:{
      content,
      attachments,
      postId,
      userId:user._id
    }
  })
     return comment;
      
    }
  
  
      async getAllComments(postId : string , user:IUser){
  
      const post = await this.postRepository.findById({
       id:toObjectId(postId)
     })
     if(!post) throw new NotFoundException("post not found")

  
      const comments = await this.commentRepository.find({
        filter:{
          postId
        }
      })
  
     return comments;
      
    }
  
  
      async getComment(commentId:string , user:IUser){
  
     const comment = await this.commentRepository.findById({
      id: toObjectId(commentId)
     })
  
     if(!comment) throw new NotFoundException("comment not found")
     return comment;
      
    }
  
  
      async updateComment(commentId:string, {content , attachments}: CreatePostDto, user:IUser){
  
      const commentExists = await this.commentRepository.findById({id:toObjectId(commentId)});
  
      if (!commentExists) {
          throw new NotFoundException("comment not found");
      }
  
      if (commentExists.userId.toString() !== user._id.toString()) {
          throw new ForbiddenException("You are not allowed to update this comment");
      }
  
  
     const comment = await this.commentRepository.updateOne({
      filter:{
        _id:toObjectId(commentId)
      },
      update: {content , attachments}
     })
     return comment;
      
    }
  
  
        async deleteComment(commentId:string , user:IUser){
  
      const commentExists = await this.commentRepository.findById({id:toObjectId(commentId)});
  
      if (!commentExists) {
          throw new NotFoundException("Comment not found");
      }
  
      if (commentExists.userId.toString() !== user._id.toString()) {
          throw new ForbiddenException("You are not allowed to delete this comment");
      }
  
  
     const comment = await this.commentRepository.deleteOne({
      filter:{
        _id:toObjectId(commentId)
      }
     })
     return comment;
      
    }
}



export default new CommentService()