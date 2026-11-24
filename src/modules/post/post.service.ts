import { BadRequestException, ForbiddenException, NotFoundException } from "../../common/exception"
import { IPost, IUser } from "../../common/interface"
import { userRepository, UserRepository } from "../../common/repository"
import { friendRequestRepository, FriendRequestRepository } from "../../common/repository/friendRequest.repository"
import { postRepository, PostRepository } from "../../common/repository/post.repository"
import { cloudService, CloudService } from "../../common/service"
import { IFile } from "../../common/types"
import { createOtp, toObjectId } from "../../common/utlis"
import { CreatePostDto, updatePostDto } from "./dto/post.dto"


class PostService {
  private readonly cloudService: CloudService
  private readonly postRepository: PostRepository
  private readonly userRepository: UserRepository
  private readonly friendRequestRepository: FriendRequestRepository


  constructor() {
    this.postRepository = postRepository
    this.userRepository = userRepository
    this.cloudService = cloudService
    this.friendRequestRepository = friendRequestRepository


  }


  async create({allowShare , privacy , content , mentions}: CreatePostDto['body'], user: IUser , files:IFile[] = []) {

  const  folderId = createOtp()
  let attachments: string[]=[]
  if(mentions?.length && (await this.userRepository.find({filter:{_id:{$in: mentions}}})).length != mentions?.length ){
   throw new NotFoundException("Some of mentioned account not exist")
  }

  if(files?.length){
    attachments = await this.cloudService.uploadAssets({files , path : `Post/${folderId}`})
  }
  const post = await this.postRepository.createOne({
    data:{
      folderId,
      content,
      attachments,
      allowShare,
      createdBy:user._id,
      mentions,
      privacy
    }
  })
  return post


  }


  async update({postId}:updatePostDto['params'],{
    removeAttachments=[] ,
    removeMentions=[] ,
    allowShare ,
    privacy ,
    content ,
    mentions=[]
        }: updatePostDto['body'], user: IUser , files:IFile[] = []):Promise<IPost> {

  if(mentions?.length && (await this.userRepository.find({filter:{_id:{$in: mentions}}})).length != mentions?.length ){
   throw new NotFoundException("Some of mentioned account not exist")
  }

  const post = await this.postRepository.findOne({
    filter:{_id: postId , createdBy: user._id}
  })

  if(!post){
    throw new NotFoundException("Invalid postId")
  }

  removeAttachments = removeAttachments.filter(ele=> post.attachments.includes(ele))
  const postAttachmentsLength = post.attachments.length + files.length - removeAttachments.length
  if(postAttachmentsLength > 3){
    throw new BadRequestException("post connot hold more than 3 files")
  }

  const postContent = content ?? post.content
  if(!postContent && postAttachmentsLength < 1){
    throw new BadRequestException("post cannot be empty")
  }


  let newAttachments:string[] = [];
  if(files.length){
    newAttachments = await this.cloudService.uploadAssets({files , path:`Post/${post.folderId}`})
  }

  const uPost = await this.postRepository.findOneAndUpdate({
    filter:{
      _id: postId , createdBy: user._id
    },
    update:[
      {

        $set:{
                 content:postContent,
                 allowShare : allowShare ?? post.allowShare ,
                 privacy : privacy ?? post.privacy,
                 mentions:{
                  $setUnion: [
                    {
                      $setDifference:[
                        "$mentions",
                        removeMentions.map(ele => toObjectId(ele))
                      ]
                    },
                    mentions.map(ele => toObjectId(ele))
                  ]
                 },

                 attachments:{
                  $setUnion: [
                    {
                      $setDifference:[
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
  })

  if(!uPost){

    if(newAttachments?.length){
      await this.cloudService.deleteAssets({Keys: newAttachments})
    }

    if(removeAttachments?.length){
      await this.cloudService.deleteAssets({Keys: newAttachments})
    }

    throw new NotFoundException("Invalid post")
  }
  return uPost


  }


  // async getAllPost(user: IUser) {

  //   const posts = await this.postRepository.find({
  //     filter: {
  //       userId: user._id
  //     }
  //   })


  //   return posts;

  // }


  // async getPost(postId: string, user: IUser) {

  //   const post = await this.postRepository.findById({
  //     id: toObjectId(postId)
  //   })

  //   if (!post) throw new NotFoundException("post not found")

  //   const owner = await this.userRepository.findById({
  //     id: toObjectId(post.userId as unknown as string)
  //   })

  //   if(owner?.isPrivate) throw new ForbiddenException("Forbidden")
  //   return post;

  // }


  // async updatePost(postId: string, data: CreatePostDto, user: IUser) {

  //   const postExists = await this.postRepository.findById({ id: toObjectId(postId) });

  //   if (!postExists) {
  //     throw new NotFoundException("Post not found");
  //   }

  //   if (postExists.userId.toString() !== user._id.toString()) {
  //     throw new ForbiddenException("You are not allowed to update this post");
  //   }


  //   const post = await this.postRepository.updateOne({
  //     filter: {
  //       _id: toObjectId(postId)
  //     },
  //     update: data
  //   })
  //   return post;

  // }


  // async deletePost(postId: string, user: IUser) {

  //   const postExists = await this.postRepository.findById({ id: toObjectId(postId) });

  //   if (!postExists) {
  //     throw new NotFoundException("Post not found");
  //   }

  //   if (postExists.userId.toString() !== user._id.toString()) {
  //     throw new ForbiddenException("You are not allowed to delete this post");
  //   }


  //   const post = await this.postRepository.deleteOne({
  //     filter: {
  //       _id: toObjectId(postId)
  //     }
  //   })
  //   return post;

  // }


}

export default new PostService()