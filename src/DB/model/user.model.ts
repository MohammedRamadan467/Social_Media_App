import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IUser } from "../../common/interface";

const userSchema= new mongoose.Schema<IUser>(
{

firstName:{
    type:String,
    minLength:2,
    maxLength:25,
    required:true
},
lastName:{
    type:String,
    minLength:2,
    maxLength:25,
    required:true
},
email:{
    type:String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:function():boolean{
        return this.provider == ProviderEnum.SYSTEM
    }
},

phone: String,
DOB: Date,
confirmEmail: Date,
image:String,
coverImage:[String],
gender:{
    type:Number,
    enum:GenderEnum,
    default:GenderEnum.MALE
},
role:{
    type:Number,
    enum:RoleEnum,
    default:RoleEnum.USER
},
provider:{
    type:Number,
    enum:ProviderEnum,
    default:ProviderEnum.SYSTEM
},
changeCredentialsTime: Date,
twoStepVerification:Date,
isPrivate: {
  type: Boolean,
  default: false
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

userSchema.virtual("username").set(function(value){
const[firstName , lastName ]=value?.split(" ") || [];
this.set({firstName , lastName})
}).get(function(){
    return `${this.firstName} ${this.lastName}`
})


export const UserModel = mongoose.models.User || mongoose.model<IUser>("User",userSchema)
export type HUser = HydratedDocument<IUser>