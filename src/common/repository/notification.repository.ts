import { DatabaseRepository } from "./base.repository";
import { INotification } from "../interface/notification.interface";
import { NotificationModel } from "../../DB/model/notification.model";


export  class NotificationRepository extends DatabaseRepository<INotification> {
  constructor(){
    super(NotificationModel)
  }

  
}

export const notificationRepository = new NotificationRepository();