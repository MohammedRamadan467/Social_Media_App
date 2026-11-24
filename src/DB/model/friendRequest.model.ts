import mongoose, { HydratedDocument } from "mongoose";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IFriendRequest, IUser } from "../../common/interface";
import { number } from "zod";
import { FriendRequestEnum } from "../../common/enum/friendRequest.enum";

const friendRequestSchema= new mongoose.Schema<IFriendRequest>(
{

    senderId:{type:mongoose.Types.ObjectId , ref:"User" , required:true},
    receiverId:{type:mongoose.Types.ObjectId , ref:"User" , required:true},
    note:{type:String , minLength:5 , maxLength:5000},
    status:{type: Number , enum:FriendRequestEnum , default:FriendRequestEnum.PENDING}
 
},
{
timestamps:true,
toObject:{virtuals:true},
toJSON:{virtuals:true},
autoIndex:true,
strict:true,
strictQuery:true

}
)



export const FriendRequestModel = mongoose.models.FriendRequest || mongoose.model<IFriendRequest>("FriendRequest",friendRequestSchema)
export type HFriendRequest = HydratedDocument<IFriendRequest>

