import { DatabaseRepository } from "./base.repository";
import { IFriendRequest} from "../interface";
import { FriendRequestModel} from "../../DB/model";


export  class FriendRequestRepository extends DatabaseRepository<IFriendRequest> {
  constructor(){
    super(FriendRequestModel)
  }

  
}

export const friendRequestRepository = new FriendRequestRepository();