import mongoose from "mongoose";

export interface INotification{

recipient_id: mongoose.Types.ObjectId;
sender_id?: mongoose.Types.ObjectId;
target_id?: mongoose.Types.ObjectId;
type:string;
is_read?:boolean;
created_at:Date;

 
}