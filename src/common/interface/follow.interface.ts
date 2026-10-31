import mongoose from "mongoose";

export interface IFollow{

follower:mongoose.Types.ObjectId;
following:mongoose.Types.ObjectId;
createdAt:string;
updatedAt:string;

 
}