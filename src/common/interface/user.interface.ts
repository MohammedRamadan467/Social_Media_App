import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../enum";

export interface IUser{

_id: mongoose.Types.ObjectId;
firstName:string;
lastName:string;
username?:string;
email:string;
password:string;
phone?: string;
DOB?: string;
confirmEmail?: string;
image?:string;
coverImage?:[string];
gender:GenderEnum;
role:RoleEnum;
provider:ProviderEnum;
changeCredentialsTime?: string;
twoStepVerification?:string;
createdAt:string;
updatedAt:string;
isPrivate?:boolean;

 
}