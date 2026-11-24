import mongoose from "mongoose";
import { IUser } from "./user.interface";
import { PrivacyEnum, ReactionEnum } from "../enum/post.enum";


export interface IReaction{
createdBy:mongoose.Types.ObjectId | IUser;
reaction:ReactionEnum
createdAt:string;
updatedAt:string;
 
}


export interface IPost{
folderId:number;
createdBy:mongoose.Types.ObjectId | IUser;
content:string;
attachments:string[];
mentions?:mongoose.Types.ObjectId[] | IUser[];
sharedBy:mongoose.Types.ObjectId[] | IUser[];
allowShare:boolean;
reaction:IReaction[]
privacy: PrivacyEnum
createdAt:string;
updatedAt:string;
 
}