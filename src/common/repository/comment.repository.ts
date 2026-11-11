import { DatabaseRepository } from "./base.repository";
import { CommentModel} from "../../DB/model";
import { IComment } from "../interface";


export  class CommentRepository extends DatabaseRepository<IComment> {
  constructor(){
    super(CommentModel)
  }

  
}

export const commentRepository = new CommentRepository();