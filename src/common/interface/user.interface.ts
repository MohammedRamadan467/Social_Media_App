import mongoose from "mongoose";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../enum";

export interface IUser{
status:AccountStatusEnum;
changeStatusAt?:Date;
_id: mongoose.Types.ObjectId;
firstName:string;
lastName:string;
username?:string;
email:string;
password:string;
phone?: string;
DOB?: Date;
confirmEmail?: string;
image?:string;
coverImage?:[string];
gender:GenderEnum;
role:RoleEnum;
provider:ProviderEnum;
changeCredentialsTime?: Date;
twoStepVerification?:Date;
createdAt:Date;
updatedAt:Date;
isPrivate?:boolean;

 
}