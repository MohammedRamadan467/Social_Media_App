import { AnyKeys, CreateOptions, HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./base.repository";
import { IUser } from "../interface";
import { UserModel } from "../../DB/model";


export  class UserRepository extends DatabaseRepository<IUser> {
  constructor(){
    super(UserModel)
  }

  
}

export const userRepository = new UserRepository();