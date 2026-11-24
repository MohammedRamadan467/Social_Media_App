import mongoose from "mongoose";
import { IUser } from "./user.interface";
import { FriendRequestEnum } from "../enum/friendRequest.enum";

export interface IFriendRequest{
senderId:mongoose.Types.ObjectId | IUser;
receiverId:mongoose.Types.ObjectId | IUser;
note?:string;
status:FriendRequestEnum
createdAt:Date;
updatedAt:Date;

 
}