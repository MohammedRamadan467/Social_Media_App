import mongoose, { HydratedDocument } from "mongoose";
import { IFollow } from "../../common/interface/follow.interface";

const followSchema= new mongoose.Schema<IFollow>(
{

follower:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
following:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
}
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


export const FollowModel = mongoose.models.Follow || mongoose.model<IFollow>("Follow",followSchema)
export type HFollow = HydratedDocument<IFollow>