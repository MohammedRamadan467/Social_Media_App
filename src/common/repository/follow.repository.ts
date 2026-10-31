import { DatabaseRepository } from "./base.repository";
import { IFollow } from "../interface/follow.interface";
import { FollowModel } from "../../DB/model";


export  class FollowRepository extends DatabaseRepository<IFollow> {
  constructor(){
    super(FollowModel)
  }

  
}

export const followRepository = new FollowRepository();