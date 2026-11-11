import mongoose from "mongoose";

export interface IComment{

content?:string;
userId:mongoose.Types.ObjectId;
attachments?:string[]
postId:mongoose.Types.ObjectId;
createdAt:string;
updatedAt:string;

 
}