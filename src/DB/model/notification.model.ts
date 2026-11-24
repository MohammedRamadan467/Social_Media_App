import mongoose, { HydratedDocument } from "mongoose";
import { INotification } from "../../common/interface/notification.interface";
import { boolean } from "zod";

const notificationSchema = new mongoose.Schema<INotification>(
    {

        recipient_id:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
           required:true
       },
       sender_id:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
           
       },
       target_id:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
       },
       type:{
        type:String,
        required:true
       },
       is_read:{
           type:boolean,
           default:false
       }


    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        autoIndex: true,
        strict: true,
        strictQuery: true

    }
)


export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema)
export type HNotification = HydratedDocument<INotification>