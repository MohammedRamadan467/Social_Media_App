import mongoose, { HydratedDocument } from "mongoose";
import { AccountStatusEnum, GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum";
import { IUser } from "../../common/interface";
import { encryption, hash } from "../../common/security";
import { sendEmail } from "../../common/utlis/email";
import { APP_EMAIL } from "../../config";

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
},
status:{
    type:Number,
    enum:AccountStatusEnum,
    default:AccountStatusEnum.ACTIVE
},
changeStatusAt:Date
 
 
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



// userSchema.pre('save' , async function(){

//     this.password = await hash(this.password)
//     this.phone = await encryption(this.password)
// })


userSchema.pre('validate' , function(){
    console.log("Pre_VALIDATE");

    if (this.provider == ProviderEnum.GOOGLE && this.password) {
        throw new Error("Google account cannot hold password")
    }
})



userSchema.pre(["findOne" , "find" ,"countDocuments"] , function(){
 const query = this.getFilter() 
 if (query.paranoid != false)  this.setQuery({...query , status:{$ne:AccountStatusEnum.ARCHIVE}})

})



userSchema.pre(["updateOne" , "updateMany" ,"findOneAndUpdate"] , function(){
 const query = this.getFilter() 
 const update = this.getUpdate() as HUser

 if (update.status == AccountStatusEnum.ACTIVE) {
    this.setQuery({...query , status:{$eq:AccountStatusEnum.ARCHIVE}})
    
 }
 else if(update.status == AccountStatusEnum.ARCHIVE){
    this.setQuery({...query , status:{$ne:AccountStatusEnum.ARCHIVE}})
 }

 if (!update.status && query.paranoid != false) {
    this.setQuery({...query , status:{$ne:AccountStatusEnum.ARCHIVE}})

 }

 this.setUpdate({
    ...this.getUpdate(),
    ...(update.status ? {changeStatusAt : new Date()} : {})
})
})



userSchema.pre(["deleteOne" , "deleteMany" ,"findOneAndDelete"] , function(){
 const query = this.getFilter() 

 if (!query.force) {
    this.setQuery({...query , status:{$eq:AccountStatusEnum.ARCHIVE}})

 }

})



export const UserModel = mongoose.models.User || mongoose.model<IUser>("User",userSchema)
export type HUser = HydratedDocument<IUser>

